import { useEffect, useRef, useState } from "react";

export default function TimelineItem({
  item,
  time,
  title,
  icon,
  address,
  note,
  onEdit,
  onDelete,
  onClick,
  readonly = false,
}) {
  if (item) {
    time = item.time;
    title = item.title;
    icon = item.icon;
    address = item.address;
    note = item.note;
  }

  const durationMinutes = Number(item?.durationMinutes ?? item?.extra?.durationMinutes ?? 0);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <article className="tm-timeline-row">
      <div className="tm-timeline-time">{time || "--:--"}</div>

      <div className="tm-timeline-rail" aria-hidden="true">
        <span className="tm-timeline-dot" />
        <span className="tm-timeline-line" />
      </div>

      <div className="tm-timeline-content">
        <div className="flex items-start justify-between gap-2">
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="tm-timeline-title text-left hover:text-blue-600"
            >
              {icon} {title}
            </button>
          ) : (
            <div className="tm-timeline-title">{icon} {title}</div>
          )}

          {!readonly && (
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="tm-item-menu-button"
                title="更多"
              >
                ⋯
              </button>

              {showMenu && (
                <div className="tm-item-menu">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowMenu(false);
                      onEdit?.();
                    }}
                  >
                    ✏️ 編輯
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowMenu(false);
                        onDelete?.();
                      }}
                      className="text-red-600"
                    >
                      🗑️ 刪除
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {address && (
          <div className="tm-timeline-detail">
            <div className="tm-timeline-label">📍 地址</div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
              className="tm-timeline-address"
            >
              {address}
            </a>
          </div>
        )}

        {durationMinutes > 0 && (
          <div className="tm-timeline-duration">
            ⏱️ 停留 {durationMinutes >= 60 ? `${Math.floor(durationMinutes / 60)} 小時${durationMinutes % 60 ? ` ${durationMinutes % 60} 分鐘` : ""}` : `${durationMinutes} 分鐘`}
          </div>
        )}

        {note && (
          <div className="tm-timeline-detail">
            <div className="tm-timeline-label">📝 備註</div>
            <div className="tm-timeline-note">{note}</div>
          </div>
        )}
      </div>
    </article>
  );
}
