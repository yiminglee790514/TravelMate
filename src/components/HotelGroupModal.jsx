import { useState } from "react";

export default function HotelGroupModal({
  group,
  onClose,
  onSave,
}) {

  const isEdit = !!group;

  const [title, setTitle] = useState(
    group?.title || ""
  );

  const [checkIn, setCheckIn] = useState(
    group?.checkIn || ""
  );

  const [checkOut, setCheckOut] = useState(
    group?.checkOut || ""
  );

  function handleSave() {

    if (!title.trim()) {

      alert("請輸入住宿群組名稱");

      return;

    }

    if (!checkIn || !checkOut) {

      alert("請選擇入住與退房日期");

      return;

    }

    if (checkOut < checkIn) {

      alert("退房日期不能早於入住日期");

      return;

    }

    onSave({

      id: group?.id || Date.now(),

      title: title.trim(),

      checkIn,

      checkOut,

      hotels: group?.hotels || [],

    });

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          {isEdit ? "修改住宿群組" : "新增住宿群組"}
        </h2>

        <div className="space-y-4">

          <input
            className="w-full rounded-xl border p-3"
            placeholder="例如：熊本住宿"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
              入住日期
            </label>

            <input
              type="date"
              className="w-full rounded-xl border p-3"
              value={checkIn}
              onChange={(e) =>
                setCheckIn(e.target.value)
              }
            />

          </div>

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-600">
              退房日期
            </label>

            <input
              type="date"
              className="w-full rounded-xl border p-3"
              value={checkOut}
              onChange={(e) =>
                setCheckOut(e.target.value)
              }
            />

          </div>

        </div>

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
            {isEdit ? "儲存" : "建立"}
          </button>

        </div>

      </div>

    </div>

  );

}