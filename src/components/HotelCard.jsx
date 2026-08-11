

export default function HotelCard({ hotel, roomNumber }) {
  const currencyMap = {
    JPY: { symbol: "¥", name: "日圓" },
    TWD: { symbol: "NT$", name: "台幣" },
    USD: { symbol: "$", name: "美元" },
    HKD: { symbol: "HK$", name: "港幣" },
    KRW: { symbol: "₩", name: "韓元" },
    CNY: { symbol: "¥", name: "人民幣" },
    EUR: { symbol: "€", name: "歐元" },
    GBP: { symbol: "£", name: "英鎊" },
    SGD: { symbol: "S$", name: "新加坡幣" },
    THB: { symbol: "฿", name: "泰銖" },
  };
  const currency = currencyMap[hotel.currency] || currencyMap.TWD;

  return (
    <div className="tm-room-card">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="font-bold text-blue-600">房間 {roomNumber}</div>
      </div>

      <div className="space-y-2 px-4 py-3 text-sm">
        {hotel.confirmation && (
          <div className="flex gap-3"><span className="w-20 shrink-0 text-slate-500">訂單編號</span><b className="break-all text-slate-800">{hotel.confirmation}</b></div>
        )}
        <div className="flex gap-3"><span className="w-20 shrink-0 text-slate-500">訂位姓名</span><b className="break-words text-blue-600">{hotel.bookingName || "未設定"}</b></div>
        {hotel.roomType && (
          <div className="flex gap-3"><span className="w-20 shrink-0 text-slate-500">房型</span><b className="break-words text-slate-800">{hotel.roomType}</b></div>
        )}
        {hotel.price !== "" && hotel.price !== null && hotel.price !== undefined && (
          <div className="flex gap-3"><span className="w-20 shrink-0 text-slate-500">價格</span><b className="text-emerald-600">{currency.symbol}{Number(hotel.price).toLocaleString()} <span className="font-normal text-slate-400">{currency.name}</span></b></div>
        )}
      </div>
    </div>
  );
}
