import { useState } from "react";

// 新增群組時直接從這裡選擇樣式；「自訂」不再要求輸入名稱，會先建立成「自訂」。
// 之後長按群組即可修改名稱與圖示。
const GROUP_OPTIONS = [
  ["✈️", "飛機"],
  ["🚄", "新幹線"],
  ["🚆", "電車"],
  ["🚇", "地鐵"],
  ["🚌", "公車"],
  ["🚕", "計程車"],
  ["🚶", "步行"],
  ["🚗", "租車"],
  ["🚢", "渡輪"],
  ["🚡", "纜車"],
  ["🧭", "自訂"],
];

export const TRANSPORT_GROUP_ICONS = Object.fromEntries(GROUP_OPTIONS);

export function getTransportGroupIcon(name, icons = {}) {
  return icons?.[name] || TRANSPORT_GROUP_ICONS[name] || "🧭";
}

export default function TransportGroupModal({
  group,
  groupIcons = {},
  onClose,
  onSave,
  onDelete,
}) {
  const isEdit = !!group;
  const existingTitle = group?.title || "";
  const existingIcon = group?.icon || getTransportGroupIcon(existingTitle, groupIcons);
  const matched = GROUP_OPTIONS.find(([, name]) => name === existingTitle);

  const [preset, setPreset] = useState(matched ? existingTitle : "自訂");
  const [title, setTitle] = useState(existingTitle || "自訂");

  function selectPreset(name) {
    setPreset(name);
    if (name !== "自訂") setTitle(name);
    else if (!isEdit) setTitle("自訂");
  }

  function handleSave() {
    const clean = isEdit
      ? title.trim()
      : (preset === "自訂" ? "自訂" : preset);

    if (!clean) {
      alert("請輸入交通群組名稱");
      return;
    }

    const icon = preset === "自訂"
      ? (isEdit && existingTitle === clean ? existingIcon : "🧭")
      : (GROUP_OPTIONS.find(([, name]) => name === preset)?.[0] || "🧭");

    onSave({
      id: group?.id || `transport-group-${Date.now()}`,
      title: clean,
      icon,
    });
  }

  return (
    <div className="tm-modal-backdrop">
      <div className="tm-modal max-w-md">
        <h2 className="tm-modal-title mb-5">
          {isEdit ? "修改交通群組" : "新增交通群組"}
        </h2>

        {isEdit && (
          <div className="mb-4">
            <label className="tm-modal-label mb-1 block">群組名稱</label>
            <input
              autoFocus
              className="tm-modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：租車"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {GROUP_OPTIONS.map(([icon, name]) => (
            <button
              key={name}
              type="button"
              onClick={() => selectPreset(name)}
              className={`flex min-h-[78px] flex-col items-center justify-center rounded-2xl border px-2 py-2 transition ${
                preset === name
                  ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-3xl leading-none">{icon}</span>
              <span className="mt-2 text-sm font-semibold">{name}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {isEdit
            ? "可以修改群組名稱或圖示。若要刪除群組，請使用下方刪除按鈕。"
            : "選擇一個圖示即可建立群組；自訂群組會先建立成「自訂」，之後可長按修改名稱。"}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {isEdit && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="tm-modal-button bg-red-50 text-red-600"
            >
              🗑️ 移除群組
            </button>
          ) : (
            <span />
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="tm-modal-button bg-gray-200 text-gray-700">
              取消
            </button>
            <button type="button" onClick={handleSave} className="tm-modal-button bg-blue-500 text-white">
              {isEdit ? "儲存" : "建立"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
