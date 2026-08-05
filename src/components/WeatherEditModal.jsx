import { useState } from "react";

export default function WeatherEditModal({
  city,
  onClose,
  onSave,
}) {

  const [value, setValue] = useState(city);

  function handleSave() {

    if (!value.trim()) {
      alert("請輸入城市");
      return;
    }

    onSave(value.trim());

    onClose();

  }

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40">

      <div className="w-[360px] rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          修改城市
        </h2>

        <input
          className="w-full rounded-xl border p-3"
          placeholder="例如：東京、箱根、京都"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-200 px-5 py-3"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-500 px-5 py-3 text-white"
          >
            儲存
          </button>

        </div>

      </div>

    </div>

  );

}