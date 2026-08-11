import { useEffect, useRef } from "react";

function formatDay(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const week = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}/${date.getDate()}（${week[date.getDay()]}）`;
}

export default function DaySelector({ days, activeDay, onChange }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeDay]);

  return (
    <div className="tm-day-selector-wrap">
      <div className="tm-day-selector scrollbar-none">
        {days.map((day) => {
          const active = day.day === activeDay;
          return (
            <button
              key={day.day}
              ref={active ? activeRef : null}
              type="button"
              onClick={() => onChange(day.day)}
              className={`tm-day-tab ${active ? "is-active" : ""}`}
            >
              <span>Day {day.day}</span>
              <small>{formatDay(day.date)}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
