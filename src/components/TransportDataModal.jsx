import { useState } from "react";

async function resizeImage(file) {
  if (!file.type.startsWith("image/")) return null;

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function TransportDataModal({ group, onClose, onSave }) {
  const [title, setTitle] = useState(group?.title || "");
  const [images, setImages] = useState(Array.isArray(group?.images) ? group.images : []);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const added = [];
      for (const file of files) {
        const dataUrl = await resizeImage(file);
        if (!dataUrl) continue;
        added.push({
          id: `image-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          dataUrl,
        });
      }
      setImages((prev) => [...prev, ...added]);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(id) {
    setImages((prev) => prev.filter((image) => image.id !== id));
  }

  function handleSave() {
    const clean = title.trim();
    if (!clean) {
      alert("請輸入資料群組名稱");
      return;
    }

    onSave({
      id: group?.id || `transport-data-${Date.now()}`,
      title: clean,
      images,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">{group ? "修改資料群組" : "新增資料群組"}</h2>

        <input
          autoFocus
          className="mt-5 w-full rounded-xl border px-4 py-3"
          placeholder="例如：租車文件、車票、預約單"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          {uploading ? "圖片處理中..." : "📷 上傳圖片"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative overflow-hidden rounded-xl border bg-gray-50">
                <img src={image.dataUrl} alt={image.name || "資料圖片"} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

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
