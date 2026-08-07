import PackingItem from "./PackingItem";

export default function PackingGroup({
  group,
  openItemId,
  setOpenItemId,
  onAddItem,
  onEditGroup,
  onDeleteGroup,
  onToggleItem,
  onEditItem,
  onDeleteItem,
}) {

  const items = [...group.items].sort((a, b) => {

    if (a.checked === b.checked) return 0;

    return a.checked ? 1 : -1;

  });

  return (

    <div className="rounded-2xl bg-white p-5 shadow">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-xl font-bold">

          {group.icon || "📂"} {group.title}

        </h2>

        <div className="flex gap-2">

          <button
            onClick={() => onEditGroup(group)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            ✏️
          </button>

          <button
            onClick={() => onDeleteGroup(group.id)}
            className="rounded-lg p-2 hover:bg-red-100"
          >
            🗑️
          </button>

        </div>

      </div>

      <div className="space-y-2">

        {items.length === 0 ? (

          <div className="text-sm text-gray-400">

            尚未新增物品

          </div>

        ) : (

          items.map((item) => (

            <PackingItem
            key={item.id}
            item={item}
            onToggle={() => onToggleItem(group.id, item.id)}
            onEdit={() => onEditItem(group.id, item)}
            onDelete={() => onDeleteItem(group.id, item.id)}
            />

          ))

        )}

      </div>

      <button
        onClick={() => onAddItem(group.id)}
        className="mt-5 w-full rounded-xl bg-blue-500 py-3 text-white hover:bg-blue-600"
      >
        ＋ 新增物品
      </button>

    </div>

  );

}