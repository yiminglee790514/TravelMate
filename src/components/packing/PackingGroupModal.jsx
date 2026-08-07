import { useState } from "react";

const icons = [

  "🧳",
  "👕",
  "🔌",
  "🪥",
  "💊",
  "👶",
  "🍪",
  "🪪",
  "📷",
  "📄",
  "🛍️",
  "⭐",

];

export default function PackingGroupModal({
  onClose,
  onSave,
  group,
}) {

  const [title, setTitle] = useState(
    group?.title || ""
  );

  const [icon, setIcon] = useState(
    group?.icon || "📂"
  );

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">

          {group ? "修改群組" : "新增群組"}

        </h2>

        <input
          className="w-full rounded-xl border p-3"
          placeholder="例如：電子產品"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <div className="mt-6">

          <div className="mb-3 font-semibold">

            選擇圖示

          </div>

          <div className="grid grid-cols-6 gap-3">

            {icons.map((i)=>(

              <button
                key={i}
                type="button"
                onClick={()=>setIcon(i)}
                className={`
                  flex h-12 items-center justify-center
                  rounded-2xl border text-2xl
                  transition
                  ${
                    icon===i
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                  }
                `}
              >

                {i}

              </button>

            ))}

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
            onClick={()=>{

              if(!title.trim()){

                alert("請輸入群組名稱");

                return;

              }

              onSave({

                title,

                icon,

              });

            }}
            className="rounded-xl bg-blue-500 px-5 py-3 text-white"
          >
            儲存
          </button>

        </div>

      </div>

    </div>

  );

}