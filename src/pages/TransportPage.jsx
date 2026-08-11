import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";
import { syncAutoItineraryItems } from "../services/itinerarySync";
import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";
import TransportGroupModal, { getTransportGroupIcon } from "../components/TransportGroupModal";

function getGroupName(group) {
  return typeof group === "string" ? group : String(group?.title || "一般交通");
}

function getFirstDate(transports = []) {
  return transports
    .map((t) => t?.departureDate || t?.arrivalDate || "9999-12-31")
    .sort()[0] || "9999-12-31";
}

function TransportGroupChip({ groupName, icon, active, onSelect, onLongPress }) {
  const timerRef = useRef(null);
  const suppressClickRef = useRef(false);

  function clearPressTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearPressTimer();
    suppressClickRef.current = false;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      suppressClickRef.current = true;
      onLongPress?.();
    }, 600);
  }

  function handlePointerUp() {
    clearPressTimer();
  }

  function handlePointerCancel() {
    clearPressTimer();
  }

  function handleClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect();
  }

  useEffect(() => () => clearPressTimer(), []);

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      className={`tm-transport-group-chip ${active ? "is-active" : ""}`}
      title="點一下查看，長按編輯群組"
    >
      <span className="tm-transport-group-icon">{icon}</span>
      <strong>{groupName}</strong>
    </button>
  );
}

