import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";

import TransportModal from "../components/TransportModal";
import TransportCard from "../components/TransportCard";
import TransportGroupModal from "../components/TransportGroupModal";
import { syncAutoItineraryItems } from "../services/itinerarySync";


function TransportGroupMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="rounded-lg px-2 py-1 text-xl font-bold text-gray-500 hover:bg-gray-100"
      >
        ⋯
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
          >
            ✏️ 編輯
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ 刪除
          </button>
        </div>
      )}
    </div>
  );
}

export default function TransportPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);

  const [trip, setTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [initialTransportGroup, setInitialTransportGroup] = useState("一般交通");

  const readonly = !!shareId || (trip ? !canEdit(trip) : true);

  useEffect(() => {
    async function loadTrip() {
      if (shareId) {
        setTrip(await getShare(shareId));
      } else {
        setTrip(cloudTrip);
      }
    }
    loadTrip();
  }, [cloudTrip, shareId]);

  useEffect(() => {
    if (!trip) return;

    const names = new Set([
      ...(Array.isArray(trip.transportGroups) ? trip.transportGroups : []),
      ...(trip.transports || []).map(
        (transport) => transport.group?.trim() || "一般交通"
      ),
    ]);

    setCollapsedGroups((prev) => {
      const next = { ...prev };
      names.forEach((name) => {
        if (next[name] === undefined) next[name] = true;
      });
      return next;
    });
  }, [trip]);

  if (!trip) {
    return <div className="flex min-h-screen items-center justify-center">載入中...</div>;
  }

  const people = Array.isArray(trip.expensePeople) ? trip.expensePeople : [];

  async function saveTrip(updatedTrip) {
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    if (!shareId) await updateTrip(updatedTrip);
    setTrip(updatedTrip);
  }

  async function handleAddPerson(name) {
    if (readonly) return;
    const cleanName = name.trim();
    if (!cleanName || people.includes(cleanName)) return;

    const updatedTrip = {
      ...trip,
      expensePeople: [...people, cleanName],
    };
    await saveTrip(updatedTrip);
  }

  async function handleSaveTransport(transport) {
    const transports = [...(trip.transports || [])];
    const index = transports.findIndex((item) => item.id === transport.id);

    if (index === -1) transports.push(transport);
    else transports[index] = transport;

    const existingGroups = Array.isArray(trip.transportGroups)
      ? trip.transportGroups
      : [];

    const groupName = transport.group?.trim() || "一般交通";
    const transportGroups = existingGroups.includes(groupName)
      ? existingGroups
      : [...existingGroups, groupName];

    await saveTrip({ ...trip, transports, transportGroups });
    setEditingTransport(null);
    setShowModal(false);
  }

  async function handleSaveGroup(group) {
    const newName = group.title.trim();
    if (!newName) return;

    const currentGroups = Array.isArray(trip.transportGroups)
      ? trip.transportGroups
      : [];

    if (editingGroup) {
      const oldName = editingGroup;

      if (
        newName !== oldName &&
        currentGroups.includes(newName)
      ) {
        alert("這個群組名稱已經存在");
        return;
      }

      const transportGroups = currentGroups.map((name) =>
        name === oldName ? newName : name
      );

      const transports = (trip.transports || []).map((transport) => {
        const current = transport.group?.trim() || "一般交通";
        return current === oldName
          ? { ...transport, group: newName }
          : transport;
      });

      await saveTrip({ ...trip, transportGroups, transports });
    } else {
      if (currentGroups.includes(newName)) {
        alert("這個群組名稱已經存在");
        return;
      }

      await saveTrip({
        ...trip,
        transportGroups: [...currentGroups, newName],
      });
    }

    setEditingGroup(null);
    setShowGroupModal(false);
  }

  async function handleDeleteTransport(transportId) {
    if (!window.confirm("確定刪除此交通？")) return;
    const transports = (trip.transports || []).filter((item) => item.id !== transportId);
    await saveTrip({ ...trip, transports });
  }

  async function handleDeleteGroup(groupName) {
    const transports = (trip.transports || []).filter(
      (transport) =>
        (transport.group?.trim() || "一般交通") !== groupName
    );

    const hasTransports =
      transports.length !== (trip.transports || []).length;

    if (
      hasTransports &&
      !window.confirm(
        `「${groupName}」群組裡還有交通，確定連同交通一起刪除嗎？`
      )
    ) {
      return;
    }

    const currentGroups = Array.isArray(trip.transportGroups)
      ? trip.transportGroups
      : [];

    const transportGroups = currentGroups.filter(
      (name) => name !== groupName
    );

    // 舊資料沒有 transportGroups 時，刪除後仍不會留下空群組。
    await saveTrip({
      ...trip,
      transports,
      transportGroups,
    });

    setCollapsedGroups((prev) => {
      const next = { ...prev };
      delete next[groupName];
      return next;
    });
  }

  const groupNames = Array.from(
    new Set([
      ...(Array.isArray(trip.transportGroups) ? trip.transportGroups : []),
      ...(trip.transports || []).map(
        (transport) => transport.group?.trim() || "一般交通"
      ),
    ])
  );

  if (groupNames.length === 0) groupNames.push("一般交通");

  const grouped = groupNames.map((groupName) => [
    groupName,
    (trip.transports || []).filter(
      (transport) =>
        (transport.group?.trim() || "一般交通") === groupName
    ),
  ]);

  return (
    <div className="bg-gray-100 pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 pt-2 sm:px-6">
        {!readonly && (
          <button
            onClick={() => {
              setEditingGroup(null);
              setShowGroupModal(true);
            }}
            className="mt-2 w-full rounded-2xl bg-blue-500 py-4 text-lg font-semibold text-white"
          >
            ＋ 新增群組
          </button>
        )}

        {grouped.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white p-8 text-center text-gray-400 shadow">
            尚未新增交通
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {grouped.map(([groupName, transports]) => {
              const isCollapsed = collapsedGroups[groupName] ?? true;

              return (
                <section key={groupName} className="overflow-visible rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCollapsedGroups((prev) => ({
                          ...prev,
                          [groupName]: !isCollapsed,
                        }))
                      }
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="text-gray-400">{isCollapsed ? "▶" : "▼"}</span>
                      <span className="truncate font-bold">🚆 {groupName}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {transports.length}
                      </span>
                    </button>

                    {!readonly && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTransport(null);
                            setInitialTransportGroup(groupName);
                            setShowModal(true);
                          }}
                          className="rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          ＋ 新增交通
                        </button>

                        <TransportGroupMenu
                          onEdit={() => {
                            setEditingGroup(groupName);
                            setShowGroupModal(true);
                          }}
                          onDelete={() => handleDeleteGroup(groupName)}
                        />
                      </div>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-3 p-3">
                      {transports.map((transport) => (
                        <TransportCard
                          key={transport.id}
                          transport={transport}
                          readonly={readonly}
                          onEdit={() => {
                            setEditingTransport(transport);
                            setShowModal(true);
                          }}
                          onDelete={() => handleDeleteTransport(transport.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {!readonly && showModal && (
        <TransportModal
          transport={editingTransport}
          initialGroup={initialTransportGroup}
          people={people}
          onAddPerson={handleAddPerson}
          onClose={() => {
            setEditingTransport(null);
            setInitialTransportGroup("一般交通");
            setShowModal(false);
          }}
          onSave={handleSaveTransport}
        />
      )}

      {!readonly && showGroupModal && (
        <TransportGroupModal
          group={editingGroup ? { title: editingGroup } : null}
          onClose={() => {
            setEditingGroup(null);
            setShowGroupModal(false);
          }}
          onSave={handleSaveGroup}
        />
      )}

    </div>
  );
}
