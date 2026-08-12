import { Link } from "react-router-dom";
import { isOwner } from "../services/permissionService";
import { useEffect, useRef, useState } from "react";
import { getTripCover } from "./trip/tripCovers";

function getTripStatus(startDate, endDate) {
  if (!startDate || !endDate) return "尚未設定日期";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (today < start) return `還有 ${Math.ceil((start - today) / 86400000)} 天`;
  if (today > end) return "已完成";
  return `Day ${Math.floor((today - start) / 86400000) + 1}`;
}
function formatDate(date) {
  return date ? String(date).replaceAll("-", "/") : "----/--/--";
}

function formatMobileDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "----/--/--";
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const endShort = end.slice(5);
  return `${start} → ${endShort}`;
}
function getFlag(country) {
  const flags = { 日本:"🇯🇵", 韓國:"🇰🇷", 香港:"🇭🇰", 台灣:"🇹🇼", 泰國:"🇹🇭", 美國:"🇺🇸", 新加坡:"🇸🇬", 越南:"🇻🇳", 法國:"🇫🇷", 英國:"🇬🇧" };
  return flags[country] || "🌍";
}

export default function TripCard({ trip, onDelete, onEdit, onCopy }) {
  const itemCount = trip.items?.length || 0;
  const owner = isOwner(trip);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const cover = getTripCover(trip.country);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Link to={`/trip/${trip.id}`} className="block">
      <div className="relative overflow-visible rounded-[1.55rem] bg-white p-3.5 sm:p-3.5 shadow-[0_8px_30px_rgba(42,73,125,0.10)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(42,73,125,0.14)]">
        {owner && (
          <div ref={menuRef} className="absolute right-4 top-4 z-20">
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu((prev) => !prev); }} className="rounded-full bg-white/90 px-2 py-1 text-xl font-black leading-none text-slate-500 shadow-sm backdrop-blur" aria-label="更多">•••</button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onEdit(trip); }} className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50">✏️ 編輯</button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); onCopy?.(trip); }} className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50">📋 複製</button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); if (window.confirm(`確定要刪除「${trip.title}」嗎？`)) onDelete(trip.id); }} className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">🗑️ 刪除</button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-[150px] w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-[178px] sm:w-[126px]">
            <img src={cover.image} alt="" className="h-full w-full object-cover" style={{ objectPosition: cover.position }} />
          </div>
          <div className="min-w-0 flex-1 py-1 pr-1 sm:py-2 sm:pr-2">
            <div className="pr-8 text-[1.15rem] font-black leading-tight text-slate-950">{trip.title}</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500"><span className="text-red-500">●</span>{trip.city || "未設定城市"} · {getFlag(trip.country)} {trip.country || "未設定"}</div>
            <div className="mt-3 overflow-hidden rounded-2xl bg-slate-50/90 sm:mt-5">
              <div className="flex items-start gap-2 border-b border-white px-3 py-2.5 text-sm font-semibold text-slate-700">
                <span className="shrink-0 text-blue-500">▣</span>
                <span className="min-w-0 flex-1">
                  <span className="hidden sm:inline">{formatDate(trip.startDate)} ～ {formatDate(trip.endDate)}</span>
                  <span className="sm:hidden">{formatMobileDateRange(trip.startDate, trip.endDate)}</span>
                </span>
                <span className="shrink-0 text-slate-400">›</span>
              </div>
              <div className="flex items-center gap-2 border-b border-white px-3 py-2.5 text-sm font-semibold text-blue-600"><span>⌛</span><span>{getTripStatus(trip.startDate, trip.endDate)}</span><span className="ml-auto text-slate-400">›</span></div>
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700"><span>🧳</span><span>{itemCount} 個行程</span><span className="ml-auto text-slate-400">›</span></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
