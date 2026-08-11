import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";
import { syncAutoItineraryItems } from "../services/itinerarySync";

import HotelModal from "../components/HotelModal";
import HotelGroupModal from "../components/HotelGroupModal";
import HotelCard from "../components/HotelCard";

export default function HotelPage() {
  const { id, shareId } = useParams();
  const { trip: cloudTrip, updateTrip } = useTrip(id);
  const [trip, setTrip] = useState(null);

  const readonly = !!shareId || (trip ? !canEdit(trip) : true);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [copyingHotel, setCopyingHotel] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("");

  useEffect(() => {
    async function loadTrip() {
      if (shareId) setTrip(await getShare(shareId));
      else setTrip(cloudTrip);
    }
    loadTrip();
  }, [cloudTrip, shareId]);

  const hotelGroups = Array.isArray(trip?.hotelGroups) ? trip.hotelGroups : [];
  const people = Array.isArray(trip?.expensePeople) ? trip.expensePeople : [];

  useEffect(() => {
    if (!hotelGroups.length) {
      setActiveGroupId("");
      return;
    }
    setActiveGroupId((prev) =>
      hotelGroups.some((group) => String(group.id) === String(prev))
        ? prev
        : String(hotelGroups[0].id)
    );
  }, [hotelGroups]);

  const activeGroup = useMemo(
    () => hotelGroups.find((group) => String(group.id) === String(activeGroupId)) || hotelGroups[0] || null,
    [hotelGroups, activeGroupId]
  );

  async function handleAddPerson(name) {
    if (shareId) return;
    const cleanName = name.trim();
    if (!cleanName || people.includes(cleanName)) return;
    const updatedTrip = { ...trip, expensePeople: [...people, cleanName] };
    setTrip(updatedTrip);
    await updateTrip(updatedTrip);
  }

  async function handleSaveGroup(group) {
    if (shareId) return;
    const groups = [...hotelGroups];
    const index = groups.findIndex((g) => String(g.id) === String(group.id));
    if (index === -1) groups.push(group);
    else groups[index] = group;

    const updatedTrip = { ...trip, hotelGroups: groups };
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    await updateTrip(updatedTrip);
    setTrip(updatedTrip);
    setEditingGroup(null);
    setShowGroupModal(false);
    setActiveGroupId(String(group.id));
  }

  async function handleDeleteGroup(groupId) {
    if (shareId) return;
    const group = hotelGroups.find((g) => String(g.id) === String(groupId));
    if (!group) return;

    const message = (group.hotels || []).length
      ? "這個群組裡還有房間，確定要連同群組一起刪除嗎？"
      : "確定刪除此住宿群組？";
    if (!window.confirm(message)) return;

    const groups = hotelGroups.filter((g) => String(g.id) !== String(groupId));
    const updatedTrip = { ...trip, hotelGroups: groups };
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    await updateTrip(updatedTrip);
    setTrip(updatedTrip);
    setActiveGroupId(groups[0] ? String(groups[0].id) : "");
  }

  async function handleSaveHotel(hotel, targetGroupId, options = {}) {
    if (shareId) return;

    let saveGroupId = targetGroupId || currentGroupId || "";
    const cleanName = String(hotel?.name || "").trim();
    if (!cleanName) {
      alert("請輸入飯店名稱");
      return;
    }

    // 第一次新增飯店：直接建立住宿群組 + 第一間房間。
    if (!saveGroupId) {
      const newGroup = {
        id: Date.now(),
        title: cleanName,
        checkIn: hotel.checkIn || "",
        checkOut: hotel.checkOut || "",
        hotels: [{ ...hotel, id: hotel.id || Date.now(), name: cleanName }],
      };
      const updatedTrip = { ...trip, hotelGroups: [...hotelGroups, newGroup] };
      updatedTrip.items = syncAutoItineraryItems(updatedTrip);
      await updateTrip(updatedTrip);
      setTrip(updatedTrip);
      setActiveGroupId(String(newGroup.id));
      closeHotelModal();
      return;
    }

    const groups = hotelGroups.map((group) => {
      if (String(group.id) !== String(saveGroupId)) return group;

      const hotels = [...(group.hotels || [])];
      const savedHotel = {
        ...hotel,
        id: options.copy ? Date.now() : (hotel.id || Date.now()),
        name: cleanName,
      };

      const index = hotels.findIndex((h) => String(h.id) === String(hotel.id));
      if (options.copy || index === -1) hotels.push(savedHotel);
      else hotels[index] = savedHotel;

      return {
        ...group,
        title: cleanName || group.title,
        checkIn: hotel.checkIn || group.checkIn || "",
        checkOut: hotel.checkOut || group.checkOut || "",
        hotels,
      };
    });

    const updatedTrip = { ...trip, hotelGroups: groups };
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    await updateTrip(updatedTrip);
    setTrip(updatedTrip);
    setActiveGroupId(String(saveGroupId));
    closeHotelModal();
  }

  async function handleSaveHotelGroup(groupData) {
    if (shareId) return;

    const saveGroupId = currentGroupId || activeGroup?.id;
    if (!saveGroupId) return;

    const groups = hotelGroups.map((group) => {
      if (String(group.id) !== String(saveGroupId)) return group;

      const shared = {
        name: groupData.name,
        checkIn: groupData.checkIn,
        checkOut: groupData.checkOut,
        checkInTime: groupData.checkInTime,
        checkOutTime: groupData.checkOutTime,
        address: groupData.address,
        phone: groupData.phone,
        website: groupData.website,
        booking: groupData.booking,
        note: groupData.note,
      };

      const hotels = (groupData.rooms || []).map((room, index) => ({
        ...room,
        id: room.id || Date.now() + index,
        ...shared,
      }));

      return {
        ...group,
        title: groupData.name,
        checkIn: groupData.checkIn,
        checkOut: groupData.checkOut,
        hotels,
      };
    });

    const updatedTrip = { ...trip, hotelGroups: groups };
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    await updateTrip(updatedTrip);
    setTrip(updatedTrip);
    setActiveGroupId(String(saveGroupId));
    closeHotelModal();
  }

  async function handleDeleteHotel(groupId, hotelId) {
    if (shareId) return;
    if (!window.confirm("確定刪除此房間資料？")) return;

    const groups = hotelGroups.map((group) => {
      if (String(group.id) !== String(groupId)) return group;
      return { ...group, hotels: (group.hotels || []).filter((hotel) => String(hotel.id) !== String(hotelId)) };
    });

    const updatedTrip = { ...trip, hotelGroups: groups };
    updatedTrip.items = syncAutoItineraryItems(updatedTrip);
    await updateTrip(updatedTrip);
    setTrip(updatedTrip);
  }

  function openAddHotel(groupId = "") {
    setCurrentGroupId(String(groupId || ""));
    setEditingHotel(null);
    setCopyingHotel(false);
    setShowHotelModal(true);
  }

  function openEditHotel(groupId, hotel) {
    setCurrentGroupId(String(groupId));
    setEditingHotel(hotel);
    setCopyingHotel(false);
    setShowHotelModal(true);
  }

  function openCopyHotel(groupId, hotel) {
    setCurrentGroupId(String(groupId));
    setEditingHotel({ ...hotel, id: Date.now() });
    setCopyingHotel(true);
    setShowHotelModal(true);
  }

  function closeHotelModal() {
    setEditingHotel(null);
    setCopyingHotel(false);
    setCurrentGroupId("");
    setShowHotelModal(false);
  }

  if (!trip) {
    return <div className="flex min-h-screen items-center justify-center">載入中...</div>;
  }

  const rooms = activeGroup?.hotels || [];
  const firstHotel = rooms[0] || {};

  return (
    <div className="bg-gray-100">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-2 sm:px-6">
        {/* 住宿群組：最上方橫向滑動，最右側新增群組 */}
        {hotelGroups.length > 0 && (
          <div className="tm-hotel-group-strip">
            <div className="tm-hotel-group-scroll scrollbar-none">
              {hotelGroups.map((group) => {
                const active = String(group.id) === String(activeGroup?.id);
                return (
                  <HotelGroupChip
                    key={group.id}
                    group={group}
                    active={active}
                    readonly={readonly}
                    onSelect={() => setActiveGroupId(String(group.id))}
                    onLongPress={() => {
                      if (readonly) return;
                      setEditingGroup(group);
                      setShowGroupModal(true);
                    }}
                  />
                );
              })}

              {!readonly && (
                <button
                  type="button"
                  onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
                  className="tm-hotel-group-add-chip"
                >
                  <strong>＋ 新增群組</strong>
                </button>
              )}
            </div>
          </div>
        )}

        {hotelGroups.length === 0 ? (
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            {!readonly && (
              <button
                type="button"
                onClick={() => openAddHotel()}
                className="tm-hotel-empty-button"
              >
                <span className="text-2xl">＋</span>
                <span>新增飯店</span>
              </button>
            )}
            {readonly && <div className="py-10 text-center text-gray-400">尚未新增飯店</div>}
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
            {/* 飯店基本資料：標題直接顯示飯店名 */}
            <div className="px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="tm-hotel-detail-title truncate">
                    🏨 {firstHotel.name || activeGroup?.title || "未命名飯店"}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                    <span>📅 {formatHotelDetailDate(activeGroup?.checkIn)}~{formatHotelDetailDate(activeGroup?.checkOut)}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                      {getNights(activeGroup?.checkIn, activeGroup?.checkOut)} 晚
                    </span>
                  </div>
                </div>
                {!readonly && rooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openEditHotel(activeGroup.id, firstHotel)}
                    className="rounded-lg px-2 py-1 text-xl font-bold leading-none text-slate-400 hover:bg-slate-100"
                    aria-label="修改住宿資料"
                  >
                    ⋯
                  </button>
                )}
              </div>
            </div>

            {/* 共用住宿資訊 */}
            {rooms.length > 0 && (
              <div className="px-5 py-4 sm:px-7">
                <div className="space-y-2 text-sm text-slate-700">
                  {firstHotel.checkInTime && <div>🕒 Check in：<b>{firstHotel.checkInTime}</b></div>}
                  {firstHotel.checkOutTime && <div>🕚 Check out：<b>{firstHotel.checkOutTime}</b></div>}
                </div>
                {firstHotel.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(firstHotel.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block break-words text-sm font-medium text-blue-600 hover:underline"
                  >
                    📍 {firstHotel.address}
                  </a>
                )}
                {firstHotel.website && (
                  <a href={firstHotel.website} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-medium text-green-600 hover:underline">
                    🌐 官方網站
                  </a>
                )}
              </div>
            )}

            {/* 房間資料 */}
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              {rooms.length > 0 && (
                <div className="tm-room-section-header">
                  <span className="font-bold text-slate-800">🛏️ 房間資料</span>
                  <span className="tm-room-count">共 {rooms.length} 間</span>
                </div>
              )}

              <div className="space-y-3">
              {rooms.length === 0 ? (
                !readonly && (
                  <button
                    type="button"
                    onClick={() => openAddHotel(activeGroup.id)}
                    className="tm-hotel-empty-button"
                  >
                    <span className="text-2xl">＋</span>
                    <span>新增飯店</span>
                  </button>
                )
              ) : (
                rooms.map((hotel, index) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    roomNumber={index + 1}
                    readonly={readonly}
                    onEdit={() => openEditHotel(activeGroup.id, hotel)}
                    onCopy={() => openCopyHotel(activeGroup.id, hotel)}
                    onDelete={() => handleDeleteHotel(activeGroup.id, hotel.id)}
                  />
                ))
              )}
              </div>
            </div>
          </div>
        )}
      </div>

      {!readonly && showGroupModal && (
        <HotelGroupModal
          group={editingGroup}
          onClose={() => {
            setEditingGroup(null);
            setShowGroupModal(false);
          }}
          onSave={handleSaveGroup}
          onDelete={editingGroup ? async () => {
            await handleDeleteGroup(editingGroup.id);
            setEditingGroup(null);
            setShowGroupModal(false);
          } : null}
        />
      )}

      {!readonly && showHotelModal && (
        <HotelModal
          hotel={editingHotel}
          people={people}
          onAddPerson={handleAddPerson}
          copyMode={copyingHotel}
          hotelGroups={hotelGroups}
          currentGroupId={currentGroupId}
          trip={trip}
          onClose={closeHotelModal}
          rooms={rooms}
          groupEdit={!!editingHotel && !copyingHotel}
          onSaveGroup={handleSaveHotelGroup}
          onSave={(hotel, targetGroupId) =>
            handleSaveHotel(hotel, targetGroupId, { copy: copyingHotel })
          }
        />
      )}
    </div>
  );
}

