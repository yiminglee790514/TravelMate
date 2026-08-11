import { useEffect, useRef, useState } from "react";

function getTypeParts(type = "🚆 交通") {
  const parts = String(type || "🚆 交通").trim().split(/\s+/);
  const icon = parts[0] || "🚆";
  const label = parts.slice(1).join(" ") || "交通";
  return { icon, label };
}

function formatDateRange(transport) {
  const start = transport.departureDate || transport.arrivalDate || "";
  const end = transport.arrivalDate || "";
  if (!start) return "";
  if (!end || end === start) return start;
  return `${start} → ${end}`;
}

function mapsUrl(address, meta = {}) {
  if (!address) return "";
  if (meta?.mapsUrl) return meta.mapsUrl;

  const params = new URLSearchParams({
    api: "1",
    query: address,
  });

  if (meta?.placeId) params.set("query_place_id", meta.placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function AddressRow({ label, address, meta }) {
  if (!address) return null;

  const href = mapsUrl(address, meta);

  return (
    <div className="tm-transport-address-row">
      <div className="tm-transport-address-label">📍 {label}</div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="tm-transport-address-link"
        onClick={(event) => event.stopPropagation()}
      >
        <span>{address}</span>
        <span className="tm-transport-address-arrow">↗</span>
      </a>
    </div>
  );
}

export default function TransportCard({ transport, onEdit, onDelete, readonly = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { icon, label } = getTypeParts(transport.type);
  const title = [label, transport.company].filter(Boolean).join(" ") || "未命名交通";
  const dateText = formatDateRange(transport);

  useEffect(() => {
    const fn = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <article className="tm-transport-detail-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="tm-transport-detail-title break-words">
            {icon} {title}
          </h4>
          {dateText && (
            <div className="mt-2 text-sm font-medium text-slate-500">
              📅 {dateText}
            </div>
          )}
        </div>

        {!readonly && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowMenu((value) => !value);
              }}
              className="rounded-xl px-2 py-1 text-xl font-bold leading-none text-slate-400 hover:bg-slate-100"
              title="更多"
            >
              ⋯
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-40 mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                >
                  ✏️ 編輯
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  🗑️ 刪除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tm-transport-time-panel">
        <div className="tm-transport-time-point">
          <span className="tm-transport-time-icon">🕒</span>
          <div>
            <div className="tm-transport-time-label">{transport.departureLabel || "出發"}時間</div>
            <div className="tm-transport-time-value">{transport.departureTime || "--:--"}</div>
          </div>
        </div>

        <div className="tm-transport-time-arrow" aria-hidden="true">
          <span>••••••</span>
          <b>▶</b>
        </div>

        <div className="tm-transport-time-point">
          <span className="tm-transport-time-icon">🕒</span>
          <div>
            <div className="tm-transport-time-label">{transport.arrivalLabel || "抵達"}時間</div>
            <div className="tm-transport-time-value">{transport.arrivalTime || "--:--"}</div>
          </div>
        </div>
      </div>

      {(transport.departureDurationMinutes || transport.arrivalDurationMinutes) && (
        <div className="tm-transport-stay-row">
          <span>⏱️ 停留時間</span>
          {transport.departureDurationMinutes ? <b>{transport.departureDurationMinutes} 分鐘</b> : null}
          {transport.arrivalDurationMinutes ? <b>{transport.arrivalDurationMinutes} 分鐘</b> : null}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <AddressRow label="起點地址" address={transport.from} meta={transport.fromMeta} />
        <AddressRow label="終點地址" address={transport.to} meta={transport.toMeta} />
      </div>

      {transport.orderNumber && (
        <div className="tm-transport-info-row">
          <span>🧾 訂單編號</span>
          <b>{transport.orderNumber}</b>
        </div>
      )}

      {transport.price && (
        <div className="mt-4 text-lg font-extrabold text-emerald-600">
          💰 {Number(transport.price).toLocaleString()} {transport.currency || ""}
        </div>
      )}

      {transport.website && (
        <a
          href={transport.website}
          target="_blank"
          rel="noopener noreferrer"
          className="tm-transport-website"
        >
          🌐 官方網站 <span>↗</span>
        </a>
      )}

      {transport.note && (
        <div className="tm-transport-note">
          <div className="tm-transport-note-label">📝 備註</div>
          <div className="whitespace-pre-wrap break-words">{transport.note}</div>
        </div>
      )}
    </article>
  );
}
