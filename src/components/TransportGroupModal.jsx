import { useState } from "react";

export default function TransportGroupModal({ group, onClose, onSave }) {
  const [title, setTitle] = useState(group?.title || "");

  function handleSave() {
    const clean = title.trim();
    if (!clean) {
      alert("請輸入交通群組名稱");
      return;
    }

    onSave({
      id: group?.id || `transport-group-${Date.now()}`,
      title: clean,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-2xl font-bold">
          {group ? "修改交通群組" : "新增交通群組"}
        </h2>

        <input
          autoFocus
          className="w-full rounded-xl border px-4 py-3"
          placeholder="例如：熊本租車"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl bg-gray-200 px-5 py-3">
            取消
          </button>
          <button onClick={handleSave} className="rounded-xl bg-blue-500 px-5 py-3 text-white">
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}
