import { useMemo, useState } from "react";

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}

export default function WeatherEditModal({
  days = [],
  onClose,
  onSave,
}) {
  const [values, setValues] = useState(() =>
    days.reduce((map, day) => {
      map[day.date] = day.city || "";
      return map;
    }, {})
  );
  const [saving, setSaving] = useState(false);

  const orderedDays = useMemo(
    () => [...days].sort((a, b) => a.date.localeCompare(b.date)),
    [days]
  );

  function updateCity(date, value) {
    setValues((current) => ({
      ...current,
      [date]: value,
    }));
  }

  async function handleSave() {
    const missing = orderedDays.find(
      (day) => !String(values[day.date] || "").trim()
    );

    if (missing) {
      alert(`請輸入 ${formatDate(missing.date)} 的地區`);
      return;
    }

    const updated = orderedDays.map((day) => ({
      ...day,
      city: String(values[day.date]).trim(),
    }));

    setSaving(true);
    try {
      await onSave(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="tm-weather-edit-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="tm-weather-edit-all-modal w-full max-w-[560px] rounded-3xl bg-white shadow-2xl">
        <div className="tm-weather-edit-all-header">
          <div>
            <h2>編輯每日地區</h2>
            <p>一次設定整趟行程每天的天氣地區</p>
          </div>
          <button
            type="button"
            className="tm-weather-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <div className="tm-weather-edit-all-list">
          {orderedDays.map((day, index) => (
            <div className="tm-weather-edit-all-row" key={day.date}>
              <div className="tm-weather-edit-all-day">
                <strong>Day {index + 1}</strong>
                <span>{formatDate(day.date)}</span>
              </div>

              <input
                value={values[day.date] || ""}
                onChange={(event) => updateCity(day.date, event.target.value)}
                placeholder="例如：熊本、阿蘇、福岡"
                disabled={saving}
              />
            </div>
          ))}
        </div>

        <div className="tm-weather-edit-all-footer">
          <button
            type="button"
            className="tm-weather-modal-cancel"
            onClick={onClose}
            disabled={saving}
          >
            取消
          </button>
          <button
            type="button"
            className="tm-weather-modal-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "儲存中..." : "儲存全部"}
          </button>
        </div>
      </div>
    </div>
  );
}
