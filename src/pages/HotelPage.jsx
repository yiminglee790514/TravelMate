import {
  Link,
  useParams,
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

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [trip, setTrip] = useState(null);

  const readonly =
    !!shareId ||
    (trip ? !canEdit(trip) : true);


  // =========================
  // Modal
  // =========================

  const [showHotelModal, setShowHotelModal] =
    useState(false);

  const [showGroupModal, setShowGroupModal] =
    useState(false);


  // =========================
  // 飯店
  // =========================

  const [editingHotel, setEditingHotel] =
    useState(null);

  const [copyingHotel, setCopyingHotel] =
    useState(false);


  // =========================
  // 群組
  // =========================

  const [editingGroup, setEditingGroup] =
    useState(null);

  const [currentGroupId, setCurrentGroupId] =
    useState(null);


  // =========================
  // 群組收合
  //
  // true = 收合
  // false = 展開
  //
  // 預設全部收合
  // =========================

  const [collapsedGroups, setCollapsedGroups] =
    useState({});


  // =========================
  // 載入旅程
  // =========================

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
  // 群組
  // =========================

  const hotelGroups =
    Array.isArray(trip?.hotelGroups)
      ? trip.hotelGroups
      : [];


  // 與花費、交通共用付款人名單
  const people = Array.isArray(trip?.expensePeople)
    ? trip.expensePeople
    : [];


  async function handleAddPerson(name) {

    if (shareId) return;

    const cleanName = name.trim();

    if (!cleanName) return;

    if (people.includes(cleanName)) return;

    const updatedTrip = {

      ...trip,

      expensePeople: [
        ...people,
        cleanName,
      ],

    };

    setTrip(updatedTrip);

    await updateTrip(updatedTrip);

  }


  // =========================
  // 第一次看到群組時
  // 全部預設收合
  // =========================

  useEffect(() => {

    if (!trip) return;

    setCollapsedGroups((prev) => {

      const next = { ...prev };

      hotelGroups.forEach((group) => {

        if (
          next[group.id] === undefined
        ) {

          next[group.id] = true;

        }

      });

      return next;

    });

  }, [trip]);


  // =========================
  // 展開 / 收合
  // =========================

  function toggleGroup(groupId) {

    setCollapsedGroups((prev) => ({

      ...prev,

      [groupId]:
        !prev[groupId],

    }));

  }


  // =========================
  // 新增 / 修改群組
  // =========================

  async function handleSaveGroup(group) {

    if (shareId) return;

    const groups = [
      ...hotelGroups,
    ];

    const index =
      groups.findIndex(
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

  async function handleDeleteGroup(
    groupId
  ) {

    if (shareId) return;

    const group =
      hotelGroups.find(
        (g) => g.id === groupId
      );

    if (!group) return;


    if (
      (group.hotels || []).length > 0
    ) {

      if (
        !window.confirm(
          "這個群組裡還有飯店，確定要連同群組一起刪除嗎？"
        )
      ) {

        return;

      }

    } else {

      if (
        !window.confirm(
          "確定刪除此住宿群組？"
        )
      ) {

        return;

      }

    }


    const updatedTrip = {

      ...trip,

      hotelGroups:
        hotelGroups.filter(
          (g) => g.id !== groupId
        ),

    };

    await updateTrip(updatedTrip);

    setTrip(updatedTrip);


    setCollapsedGroups((prev) => {

      const next = {
        ...prev,
      };

      delete next[groupId];

      return next;

    });

  }


  // =========================
  // 新增 / 修改 / 複製飯店
  //
  // targetGroupId：
  // 複製時可以指定其他群組
  // =========================

  async function handleSaveHotel(
    hotel,
    targetGroupId
  ) {

    if (shareId) return;


    const saveGroupId =
      targetGroupId ||
      currentGroupId;


    if (!saveGroupId) {

      alert(
        "找不到住宿群組"
      );

      return;

    }


    const targetGroup =
    hotelGroups.find(
        (group) =>
        String(group.id) ===
        String(saveGroupId)
    );


    if (!targetGroup) {

      alert(
        "找不到指定的住宿群組"
      );

      return;

    }


    const groups =
    hotelGroups.map((group) => {

        if (
        String(group.id) !==
        String(saveGroupId)
        ) {

        return group;

        }


        const hotels = [
          ...(group.hotels || []),
        ];


        // =========================
        // 複製
        // =========================

        if (copyingHotel) {

          const newHotel = {

            ...hotel,

            id: Date.now(),

            // 群組名稱就是飯店名稱
            name:
              group.title || hotel.name,

          };

          hotels.push(newHotel);


          return {

            ...group,

            hotels,

          };

        }


        // =========================
        // 新增 / 編輯
        // =========================

        const index =
          hotels.findIndex(
            (h) => h.id === hotel.id
          );


        const savedHotel = {

          ...hotel,

          // 群組名稱就是飯店名稱
          name:
            group.title || hotel.name,

        };


        if (index === -1) {

          hotels.push(savedHotel);

        } else {

          hotels[index] =
            savedHotel;

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

    setCopyingHotel(false);

    setCurrentGroupId(null);

    setShowHotelModal(false);

  }


  // =========================
  // 刪除飯店
  // =========================

  async function handleDeleteHotel(
    groupId,
    hotelId
  ) {

    if (shareId) return;


    if (
      !window.confirm(
        "確定刪除此飯店？"
      )
    ) {

      return;

    }


    const groups =
      hotelGroups.map((group) => {

        if (
          group.id !== groupId
        ) {

          return group;

        }


        return {

          ...group,

          hotels:
            (group.hotels || [])
              .filter(
                (hotel) =>
                  hotel.id !== hotelId
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


  // =========================
  // 新增飯店
  // =========================

  function openAddHotel(
    groupId
  ) {

    setCurrentGroupId(groupId);

    setEditingHotel(null);

    setCopyingHotel(false);

    setShowHotelModal(true);

  }


  // =========================
  // 編輯飯店
  // =========================

  function openEditHotel(
    groupId,
    hotel
  ) {

    setCurrentGroupId(groupId);

    setEditingHotel(hotel);

    setCopyingHotel(false);

    setShowHotelModal(true);

  }


  // =========================
  // 複製飯店
  // =========================

  function openCopyHotel(
    groupId,
    hotel
  ) {

    setCurrentGroupId(groupId);

    setEditingHotel({

      ...hotel,

      id: Date.now(),

    });

    setCopyingHotel(true);

    setShowHotelModal(true);

  }


  // =========================
  // 載入中
  // =========================

  if (!trip) {

    return (

      <div className="
        flex
        min-h-screen
        items-center
        justify-center
      ">
        載入中...
      </div>

    );

  }


  return (

    <div className="bg-gray-100">

      <div className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        pt-2
        sm:px-6
        ">


        


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
              mt-6
              w-full
              rounded-2xl
              bg-blue-500
              py-3.5
              text-base
              font-semibold
              text-white
              hover:bg-blue-600
              sm:mt-8
              sm:py-4
              sm:text-lg
            "
          >
            ＋ 新增住宿群組
          </button>

        )}


        {/* =========================
            群組
        ========================= */}

        <div className="
          mt-6
          space-y-4
          sm:mt-8
        ">

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
                  key={group.id}
                  id={`hotel-group-${group.id}`}
                  className="
                    overflow-visible
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
                      toggleGroup(
                        group.id
                      )
                    }
                    className="
                      flex
                      cursor-pointer
                      items-center
                      justify-between
                      p-4
                      transition
                      hover:bg-gray-50
                      sm:p-5
                    "
                  >

                    <div className="
                      min-w-0
                      flex-1
                    ">

                      <div className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                        text-lg
                        font-bold
                        sm:text-xl
                      ">

                        <span className="
                          shrink-0
                          text-sm
                        ">
                          {isCollapsed
                            ? "▶"
                            : "▼"}
                        </span>


                        <span className="
                          min-w-0
                          break-words
                        ">
                          🏨 {group.title}
                        </span>

                      </div>


                      <div className="
                        mt-1.5
                        pl-6
                        text-xs
                        text-gray-600
                        sm:text-sm
                      ">
                        📅{" "}
                        {group.checkIn ||
                          "--"}
                        {" → "}
                        {group.checkOut ||
                          "--"}
                      </div>

                    </div>


                    {/* =========================
                        群組操作
                    ========================= */}

                    {!readonly && (

                      <div
                        className="
                          ml-2
                          shrink-0
                        "
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <GroupMenu
                          onEdit={() => {

                            setEditingGroup(
                              group
                            );

                            setShowGroupModal(
                              true
                            );

                          }}

                          onDelete={() =>
                            handleDeleteGroup(
                              group.id
                            )
                          }

                        />

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
                      px-4
                      pb-4
                      sm:px-5
                      sm:pb-5
                    ">


                      <div className="
                        mt-4
                        space-y-4
                      ">

                        {(group.hotels || [])
                          .length === 0 ? (

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

                          group.hotels.map(
                            (hotel) => (

                              <HotelCard
                                key={hotel.id}
                                hotel={hotel}
                                readonly={readonly}

                                onEdit={() =>
                                  openEditHotel(
                                    group.id,
                                    hotel
                                  )
                                }

                                onCopy={() =>
                                  openCopyHotel(
                                    group.id,
                                    hotel
                                  )
                                }

                                onDelete={() =>
                                  handleDeleteHotel(
                                    group.id,
                                    hotel.id
                                  )
                                }
                              />

                            )
                          )

                        )}

                      </div>


                      {/* =========================
                          新增飯店
                      ========================= */}

                      {!readonly && (

                        <button
                          onClick={() =>
                            openAddHotel(
                              group.id
                            )
                          }
                          className="
                            mt-4
                            w-full
                            rounded-xl
                            border
                            border-blue-200
                            bg-blue-50
                            py-3
                            text-sm
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
            暫時保留
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

              {trip.hotels.map(
                (hotel) => (

                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    readonly={readonly}

                    onEdit={() => {

                      setCurrentGroupId(null);

                      setEditingHotel(
                        hotel
                      );

                      setCopyingHotel(
                        false
                      );

                      setShowHotelModal(
                        true
                      );

                    }}

                    onCopy={() => {

                      setCurrentGroupId(
                        null
                      );

                      setEditingHotel({

                        ...hotel,

                        id: Date.now(),

                      });

                      setCopyingHotel(
                        true
                      );

                      setShowHotelModal(
                        true
                      );

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
                            (h) =>
                              h.id !==
                              hotel.id
                          ),

                      };

                      updateTrip(
                        updatedTrip
                      ).then(() => {

                        setTrip(
                          updatedTrip
                        );

                      });

                    }}

                  />

                )
              )}

            </div>

          </div>

        )}


      </div>


      {/* =========================
          群組 Modal
      ========================= */}

      {!readonly &&
        showGroupModal && (

        <HotelGroupModal
          group={editingGroup}

          onClose={() => {

            setEditingGroup(null);

            setShowGroupModal(
              false
            );

          }}

          onSave={handleSaveGroup}

        />

      )}


      {/* =========================
          飯店 Modal
      ========================= */}

      {!readonly &&
        showHotelModal && (

        <HotelModal
          hotel={editingHotel}
          people={people}
          onAddPerson={handleAddPerson}
          copyMode={copyingHotel}

          hotelGroups={hotelGroups}
          currentGroupId={
            currentGroupId
          }

          onClose={() => {

            setEditingHotel(null);

            setCopyingHotel(false);

            setCurrentGroupId(null);

            setShowHotelModal(
              false
            );

          }}

          onSave={handleSaveHotel}

        />

      )}

    </div>

  );

}


// ==================================================
// 群組 ⋯ 選單
// ==================================================

function GroupMenu({
  onEdit,
  onDelete,
}) {

  const [open, setOpen] =
    useState(false);


  useEffect(() => {

    function handleOutsideClick(e) {

      if (
        !e.target.closest(
          "[data-group-menu]"
        )
      ) {

        setOpen(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  return (

    <div
      data-group-menu
      className="relative"
    >

      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        className="
          rounded-lg
          px-2
          py-1
          text-xl
          font-bold
          leading-none
          text-gray-500
          hover:bg-gray-100
        "
      >
        ⋯
      </button>


      {open && (

        <div className="
          absolute
          right-0
          top-full
          z-40
          mt-1
          w-28
          overflow-hidden
          rounded-xl
          bg-white
          shadow-xl
          ring-1
          ring-black/5
        ">

          <button
            type="button"
            onClick={() => {

              setOpen(false);

              onEdit();

            }}
            className="
              w-full
              px-4
              py-3
              text-left
              text-sm
              hover:bg-gray-100
            "
          >
            ✏️ 編輯
          </button>


          <button
            type="button"
            onClick={() => {

              setOpen(false);

              onDelete();

            }}
            className="
              w-full
              px-4
              py-3
              text-left
              text-sm
              text-red-600
              hover:bg-red-50
            "
          >
            🗑️ 刪除
          </button>

        </div>

      )}

    </div>

  );

}