function formatHotelDetailDate(value) {
  if (!value) return "--";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}/${match[2]}/${match[3]}` : String(value);
}

function formatHotelDate(value) {
  if (!value) return "--";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[2]}/${match[3]}` : String(value);
}

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const nights = Math.round((end - start) / 86400000);
  return Math.max(0, nights);
}

function HotelGroupChip({ group, active, readonly, onSelect, onLongPress }) {
  const timerRef = useRef(null);
  const startPointRef = useRef(null);
  const longPressedRef = useRef(false);

  function clearLongPress() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handlePointerDown(event) {
    if (readonly) return;
    startPointRef.current = { x: event.clientX, y: event.clientY };
    longPressedRef.current = false;
    clearLongPress();
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, 650);
  }

  function handlePointerMove(event) {
    if (!startPointRef.current) return;
    const dx = Math.abs(event.clientX - startPointRef.current.x);
    const dy = Math.abs(event.clientY - startPointRef.current.y);
    if (dx > 10 || dy > 10) clearLongPress();
  }

  function handlePointerUp() {
    clearLongPress();
    startPointRef.current = null;
  }

  function handleClick(event) {
    if (longPressedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      longPressedRef.current = false;
      return;
    }
    onSelect();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(event) => event.preventDefault()}
      className={`tm-hotel-group-chip ${active ? "is-active" : ""}`}
    >
      <strong>{group.title || "未命名住宿"}</strong>
      <span>{formatHotelDate(group.checkIn)}~{formatHotelDate(group.checkOut)}</span>
    </button>
  );
}