import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";
import PackingGroupModal from "../components/packing/PackingGroupModal";
import PackingItemModal from "../components/packing/PackingItemModal";

const groupStyles = [
  {
    card: "border-blue-100 bg-blue-50/70",
    icon: "bg-blue-100",
    title: "text-blue-700",
    badge: "bg-blue-600 text-white",
  },
  {
    card: "border-orange-100 bg-orange-50/70",
    icon: "bg-orange-100",
    title: "text-orange-700",
    badge: "bg-orange-500 text-white",
  },
  {
    card: "border-emerald-100 bg-emerald-50/70",
    icon: "bg-emerald-100",
    title: "text-emerald-700",
    badge: "bg-emerald-600 text-white",
  },
  {
    card: "border-violet-100 bg-violet-50/70",
    icon: "bg-violet-100",
    title: "text-violet-700",
    badge: "bg-violet-600 text-white",
  },
  {
    card: "border-pink-100 bg-pink-50/70",
    icon: "bg-pink-100",
    title: "text-pink-700",
    badge: "bg-pink-600 text-white",
  },
  {
    card: "border-amber-100 bg-amber-50/70",
    icon: "bg-amber-100",
    title: "text-amber-700",
    badge: "bg-amber-500 text-white",
  },
];

function PackingGroupCard({
  group,
  index = 0,
  selected,
  readonly,
  onSelect,
  onEdit,
}) {
  const timerRef = useRef(null);
  const startPointRef = useRef(null);
  const longPressedRef = useRef(false);

  function clearLongPress() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handlePointerDown(event) {
    if (readonly) return;

    startPointRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    longPressedRef.current = false;
    clearLongPress();

    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onEdit(group);
    }, 650);
  }

  function handlePointerMove(event) {
    if (!startPointRef.current) return;

    const dx = Math.abs(event.clientX - startPointRef.current.x);
    const dy = Math.abs(event.clientY - startPointRef.current.y);

    // 左右滑動時不要誤觸發長按
    if (dx > 10 || dy > 10) {
      clearLongPress();
    }
  }

  function handlePointerUp() {
    clearLongPress();
    startPointRef.current = null;
  }

  useEffect(() => () => clearLongPress(), []);

  const unfinishedCount = (group.items || []).filter((item) => !item.checked).length;
  const style = groupStyles[index % groupStyles.length];

  return (
    <button
      type="button"
      onClick={(event) => {
        if (longPressedRef.current) {
          event.preventDefault();
          event.stopPropagation();
          longPressedRef.current = false;
          return;
        }
        onSelect();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(event) => event.preventDefault()}
      className={`tm-packing-group-chip ${style.card} ${selected ? "is-active" : ""}`}
    >
      <span className={`tm-packing-group-icon ${style.icon}`}>
        {group.icon || "📂"}
      </span>

      {unfinishedCount > 0 && (
        <span className={`tm-packing-group-badge ${style.badge}`}>
          {unfinishedCount}
        </span>
      )}

      <strong className={style.title}>{group.title || "未命名群組"}</strong>
      <small>{(group.items || []).length} 項物品</small>
    </button>
  );
}

