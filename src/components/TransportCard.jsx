import { useEffect, useRef, useState } from "react";
export default function TransportCard({ transport, onEdit, onDelete, readonly = false }) {
  const [showMenu, setShowMenu] = useState(false); const menuRef = useRef(null);
  useEffect(() => { const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); }; document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn); }, []);
  const dateText = transport.departureDate ? `${transport.departureDate}${transport.arrivalDate && transport.arrivalDate !== transport.departureDate ? ` → ${transport.arrivalDate}` : ""}` : transport.arrivalDate || "";
  return <article className="tm-transport-detail-card">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="tm-transport-detail-title break-words">{transport.type || "🚆 交通"} {transport.company || "未命名交通"}</h4>{dateText && <div className="mt-2 text-sm font-medium text-slate-500">📅 {dateText}</div>}</div>
      {!readonly && <div ref={menuRef} className="relative shrink-0"><button type="button" onClick={(e)=>{e.stopPropagation();setShowMenu(v=>!v)}} className="rounded-lg px-2 py-1 text-xl font-bold leading-none text-slate-400 hover:bg-slate-100">⋯</button>{showMenu&&<div className="absolute right-0 top-full z-40 mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5"><button type="button" onClick={()=>{setShowMenu(false);onEdit?.()}} className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100">✏️ 編輯</button><button type="button" onClick={()=>{setShowMenu(false);onDelete?.()}} className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">🗑️ 刪除</button></div>}</div>}
    </div>
    <div className="mt-4 space-y-2 text-sm text-slate-700">
      {transport.departureTime&&<div>🕒 {transport.departureLabel||"出發"}：<b>{transport.departureTime}</b></div>}
      {transport.arrivalTime&&<div>🕚 {transport.arrivalLabel||"抵達"}：<b>{transport.arrivalTime}</b></div>}
      {transport.from&&<div><span className="text-slate-400">📍 起點</span><br/><span className="break-words text-blue-600">{transport.from}</span></div>}
      {transport.to&&<div><span className="text-slate-400">📍 終點</span><br/><span className="break-words text-blue-600">{transport.to}</span></div>}
    </div>
    {(transport.departureDurationMinutes||transport.arrivalDurationMinutes)&&<div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">⏱️ 停留時間{transport.departureDurationMinutes?` · ${transport.departureDurationMinutes} 分鐘`:""}{transport.arrivalDurationMinutes?` · ${transport.arrivalDurationMinutes} 分鐘`:""}</div>}
    {transport.price&&<div className="mt-4 text-lg font-semibold text-emerald-600">💰 {Number(transport.price).toLocaleString()} {transport.currency||""}</div>}
    {transport.website&&<a href={transport.website} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-medium text-green-600 hover:underline">🌐 官方網站</a>}
    {transport.note&&<div className="tm-transport-detail-note mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">📝 {transport.note}</div>}
  </article>;
}
