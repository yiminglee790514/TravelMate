import { useState } from "react";

function GroupMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-lg px-2 py-1 text-xl font-bold text-gray-500 hover:bg-gray-100"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
          >
            ✏️ 編輯
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ 刪除
          </button>
        </div>
      )}
    </div>
  );
}

export default function TransportDataSection({ groups = [], readonly, onAdd, onEdit, onDelete, onAddImage }) {
  const [collapsed, setCollapsed] = useState({});
  const [preview, setPreview] = useState(null);

  function isClosed(id) {
    return collapsed[id] ?? true;
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">📁 資料</h2>
        {!readonly && (
          <button onClick={onAdd} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white">
            ＋ 新增群組
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-400">
          尚未建立資料群組
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map((group) => {
            const closed = isClosed(group.id);
            const images = Array.isArray(group.images) ? group.images : [];

            return (
              <div key={group.id} className="overflow-visible rounded-2xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setCollapsed((prev) => ({ ...prev, [group.id]: !closed }))}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-gray-400">{closed ? "▶" : "▼"}</span>
                    <span className="truncate font-bold">📂 {group.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">{images.length}</span>
                  </button>
                  {!readonly && <GroupMenu onEdit={() => onEdit(group)} onDelete={() => onDelete(group.id)} />}
                </div>

                {!closed && (
                  <div className="border-t border-gray-100 p-3">
                    {!readonly && (
                      <label className="mb-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm text-gray-600 hover:bg-gray-50">
                        📷 新增圖片
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => onAddImage(group, e.target.files, e)}
                        />
                      </label>
                    )}

                    {images.length === 0 ? (
                      <div className="py-5 text-center text-sm text-gray-400">尚未上傳圖片</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {images.map((image) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setPreview(image.dataUrl)}
                            className="overflow-hidden rounded-xl bg-white shadow-sm"
                            title="點擊放大"
                          >
                            <img src={image.dataUrl} alt={image.name || "資料圖片"} className="h-32 w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <button type="button" className="absolute right-4 top-4 text-3xl text-white" onClick={() => setPreview(null)}>
            ×
          </button>
          <img
            src={preview}
            alt="放大圖片"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
