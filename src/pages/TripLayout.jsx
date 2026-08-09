import {
  Link,
  Outlet,
  useLocation,
  useParams,
} from "react-router-dom";

import { useState } from "react";

import useTrip from "../hooks/useTrip";

import { createShare } from "../services/shareService";

import {
  canEdit,
  isOwner,
} from "../services/permissionService";

import MemberModal from "../components/MemberModal";


export default function TripLayout() {

  const { id } = useParams();

  const location = useLocation();

  const { trip } = useTrip(id);

  const [showMemberModal, setShowMemberModal] =
    useState(false);


  if (!trip) {

    return (
      <div className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-100
      ">
        載入中...
      </div>
    );

  }


  const editable = canEdit(trip);

  const owner = isOwner(trip);


  // =========================
  // 分享
  // =========================

  async function handleShare() {

    try {

      const shareId =
        Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase();


      await createShare(
        shareId,
        trip
      );


      const url =
        `${window.location.origin}/share/${shareId}`;


      await navigator.clipboard.writeText(url);


      alert(
        `分享連結已複製！\n\n${url}`
      );

    } catch (err) {

      console.error(err);

      alert("分享失敗");

    }

  }


  // =========================
  // 底部選單
  // =========================

  const menuItems = [

    {
      path: `/trip/${id}/itinerary`,
      icon: "🗓️",
      title: "行程",
    },

    {
      path: `/trip/${id}/flight`,
      icon: "✈️",
      title: "航班",
    },

    {
      path: `/trip/${id}/hotel`,
      icon: "🏨",
      title: "飯店",
    },

    {
      path: `/trip/${id}/transport`,
      icon: "🚆",
      title: "交通",
    },

    {
      path: `/trip/${id}/weather`,
      icon: "🌤️",
      title: "天氣",
    },

    {
      path: `/trip/${id}/expense`,
      icon: "💰",
      title: "花費",
    },

    {
      path: `/trip/${id}/packing`,
      icon: "🧳",
      title: "行李",
    },

  ];


  return (

    <div className="
      min-h-screen
      overflow-x-hidden
      bg-gray-100
    ">


      {/* =========================
          上方旅程資訊
      ========================= */}

      <div className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        pt-4
        sm:px-6
      ">


        {/* 回首頁 */}

        <Link
          to="/"
          className="
            text-sm
            text-blue-500
          "
        >
          ← 回首頁
        </Link>


        {/* 標題 */}

        <h1 className="
          mt-4
          break-words
          text-3xl
          font-bold
        ">
          {trip.title}
        </h1>


        {/* 分享 / 成員 */}

        {editable && (

          <div className="
            mt-4
            flex
            gap-3
          ">

            <button
              onClick={handleShare}
              className="
                flex-1
                rounded-xl
                bg-green-500
                py-3
                text-white
                transition
                hover:bg-green-600
              "
            >
              🔗 分享
            </button>


            <button
              onClick={() =>
                setShowMemberModal(true)
              }
              className="
                flex-1
                rounded-xl
                bg-blue-500
                py-3
                text-white
                transition
                hover:bg-blue-600
              "
            >
              👥 成員
            </button>

          </div>

        )}


        {/* 地點 */}

        <p className="
          mt-4
          text-sm
          text-gray-500
        ">
          📍 {trip.country}｜{trip.city}
        </p>


        {/* 日期 */}

        <p className="
          mt-1
          text-sm
          text-gray-500
        ">
          📅 {trip.startDate} ~ {trip.endDate}
        </p>


      </div>


      {/* =========================
          頁面內容
      ========================= */}

      <main className="
        mx-auto
        w-full
        max-w-6xl
        px-4
        pb-28
        pt-2
        sm:px-6
      ">

        <Outlet />

      </main>


      {/* =========================
          底部選單
      ========================= */}

      <nav className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-gray-200
        bg-white
        shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
      ">

        <div className="
          mx-auto
          flex
          w-full
          max-w-6xl
          overflow-x-auto
          px-2
          py-2
        ">

          {menuItems.map((item) => {

            const active =
              location.pathname === item.path;


            return (

              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex
                  min-w-[64px]
                  flex-1
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  px-2
                  py-1.5
                  text-center
                  transition
                  ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }
                `}
              >

                <span className="
                  text-xl
                  leading-none
                ">
                  {item.icon}
                </span>

                <span className="
                  mt-1
                  whitespace-nowrap
                  text-[11px]
                  font-medium
                ">
                  {item.title}
                </span>

              </Link>

            );

          })}

        </div>

      </nav>


      {/* =========================
          成員
      ========================= */}

      {editable && showMemberModal && (

        <MemberModal
          trip={trip}
          owner={owner}
          onClose={() =>
            setShowMemberModal(false)
          }
        />

      )}

    </div>

  );

}