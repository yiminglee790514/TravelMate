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

    {
      path: `/trip/${id}/data`,
      icon: "📁",
      title: "資料",
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
        pb-32
        pt-2
        sm:px-6
      ">

        <Outlet />

      </main>


      {/* =========================
          浮動底部選單
      ========================= */}

      <nav
        className="
          fixed
          bottom-[calc(0.75rem+env(safe-area-inset-bottom))]
          left-3
          right-3
          z-50
          rounded-3xl
          border
          border-gray-200/80
          bg-white/95
          p-2
          shadow-[0_8px_30px_rgba(0,0,0,0.14)]
          backdrop-blur-md
          sm:left-1/2
          sm:right-auto
          sm:w-max
          sm:max-w-[calc(100vw-1.5rem)]
          sm:-translate-x-1/2
        "
      >
        {/* 一直維持單行，手機可左右滑動 */}
        <div className="
          flex
          w-max
          min-w-0
          max-w-full
          gap-1
          overflow-x-auto
          overflow-y-hidden
          overscroll-x-contain
          scrollbar-none
        ">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex
                  w-[68px]
                  shrink-0
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  px-1
                  py-2
                  text-center
                  transition
                  ${active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"}
                `}
              >
                <span className="text-xl leading-none sm:text-2xl">
                  {item.icon}
                </span>
                <span className="mt-1 whitespace-nowrap text-[10px] font-medium sm:text-xs">
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