export default function PackingPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);

  const [trip, setTrip] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (shareId) {
        const data = await getShare(shareId);
        if (active) setTrip(data);
      } else if (cloudTrip) {
        setTrip(cloudTrip);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [cloudTrip, shareId]);

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        載入中...
      </div>
    );
  }

  const readonly = !!shareId || !canEdit(trip);
  const groups = Array.isArray(trip.packing) ? trip.packing : [];
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || groups[0] || null;

  async function saveTrip(updatedTrip) {
    setTrip(updatedTrip);
    if (!readonly) await updateTrip(updatedTrip);
  }

  async function toggleItem(groupId, itemId) {
    if (readonly) return;

    const packing = groups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: (group.items || []).map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      };
    });

    await saveTrip({ ...trip, packing });
  }

  async function deleteGroup(groupId) {
    if (readonly) return;
    if (!window.confirm("確定刪除此群組？群組內物品也會一起刪除。")) return;

    const packing = groups.filter((group) => group.id !== groupId);
    await saveTrip({ ...trip, packing });
    if (selectedGroupId === groupId) setSelectedGroupId(packing[0]?.id || null);
    if (editGroup?.id === groupId) {
      setEditGroup(null);
      setShowGroupModal(false);
    }
  }

  async function deleteItem(groupId, itemId) {
    if (readonly) return;
    if (!window.confirm("確定刪除此物品？")) return;

    const packing = groups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: (group.items || []).filter((item) => item.id !== itemId),
      };
    });

    await saveTrip({ ...trip, packing });
  }

  return (
    <div className="min-h-full bg-slate-50 pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6">
        {/* 群組橫向滑動區 */}
        <div className="tm-packing-group-strip">
          <div className="tm-hotel-group-scroll tm-packing-group-scroll scrollbar-none">
            {groups.map((group, index) => (
              <PackingGroupCard
                key={group.id}
                group={group}
                index={index}
                selected={selectedGroup?.id === group.id}
                readonly={readonly}
                onSelect={() => setSelectedGroupId(group.id)}
                onEdit={(value) => {
                  setEditGroup(value);
                  setShowGroupModal(true);
                }}
              />
            ))}

            {!readonly && (
              <button
                type="button"
                onClick={() => {
                  setEditGroup(null);
                  setShowGroupModal(true);
                }}
                className="tm-packing-group-add-chip"
              >
                <span className="text-3xl font-light">＋</span>
                <span className="mt-1 text-sm font-bold">新增群組</span>
              </button>
            )}
          </div>
        </div>

        {/* 選取群組的物品 */}
        {selectedGroup ? (
          <section className="mt-3 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-2xl">{selectedGroup.icon || "📂"}</span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black text-slate-800">{selectedGroup.title}</h2>
                  <p className="text-xs text-slate-400">
                    {(selectedGroup.items || []).filter((item) => !item.checked).length} 項尚未完成
                  </p>
                </div>
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentGroupId(selectedGroup.id);
                    setEditItem(null);
                    setShowItemModal(true);
                  }}
                  className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600"
                >
                  ＋ 新增物品
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {(selectedGroup.items || []).length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-400">
                  這個群組還沒有物品
                </div>
              ) : (
                [...(selectedGroup.items || [])]
                  .sort((a, b) => Number(a.checked) - Number(b.checked))
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={!!item.checked}
                        disabled={readonly}
                        onChange={() => toggleItem(selectedGroup.id, item.id)}
                        className="h-5 w-5 accent-blue-600"
                      />
                      <button
                        type="button"
                        disabled={readonly}
                        onClick={() => {
                          if (readonly) return;
                          setCurrentGroupId(selectedGroup.id);
                          setEditItem(item);
                          setShowItemModal(true);
                        }}
                        className={`min-w-0 flex-1 text-left text-sm font-semibold ${item.checked ? "text-slate-400 line-through" : "text-slate-700"}`}
                      >
                        {item.name}
                      </button>
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => deleteItem(selectedGroup.id, item.id)}
                          className="shrink-0 rounded-full px-2 py-1 text-xs text-slate-300 hover:bg-red-50 hover:text-red-500"
                          aria-label="刪除物品"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </section>
        ) : (
          <section className="mt-3 rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
            <div className="text-4xl">🧳</div>
            <div className="mt-3 text-sm font-semibold text-slate-600">還沒有行李群組</div>
            {!readonly && (
              <button
                type="button"
                onClick={() => setShowGroupModal(true)}
                className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                ＋ 建立第一個群組
              </button>
            )}
          </section>
        )}
      </div>

      {!readonly && showGroupModal && (
        <PackingGroupModal
          group={editGroup}
          onDelete={editGroup ? () => deleteGroup(editGroup.id) : undefined}
          onClose={() => {
            setShowGroupModal(false);
            setEditGroup(null);
          }}
          onSave={async (data) => {
            let packing;

            if (editGroup) {
              packing = groups.map((group) =>
                group.id === editGroup.id
                  ? { ...group, title: data.title, icon: data.icon }
                  : group
              );
            } else {
              const newGroup = {
                id: Date.now(),
                title: data.title,
                icon: data.icon,
                items: [],
              };
              packing = [...groups, newGroup];
              setSelectedGroupId(newGroup.id);
            }

            await saveTrip({ ...trip, packing });
            setEditGroup(null);
            setShowGroupModal(false);
          }}
        />
      )}

      {!readonly && showItemModal && (
        <PackingItemModal
          item={editItem}
          onClose={() => {
            setShowItemModal(false);
            setEditItem(null);
          }}
          onSave={async (item) => {
            const packing = groups.map((group) => {
              if (group.id !== currentGroupId) return group;

              if (editItem) {
                return {
                  ...group,
                  items: (group.items || []).map((currentItem) =>
                    currentItem.id === item.id ? item : currentItem
                  ),
                };
              }

              return {
                ...group,
                items: [...(group.items || []), item],
              };
            });

            await saveTrip({ ...trip, packing });
            setShowItemModal(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}
