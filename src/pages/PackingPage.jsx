import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import useTrip from "../hooks/useTrip";
import PackingGroupModal from "../components/packing/PackingGroupModal";
import PackingGroup from "../components/packing/PackingGroup";
import PackingItemModal from "../components/packing/PackingItemModal";

export default function PackingPage() {

  const { id } = useParams();

  const {
    trip,
    updateTrip,
  } = useTrip(id);

  const [showGroupModal, setShowGroupModal] = useState(false);

    const [editGroup, setEditGroup] = useState(null);

    const [showItemModal, setShowItemModal] = useState(false);

    const [editItem, setEditItem] = useState(null);

    const [currentGroupId, setCurrentGroupId] = useState(null);

    const [openItemId, setOpenItemId] = useState(null);

  if (!trip) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );

  }

  return (

    <>
      <div className="min-h-screen bg-gray-100">

        <div className="mx-auto max-w-md px-6 py-10">

          <Link
            to={`/trip/${id}`}
            className="text-blue-500"
          >
            ← 回旅程
          </Link>

          <h1 className="mt-6 text-4xl font-bold">
            🧳 行李清單
          </h1>

          <button
            onClick={() => setShowGroupModal(true)}
            className="mt-8 mb-6 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600"
          >
            ＋ 新增群組
          </button>

          <div className="space-y-6">

  {(trip.packing || []).map((group) => (

    <PackingGroup

      key={group.id}

      group={group}

      onAddItem={(groupId) => {

        setCurrentGroupId(groupId);

        setEditItem(null);

        setShowItemModal(true);

      }}

      onEditGroup={(group) => {

        setEditGroup(group);

        setShowGroupModal(true);

      }}

      onDeleteGroup={async (groupId) => {

        if (!window.confirm("確定刪除此群組？")) return;

        await updateTrip({

          ...trip,

          packing: trip.packing.filter(
            g => g.id !== groupId
          ),

        });

      }}

      onToggleItem={async (groupId,itemId)=>{

        const packing=trip.packing.map(group=>{

          if(group.id!==groupId) return group;

          return{

            ...group,

            items:group.items.map(item=>

              item.id===itemId

              ?{

                  ...item,

                  checked:!item.checked

                }

              :item

            )

          };

        });

        await updateTrip({

          ...trip,

          packing,

        });

      }}

      onEditItem={(groupId,item)=>{

        setCurrentGroupId(groupId);

        setEditItem(item);

        setShowItemModal(true);

      }}

      onDeleteItem={async(groupId,itemId)=>{

        if(!window.confirm("確定刪除此物品？")) return;

        const packing=trip.packing.map(group=>{

          if(group.id!==groupId) return group;

          return{

            ...group,

            items:group.items.filter(

              i=>i.id!==itemId

            )

          };

        });

        await updateTrip({

          ...trip,

          packing,

        });

      }}
      openItemId={openItemId}
      setOpenItemId={setOpenItemId}
    />

  ))}

</div>

        </div>

      </div>

      {showGroupModal && (

        <PackingGroupModal
  group={editGroup}
  onClose={() => {

    setShowGroupModal(false);

    setEditGroup(null);

  }}
onSave={async (data) => {



  let packing;

  if (editGroup) {

    packing = trip.packing.map(group =>

      group.id === editGroup.id

        ? {

            ...group,

            title: data.title,

            icon: data.icon,

          }

        : group

    );

  } else {

    packing = [

      ...(trip.packing || []),

      {

        id: Date.now(),

        title: data.title,

        icon: data.icon,

        items: [],

      },

    ];

  }

  await updateTrip({

    ...trip,

    packing,

  });

  setEditGroup(null);

  setShowGroupModal(false);

}}
/>

      )}

      {showItemModal && (

  <PackingItemModal

    item={editItem}

    onClose={() => {

      setShowItemModal(false);

      setEditItem(null);

    }}

    onSave={async (item) => {

      const packing = trip.packing.map(group => {

        if (group.id !== currentGroupId) {

          return group;

        }

        if (editItem) {

          return {

            ...group,

            items: group.items.map(i =>

              i.id === item.id

                ? item

                : i

            ),

          };

        }

        return {

          ...group,

          items: [

            ...group.items,

            item,

          ],

        };

      });

      await updateTrip({

        ...trip,

        packing,

      });

      setShowItemModal(false);

      setEditItem(null);

    }}

  />

)}

    </>

  );

}