import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";

import TransportDataModal from "../components/TransportDataModal";
import TransportDataSection from "../components/TransportDataSection";

async function fileToDataUrl(file) {
  if (!file?.type?.startsWith("image/")) return null;

  const raw = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    img.onerror = () => resolve(raw);
    img.src = raw;
  });
}

export default function DataPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);

  const [trip, setTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

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
      <div className="flex min-h-screen items-center justify-center">
        載入中...
      </div>
    );
  }

  const readonly = !!shareId || !canEdit(trip);
  const groups = Array.isArray(trip.transportDataGroups)
    ? trip.transportDataGroups
    : [];

  async function save(updatedTrip) {
    if (!shareId) await updateTrip(updatedTrip);
    setTrip(updatedTrip);
  }

  async function handleSaveGroup(group) {
    const next = [...groups];
    const index = next.findIndex((item) => item.id === group.id);

    if (index === -1) next.push(group);
    else next[index] = group;

    await save({
      ...trip,
      transportDataGroups: next,
    });

    setEditingGroup(null);
    setShowModal(false);
  }

  async function handleDeleteGroup(groupId) {
    if (!window.confirm("確定刪除此資料群組？群組內圖片也會一起刪除。")) {
      return;
    }

    await save({
      ...trip,
      transportDataGroups: groups.filter((group) => group.id !== groupId),
    });
  }

  async function handleAddImages(group, files, input) {
    const list = Array.from(files || []);
    if (!list.length) return;

    const added = [];

    for (const file of list) {
      const dataUrl = await fileToDataUrl(file);
      if (!dataUrl) continue;

      added.push({
        id: `image-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        dataUrl,
      });
    }

    if (added.length) {
      const next = groups.map((item) =>
        item.id === group.id
          ? { ...item, images: [...(item.images || []), ...added] }
          : item
      );

      await save({
        ...trip,
        transportDataGroups: next,
      });
    }

    if (input) input.target.value = "";
  }

  return (
    <div className="bg-gray-100 pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 pt-2 sm:px-6">
        <TransportDataSection
          groups={groups}
          readonly={readonly}
          onAdd={() => {
            setEditingGroup(null);
            setShowModal(true);
          }}
          onEdit={(group) => {
            setEditingGroup(group);
            setShowModal(true);
          }}
          onDelete={handleDeleteGroup}
          onAddImage={handleAddImages}
        />
      </div>

      {!readonly && showModal && (
        <TransportDataModal
          group={editingGroup}
          onClose={() => {
            setEditingGroup(null);
            setShowModal(false);
          }}
          onSave={handleSaveGroup}
        />
      )}
    </div>
  );
}
