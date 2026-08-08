import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";

import HotelModal from "../components/HotelModal";
import HotelCard from "../components/HotelCard";
import HotelGroupModal from "../components/HotelGroupModal";

export default function HotelPage() {

  const { id, shareId } = useParams();

  const [searchParams] = useSearchParams();

  const targetGroupName =
    searchParams.get("group") || "";

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const readonly =
    !!shareId ||
    (trip ? !canEdit(trip) : true);

  const [showHotelModal, setShowHotelModal] =
    useState(false);

  const [showGroupModal, setShowGroupModal] =
    useState(false);

  const [editingHotel, setEditingHotel] =
    useState(null);

  const [copyingHotel, setCopyingHotel] =
    useState(false);

  const [editingGroup, setEditingGroup] =
    useState(null);

  const [currentGroupId, setCurrentGroupId] =
    useState(null);

  // =========================
  // 飯店群組收合狀態
  // =========================
  // true = 展開
  // false = 收合
  //
  // 不寫入 Firebase
  // 只控制目前畫面
  // =========================

  const [collapsedGroups, setCollapsedGroups] =
    useState({});

  useEffect(() => {

    async function loadTrip() {

      if (shareId) {

        const data = await getShare(shareId);

        setTrip(data);

      } else {

        setTrip(cloudTrip);

      }

    }

    loadTrip();

  }, [cloudTrip, shareId]);

  // =========================
// 飯店群組
// =========================

const hotelGroups = Array.isArray(trip?.hotelGroups)
  ? trip.hotelGroups
  : [];

useEffect(() => {

  if (!trip || !targetGroupName) return;

  const hotelGroups = Array.isArray(trip.hotelGroups)
    ? trip.hotelGroups
    : [];

  const targetGroup = hotelGroups.find(
    (group) =>
      group.title?.trim() ===
      targetGroupName.trim()
  );

  if (!targetGroup) return;

  // 自動展開指定群組
  setCollapsedGroups((prev) => ({
    ...prev,
    [targetGroup.id]: false,
  }));

  // 等畫面更新後捲到指定群組
  setTimeout(() => {

    const element = document.getElementById(
      `hotel-group-${targetGroup.id}`
    );

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  }, 150);

}, [trip, targetGroupName]);

  // =========================
  // 展開 / 收合群組
  // =========================

  function toggleGroup(groupId) {

    setCollapsedGroups((prev) => ({

      ...prev,

      [groupId]: !prev[groupId],

    }));

  }

  // =========================
  // 新增 / 修改群組
  // =========================

  async function handleSaveGroup(group) {

    if (shareId) return;

    const groups = [...hotelGroups];

    const index = groups.findIndex(
      (g) => g.id === group.id
    );

    if (index === -1) {

      groups.push(group);

    } else {

      groups[index] = group;

    }

    const updatedTrip = {

      ...trip,

      hotelGroups: groups,

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingGroup(null);

    setShowGroupModal(false);

  }

  // =========================
  // 刪除群組
  // =========================

  async function handleDeleteGroup(groupId) {

    if (shareId) return;

    const group = hotelGroups.find(
      (g) => g.id === groupId
    );

    if (!group) return;

    if (
      group.hotels?.length > 0 &&
      !window.confirm(
        "這個群組裡還有飯店，確定要連同群組一起刪除嗎？"
      )
    ) {
      return;
    }

    if (
      group.hotels?.length === 0 &&
      !window.confirm("確定刪除此住宿群組？")
    ) {
      return;
    }

    const updatedTrip = {

      ...trip,

      hotelGroups: hotelGroups.filter(
        (g) => g.id !== groupId
      ),

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

    // 順便移除收合狀態
    setCollapsedGroups((prev) => {

      const next = { ...prev };

      delete next[groupId];

      return next;

    });

  }

  // =========================
  // 新增 / 修改群組內飯店
  // =========================

  async function handleSaveHotel(hotel) {

    if (shareId) return;

    const groups = hotelGroups.map((group) => {

      if (group.id !== currentGroupId) {
        return group;
      }

      const hotels = [...(group.hotels || [])];

      const index = hotels.findIndex(
        (h) => h.id === hotel.id
      );

      if (index === -1) {

        hotels.push(hotel);

      } else {

        hotels[index] = hotel;

      }

      return {

        ...group,

        hotels,

      };

    });

    const updatedTrip = {

      ...trip,

      hotelGroups: groups,

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

    setEditingHotel(null);

    setCurrentGroupId(null);

    setShowHotelModal(false);

  }

  // =========================
  // 刪除群組內飯店
  // =========================

  async function handleDeleteHotel(
    groupId,
    hotelId
  ) {

    if (shareId) return;

    if (!window.confirm("確定刪除此飯店？")) {
      return;
    }

    const groups = hotelGroups.map((group) => {

      if (group.id !== groupId) {
        return group;
      }

      return {

        ...group,

        hotels: (group.hotels || []).filter(
          (hotel) => hotel.id !== hotelId
        ),

      };

    });

    const updatedTrip = {

      ...trip,

      hotelGroups: groups,

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);

  }

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="mx-auto max-w-md px-6 py-10">

        {/* =========================
            返回
        ========================= */}

        <Link
          to={
            shareId
              ? `/share/${shareId}`
              : `/trip/${id}`
          }
          className="text-blue-500"
        >
          ← 返回旅程
        </Link>


        {/* =========================
            標題
        ========================= */}

        <h1 className="mt-6 text-4xl font-bold">
          🏨 飯店
        </h1>


        {/* =========================
            新增群組
        ========================= */}

        {!readonly && (

          <button
            onClick={() => {

              setEditingGroup(null);

              setShowGroupModal(true);

            }}
            className="
              mt-8
              w-full
              rounded-2xl
              bg-blue-500
              py-4
              text-lg
              font-semibold
              text-white
              hover:bg-blue-600
            "
          >
            ＋ 新增住宿群組
          </button>

        )}


        {/* =========================
            群組
        ========================= */}

        <div className="mt-8 space-y-6">

          {hotelGroups.length === 0 ? (

            <div className="
              rounded-2xl
              bg-white
              p-8
              text-center
              text-gray-400
              shadow
            ">
              尚未建立住宿群組
            </div>

          ) : (

            hotelGroups.map((group) => {

              const isCollapsed =
                collapsedGroups[group.id] === true;

              return (

                <div
                id={`hotel-group-${group.id}`}
                key={group.id}
                className="
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow
                "
                >

                  {/* =========================
                      群組標題
                  ========================= */}

                  <div
                    onClick={() =>
                      toggleGroup(group.id)
                    }
                    className="
                      flex
                      cursor-pointer
                      items-center
                      justify-between
                      p-5
                      transition
                      hover:bg-gray-50
                    "
                  >

                    <div className="min-w-0">

                      <div className="
                        flex
                        items-center
                        gap-2
                        text-xl
                        font-bold
                      ">

                        <span className="text-base">
                          {isCollapsed ? "▶" : "▼"}
                        </span>

                        <span>
                          🏨 {group.title}
                        </span>

                      </div>

                      <div className="
                        mt-2
                        text-sm
                        text-gray-600
                      ">
                        📅 {group.checkIn || "--"} →{" "}
                        {group.checkOut || "--"}
                      </div>

                    </div>


                    {/* =========================
                        編輯 / 刪除
                    ========================= */}

                    {!readonly && (

                      <div
                        className="
                          ml-3
                          flex
                          shrink-0
                          gap-1
                        "
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <button
                          onClick={() => {

                            setEditingGroup(group);

                            setShowGroupModal(true);

                          }}
                          className="
                            rounded-lg
                            p-2
                            hover:bg-gray-100
                          "
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteGroup(group.id)
                          }
                          className="
                            rounded-lg
                            p-2
                            hover:bg-red-100
                          "
                        >
                          🗑️
                        </button>

                      </div>

                    )}

                  </div>


                  {/* =========================
                      群組內容
                  ========================= */}

                  {!isCollapsed && (

                    <div className="
                      border-t
                      border-gray-100
                      px-5
                      pb-5
                    ">

                      {/* 群組內飯店 */}

                      <div className="
                        mt-5
                        space-y-4
                      ">

                        {(group.hotels || []).length === 0 ? (

                          <div className="
                            rounded-xl
                            bg-gray-50
                            p-5
                            text-center
                            text-sm
                            text-gray-400
                          ">
                            尚未新增飯店
                          </div>

                        ) : (

                          group.hotels.map((hotel) => (

                            <HotelCard
                              key={hotel.id}
                              hotel={hotel}
                              readonly={readonly}

                              onEdit={() => {

                                setCurrentGroupId(
                                  group.id
                                );

                                setEditingHotel(hotel);

                                setShowHotelModal(true);

                              }}

                              onCopy={() => {

                                setCurrentGroupId(group.id);

                                setEditingHotel({
                                    ...hotel,
                                    id: Date.now(),
                                });

                                setCopyingHotel(true);

                                setShowHotelModal(true);

                                }}

                              onDelete={() => {

                                handleDeleteHotel(
                                  group.id,
                                  hotel.id
                                );

                              }}
                            />

                          ))

                        )}

                      </div>


                      {/* =========================
                          新增飯店
                      ========================= */}

                      {!readonly && (

                        <button
                          onClick={() => {

                            setCurrentGroupId(group.id);

                            setEditingHotel(null);

                            setCopyingHotel(false);

                            setShowHotelModal(true);

                            }}
                          className="
                            mt-5
                            w-full
                            rounded-xl
                            border
                            border-blue-200
                            bg-blue-50
                            py-3
                            font-semibold
                            text-blue-600
                            hover:bg-blue-100
                          "
                        >
                          ＋ 新增飯店
                        </button>

                      )}

                    </div>

                  )}

                </div>

              );

            })

          )}

        </div>


        {/* =========================
            舊版飯店資料
            保留，不刪除
        ========================= */}

{Array.isArray(trip?.hotels) &&
  trip.hotels.length > 0 && (

  <div className="mt-8">

    <div className="
      mb-3
      text-sm
      font-semibold
      text-gray-500
    ">
      舊版住宿資料
    </div>

    <div className="space-y-4">

      {trip.hotels.map((hotel) => (

        <HotelCard
          key={hotel.id}
          hotel={hotel}
          readonly={readonly}

          onEdit={() => {

            setCurrentGroupId(null);

            setEditingHotel(hotel);

            setCopyingHotel(false);

            setShowHotelModal(true);

          }}

          onDelete={() => {

            if (shareId) return;

            if (
              !window.confirm(
                "確定刪除此飯店？"
              )
            ) {
              return;
            }

            const updatedTrip = {

              ...trip,

              hotels:
                trip.hotels.filter(
                  (h) => h.id !== hotel.id
                ),

            };

            updateTrip(updatedTrip)
              .then(() => {

                setTrip(updatedTrip);

              });

          }}

        />

      ))}

    </div>

  </div>

)}


      </div>


      {/* =========================
          群組 Modal
      ========================= */}

      {!readonly && showGroupModal && (

        <HotelGroupModal
          group={editingGroup}

          onClose={() => {

            setEditingGroup(null);

            setShowGroupModal(false);

          }}

          onSave={handleSaveGroup}
        />

      )}


      {/* =========================
          飯店 Modal
      ========================= */}

      {!readonly && showHotelModal && (

        <HotelModal
            hotel={editingHotel}
            copyMode={copyingHotel}

            onClose={() => {

                setEditingHotel(null);

                setCopyingHotel(false);

                setCurrentGroupId(null);

                setShowHotelModal(false);

            }}

            onSave={handleSaveHotel}
            />

      )}

    </div>

  );

}