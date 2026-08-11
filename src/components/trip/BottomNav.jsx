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
  const base = share ? `/share/${shareId}` : `/trip/${id}`;
  const navItems = items || (share ? shareItems : defaultItems);

  return (
    <nav className="tm-bottom-nav" aria-label="旅程導覽">
      <div className="tm-bottom-nav-scroll scrollbar-none">
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
