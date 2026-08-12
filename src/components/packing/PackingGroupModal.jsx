import { useState } from "react";

const icons = [
  "🧳", "👕", "🔌", "🪥", "💊", "👶", "🍪", "🪪", "📷", "📄", "🛍️", "⭐",
];

export default function PackingGroupModal({
  onClose,
  onSave,
  onDelete,
  group,
}) {
  const [title, setTitle] = useState(group?.title || "");
  const [icon, setIcon] = useState(group?.icon || "📂");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            {group ? "修改群組" : "新增群組"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <input
          autoFocus
          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="例如：電子產品"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mt-5">
          <div className="mb-3 text-sm font-bold text-slate-700">選擇圖示</div>
          <div className="grid grid-cols-6 gap-2">
            {icons.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`flex h-11 items-center justify-center rounded-xl border text-xl transition ${
                  icon === i
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {group && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete();
              }}
              className="rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
            >
              🗑️ 移除群組
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  alert("請輸入群組名稱");
                  return;
                }
                onSave({ title: title.trim(), icon });
              }}
              className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
