import { useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const defaultItems = [
  { path: "itinerary", icon: "🗓️", title: "行程" },
  { path: "flight", icon: "✈️", title: "航班" },
  { path: "hotel", icon: "🏨", title: "飯店" },
  { path: "transport", icon: "🚆", title: "交通" },
  { path: "weather", icon: "🌤️", title: "天氣" },
  { path: "expense", icon: "💰", title: "花費" },
  { path: "packing", icon: "🧳", title: "行李" },
  { path: "data", icon: "📁", title: "資料" },
];

const shareItems = defaultItems.filter((item) => ["itinerary", "flight", "hotel", "transport", "weather", "expense"].includes(item.path));

export default function BottomNav({ share = false, items }) {
  const { id, shareId } = useParams();
  const location = useLocation();
  const scrollRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const base = share ? `/share/${shareId}` : `/trip/${id}`;
  const navItems = items || (share ? shareItems : defaultItems);

  function handlePointerDown(event) {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    const el = scrollRef.current;
    if (!el) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const el = scrollRef.current;

    if (!drag.active || !el) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;

    if (!drag.moved) return;

    el.scrollLeft = drag.startScrollLeft - distance;
  }

  function handlePointerUp() {
    dragRef.current.active = false;
  }

  function handleClick(event) {
    // 手指左右滑動時不要誤觸發某個導覽按鈕。
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = false;
    }
  }

  return (
    <nav className="tm-bottom-nav" aria-label="旅程導覽">
      <div
        ref={scrollRef}
        className="tm-bottom-nav-scroll scrollbar-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {navItems.map((item) => {
          const path = `${base}/${item.path}`;
          const active = location.pathname === path || (!item.path && location.pathname === base);

          return (
            <Link
              key={item.path}
              to={path}
              className={`tm-bottom-item ${active ? "is-active" : ""}`}
            >
              <span className="tm-bottom-icon">{item.icon}</span>
              <span className="tm-bottom-label">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