export default function TransportPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);
  const [trip, setTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [initialTransportGroup, setInitialTransportGroup] = useState("");
  const [activeGroupName, setActiveGroupName] = useState("");

  const readonly = !!shareId || (trip ? !canEdit(trip) : true);

  useEffect(() => {
    async function load() {
      if (shareId) setTrip(await getShare(shareId));
      else setTrip(cloudTrip);
    }
    load();
  }, [cloudTrip, shareId]);

  const transportGroups = useMemo(() => {
    if (!trip) return [];

    const explicit = Array.isArray(trip.transportGroups) ? trip.transportGroups : [];
    const names = new Set(explicit.map(getGroupName));

    (trip.transports || []).forEach((transport) => {
      names.add(transport.group?.trim() || "一般交通");
    });

    return [...names]
      .map((name) => ({
        name,
        icon: trip.transportGroupIcons?.[name] || getTransportGroupIcon(name),
        transports: (trip.transports || []).filter(
          (transport) => (transport.group?.trim() || "一般交通") === name
        ),
      }))
      .sort((a, b) => {
        const dateA = getFirstDate(a.transports);
        const dateB = getFirstDate(b.transports);
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return a.name.localeCompare(b.name, "zh-Hant");
      });
  }, [trip]);

  useEffect(() => {
    if (!transportGroups.length) {
      setActiveGroupName("");
      return;
    }

    setActiveGroupName((prev) =>
      transportGroups.some((group) => group.name === prev)
        ? prev
        : transportGroups[0].name
    );
  }, [transportGroups]);

  if (!trip) {
    return <div className="flex min-h-screen items-center justify-center">載入中...</div>;
  }

  const activeGroup =
    transportGroups.find((group) => group.name === activeGroupName) ||
    transportGroups[0];
  const people = Array.isArray(trip.expensePeople) ? trip.expensePeople : [];

  function saveTrip(updated) {
    const next = { ...updated, items: syncAutoItineraryItems(updated) };
    setTrip(next);

    if (!shareId) {
      // 不等待 Firestore，先讓畫面完成；背景寫入失敗再提示。
      void updateTrip(next).catch((error) => {
        console.error("交通資料儲存失敗", error);
        alert(error?.message || "儲存失敗，請稍後再試。");
      });
    }
  }

  function saveTransport(transport) {
    const transports = [...(trip.transports || [])];
    const index = transports.findIndex((item) => String(item.id) === String(transport.id));

    if (index < 0) transports.push(transport);
    else transports[index] = transport;

    const groups = Array.isArray(trip.transportGroups)
      ? trip.transportGroups.map(getGroupName)
      : [];
    const name = transport.group?.trim() || activeGroupName || "一般交通";
    const transportGroups = groups.includes(name) ? groups : [...groups, name];
    const transportGroupIcons = {
      ...(trip.transportGroupIcons || {}),
      [name]: trip.transportGroupIcons?.[name] || getTransportGroupIcon(name),
    };

    saveTrip({ ...trip, transports, transportGroups, transportGroupIcons });
    setActiveGroupName(name);
    setEditingTransport(null);
    setShowModal(false);
    setInitialTransportGroup("");
  }

  function openGroupEditor(name) {
    if (readonly) return;
    setEditingGroup(name);
    setShowGroupModal(true);
  }

  function saveGroup(group) {
    const newName = String(group.title || "").trim();
    if (!newName) return;

    const current = Array.isArray(trip.transportGroups)
      ? trip.transportGroups.map(getGroupName)
      : [];

    if (editingGroup) {
      const oldName = editingGroup;
      if (newName !== oldName && current.includes(newName)) {
        alert("這個群組名稱已經存在");
        return;
      }

      const transportGroups = current.map((name) =>
        name === oldName ? newName : name
      );
      const transports = (trip.transports || []).map((transport) =>
        (transport.group?.trim() || "一般交通") === oldName
          ? { ...transport, group: newName }
          : transport
      );
      const icons = { ...(trip.transportGroupIcons || {}) };
      delete icons[oldName];
      icons[newName] = group.icon || "🧭";

      saveTrip({
        ...trip,
        transportGroups,
        transports,
        transportGroupIcons: icons,
      });
    } else {
      if (current.includes(newName)) {
        alert("這個群組名稱已經存在");
        return;
      }

      saveTrip({
        ...trip,
        transportGroups: [...current, newName],
        transportGroupIcons: {
          ...(trip.transportGroupIcons || {}),
          [newName]: group.icon || "🧭",
        },
      });
    }

    setActiveGroupName(newName);
    setEditingGroup(null);
    setShowGroupModal(false);
  }

  function deleteGroup(name) {
    const transports = (trip.transports || []).filter(
      (transport) => (transport.group?.trim() || "一般交通") !== name
    );

    if (
      transports.length !== (trip.transports || []).length &&
      !window.confirm(`「${name}」群組裡還有交通，確定連同交通一起刪除嗎？`)
    ) {
      return;
    }

    const groups = (Array.isArray(trip.transportGroups)
      ? trip.transportGroups.map(getGroupName)
      : []
    ).filter((groupName) => groupName !== name);

    const icons = { ...(trip.transportGroupIcons || {}) };
    delete icons[name];

    saveTrip({
      ...trip,
      transports,
      transportGroups: groups,
      transportGroupIcons: icons,
    });

    const nextGroup = groups
      .map((groupName) => transportGroups.find((group) => group.name === groupName))
      .filter(Boolean)
      .sort((a, b) => getFirstDate(a.transports).localeCompare(getFirstDate(b.transports)))[0];

    setActiveGroupName(nextGroup?.name || "");
    setEditingGroup(null);
    setShowGroupModal(false);
  }

  function openAddTransport() {
    setEditingTransport(null);
    setInitialTransportGroup(activeGroup?.name || "一般交通");
    setShowModal(true);
  }

  function openEditTransport(transport) {
    setEditingTransport(transport);
    setInitialTransportGroup(transport.group || activeGroup?.name || "一般交通");
    setShowModal(true);
  }

  function deleteTransport(transportId) {
    if (!window.confirm("確定刪除此交通？")) return;
    saveTrip({
      ...trip,
      transports: (trip.transports || []).filter(
        (transport) => String(transport.id) !== String(transportId)
      ),
    });
  }

  return (
    <div className="bg-gray-100 pb-28">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 sm:px-6">
        {/* 交通群組：只顯示圖示＋名稱。點一下切換，長按編輯。 */}
        <div className="tm-hotel-group-strip tm-transport-group-strip">
          <div className="tm-hotel-group-scroll scrollbar-none">
            {transportGroups.map((group) => (
              <div key={group.name} className="relative shrink-0">
                <TransportGroupChip
                  groupName={group.name}
                  icon={group.icon}
                  active={group.name === activeGroup?.name}
                  onSelect={() => setActiveGroupName(group.name)}
                  onLongPress={() => openGroupEditor(group.name)}
                />
              </div>
            ))}

            {!readonly && (
              <button
                type="button"
                onClick={() => {
                  setEditingGroup(null);
                  setShowGroupModal(true);
                }}
                className="tm-hotel-group-add-chip"
              >
                ＋ 新增群組
              </button>
            )}
          </div>
        </div>

        {!activeGroup ? (
          <div className="mt-4 rounded-3xl bg-white p-8 text-center text-slate-400 shadow-sm">
            尚未新增交通群組
          </div>
        ) : (
          <section className="mt-4">
            <div>
              {activeGroup.transports.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  這個群組目前沒有交通資料
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGroup.transports.map((transport) => (
                    <TransportCard
                      key={transport.id}
                      transport={transport}
                      readonly={readonly}
                      onEdit={() => openEditTransport(transport)}
                      onDelete={() => deleteTransport(transport.id)}
                    />
                  ))}
                </div>
              )}

              {!readonly && (
                <button
                  type="button"
                  onClick={openAddTransport}
                  className="tm-hotel-empty-button mt-5"
                >
                  ＋ 新增交通
                </button>
              )}
            </div>
          </section>
        )}
      </div>

      {!readonly && showModal && (
        <TransportModal
          transport={editingTransport}
          initialGroup={initialTransportGroup}
          groupNames={transportGroups.map((group) => group.name)}
          groupIcons={trip.transportGroupIcons || {}}
          trip={trip}
          people={people}
          onAddPerson={(name) => {
            const clean = name.trim();
            if (!clean || people.includes(clean)) return;
            const updated = { ...trip, expensePeople: [...people, clean] };
            setTrip(updated);
            void updateTrip(updated);
          }}
          onClose={() => {
            setEditingTransport(null);
            setShowModal(false);
            setInitialTransportGroup("");
          }}
          onSave={saveTransport}
        />
      )}

      {!readonly && showGroupModal && (
        <TransportGroupModal
          group={editingGroup ? {
            title: editingGroup,
            icon: trip.transportGroupIcons?.[editingGroup],
          } : null}
          groupIcons={trip.transportGroupIcons || {}}
          onClose={() => {
            setEditingGroup(null);
            setShowGroupModal(false);
          }}
          onDelete={editingGroup ? () => deleteGroup(editingGroup) : undefined}
          onSave={saveGroup}
        />
      )}
    </div>
  );
}
