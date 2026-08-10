import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useTrip from "../hooks/useTrip";
import { getShare } from "../services/shareService";
import { canEdit } from "../services/permissionService";

const CURRENCY_MAP = {
  JPY: {
    symbol: "¥",
    name: "日圓",
  },

  TWD: {
    symbol: "NT$",
    name: "台幣",
  },

  USD: {
    symbol: "$",
    name: "美元",
  },

  HKD: {
    symbol: "HK$",
    name: "港幣",
  },

  KRW: {
    symbol: "₩",
    name: "韓元",
  },

  CNY: {
    symbol: "¥",
    name: "人民幣",
  },

  EUR: {
    symbol: "€",
    name: "歐元",
  },

  GBP: {
    symbol: "£",
    name: "英鎊",
  },

  SGD: {
    symbol: "S$",
    name: "新加坡幣",
  },

  THB: {
    symbol: "฿",
    name: "泰銖",
  },
};

const DEFAULT_GROUPS = [
  {
    id: "flight",
    name: "機票",
    icon: "✈️",
  },
  {
    id: "hotel",
    name: "住宿",
    icon: "🏨",
  },
  {
    id: "transport",
    name: "交通",
    icon: "🚆",
  },
  {
    id: "food",
    name: "餐飲",
    icon: "🍜",
  },
  {
    id: "ticket",
    name: "門票",
    icon: "🎫",
  },
  {
    id: "shopping",
    name: "購物",
    icon: "🛍️",
  },
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString();
}

function getCurrency(currency) {
  return CURRENCY_MAP[currency] || CURRENCY_MAP.JPY;
}

function getInitialExpense() {
  return {
    id: null,
    date: new Date().toISOString().split("T")[0],
    title: "",
    amount: "",
    currency: "JPY",
    groupId: "food",
    person: "",
    note: "",
  };
}

export default function ExpensePage() {

  const { id, shareId } = useParams();

  const {
    trip: cloudTrip,
    updateTrip,
  } = useTrip(id);

  const [sharedTrip, setSharedTrip] = useState(null);

  useEffect(() => {
    if (!shareId) return;

    async function loadShare() {
      const data = await getShare(shareId);
      setSharedTrip(data);
    }

    loadShare();
  }, [shareId]);

  const trip = shareId ? sharedTrip : cloudTrip;

  const [showModal, setShowModal] = useState(false);

  const [editingExpense, setEditingExpense] = useState(null);

  const [showGroupModal, setShowGroupModal] = useState(false);

  const [newPerson, setNewPerson] = useState("");

  const [newGroupName, setNewGroupName] = useState("");

  // 點擊群組 → 查看群組花費明細
  const [selectedGroup, setSelectedGroup] = useState(null);

  // 點付款人 → 查看這個人的花費明細
  const [selectedPerson, setSelectedPerson] = useState(null);

  if (!trip) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );

  }

  const editable = !shareId && canEdit(trip);

  const expenses = Array.isArray(trip.expenses)
    ? trip.expenses
    : [];

  const people = Array.isArray(trip.expensePeople)
    ? trip.expensePeople
    : [];

  const groups = (() => {
    const existing =
      Array.isArray(trip.expenseGroups) && trip.expenseGroups.length > 0
        ? trip.expenseGroups
        : DEFAULT_GROUPS;

    if (existing.some((group) => group.id === "flight")) {
      return existing;
    }

    return [DEFAULT_GROUPS[0], ...existing];
  })();


  // =========================
  // 自動帶入住宿 / 交通費用
  //
  // 這些資料不寫進 trip.expenses，
  // 避免重複儲存；直接從住宿 / 交通資料即時合併。
  // =========================

  const linkedExpenses = [];

  // 住宿 → 支出群組「住宿」
  (Array.isArray(trip.hotelGroups)
    ? trip.hotelGroups
    : []
  ).forEach((hotelGroup) => {

    (Array.isArray(hotelGroup.hotels)
      ? hotelGroup.hotels
      : []
    ).forEach((hotel) => {

      const amount = Number(hotel.price);

      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      if (!hotel.currency) {
        return;
      }

      linkedExpenses.push({

        id: `hotel-${hotel.id}`,

        sourceType: "hotel",
        sourceId: hotel.id,

        date:
          hotel.checkIn ||
          trip.startDate ||
          "",

        title:
          hotel.name ||
          hotelGroup.title ||
          "住宿",

        amount,

        currency: hotel.currency,

        groupId: "hotel",

        person:
          hotel.bookingName ||
          "",

        note:
          hotel.note || "",

      });

    });

  });


  // 航班旅客價格 → 支出群組「機票」
  const flightValues = [
    ...(Array.isArray(trip.flights?.outbound)
      ? trip.flights.outbound.map((flight) => ({ type: "outbound", flight }))
      : trip.flights?.outbound
        ? [{ type: "outbound", flight: trip.flights.outbound }]
        : []),
    ...(Array.isArray(trip.flights?.inbound)
      ? trip.flights.inbound.map((flight) => ({ type: "inbound", flight }))
      : trip.flights?.inbound
        ? [{ type: "inbound", flight: trip.flights.inbound }]
        : []),
  ];

  flightValues.forEach(({ type, flight }) => {
    (Array.isArray(flight?.passengers) ? flight.passengers : []).forEach((passenger) => {
      const amount = Number(passenger.price);

      // 沒有填價格就完全不進花費
      if (!Number.isFinite(amount) || amount <= 0) return;

      linkedExpenses.push({
        id: `flight-${type}-${flight.id}-${passenger.id}`,
        sourceType: "flight",
        sourceId: `${type}-${flight.id}-${passenger.id}`,
        date: flight.date || trip.startDate || "",
        title: `✈️ 機票｜${passenger.name || "旅客"}`,
        amount,
        currency: passenger.currency || "JPY",
        groupId: "flight",
        person: passenger.name || "",
        note: [flight.airline, flight.flightNo].filter(Boolean).join(" "),
      });
    });
  });


  // 交通 → 支出群組「交通」
  (Array.isArray(trip.transports)
    ? trip.transports
    : []
  ).forEach((transport) => {

    const amount = Number(transport.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    if (!transport.currency) {
      return;
    }

    linkedExpenses.push({

      id: `transport-${transport.id}`,

      sourceType: "transport",
      sourceId: transport.id,

      date:
        transport.departureDate ||
        trip.startDate ||
        "",

      title:
        transport.company ||
        transport.type ||
        "交通",

      amount,

      currency: transport.currency,

      groupId: "transport",

      person:
        transport.payer ||
        "",

      note:
        transport.note || "",

    });

  });


  // 手動記帳 + 自動帶入住宿 / 交通
  const allExpenses = [
    ...expenses,
    ...linkedExpenses,
  ];


  // =========================
  // 幣別總計
  // =========================

  const currencyTotals = {};

  allExpenses.forEach((expense) => {

    const amount = Number(expense.amount);

    if (!Number.isFinite(amount)) return;

    if (!currencyTotals[expense.currency]) {
      currencyTotals[expense.currency] = 0;
    }

    currencyTotals[expense.currency] += amount;

  });


  // =========================
  // 群組總計
  // =========================

  const groupTotals = {};

  allExpenses.forEach((expense) => {

    const amount = Number(expense.amount);

    if (!Number.isFinite(amount)) return;

    if (!groupTotals[expense.groupId]) {
      groupTotals[expense.groupId] = {};
    }

    if (!groupTotals[expense.groupId][expense.currency]) {
      groupTotals[expense.groupId][expense.currency] = 0;
    }

    groupTotals[expense.groupId][expense.currency] += amount;

  });


  // =========================
  // 每個付款人的總計
  // =========================

  const personTotals = {};

  const allPeople = [
    ...people,
    ...linkedExpenses
      .map((expense) => expense.person)
      .filter(Boolean)
      .filter((person) => !people.includes(person)),
  ];

  allPeople.forEach((person) => {
    personTotals[person] = {};
  });

  allExpenses.forEach((expense) => {

    const amount = Number(expense.amount);

    if (!Number.isFinite(amount)) return;
    if (!expense.person) return;

    if (!personTotals[expense.person]) {
      personTotals[expense.person] = {};
    }

    if (!personTotals[expense.person][expense.currency]) {
      personTotals[expense.person][expense.currency] = 0;
    }

    personTotals[expense.person][expense.currency] += amount;

  });


  // =========================
  // 新增 / 編輯
  // =========================

  async function handleSaveExpense(data) {

    if (!data.title.trim()) {

      alert("請輸入花費名稱");

      return;

    }

    if (!data.amount || Number(data.amount) <= 0) {

      alert("請輸入正確金額");

      return;

    }

    if (!data.person) {

      alert("請選擇付款人");

      return;

    }

    let updatedExpenses;

    if (editingExpense) {

      updatedExpenses = expenses.map((expense) =>
        expense.id === editingExpense.id
          ? {
              ...data,
              id: editingExpense.id,
              amount: Number(data.amount),
            }
          : expense
      );

    } else {

      updatedExpenses = [
        ...expenses,
        {
          ...data,
          id: Date.now(),
          amount: Number(data.amount),
        },
      ];

    }

    await updateTrip({
      ...trip,
      expenses: updatedExpenses,
    });

    setEditingExpense(null);

    setShowModal(false);

  }


  // =========================
  // 刪除
  // =========================

  async function handleDeleteExpense(expenseId) {

    if (!window.confirm("確定刪除這筆花費？")) {
      return;
    }

    const updatedExpenses =
      expenses.filter(
        (expense) => expense.id !== expenseId
      );

    await updateTrip({
      ...trip,
      expenses: updatedExpenses,
    });

  }


  // =========================
  // 新增人名
  // =========================

  async function handleAddPerson() {

    const name = newPerson.trim();

    if (!name) return;

    if (people.includes(name)) {

      alert("這個名字已經存在");

      return;

    }

    await updateTrip({
      ...trip,
      expensePeople: [
        ...people,
        name,
      ],
    });

    setNewPerson("");

  }


  // =========================
  // 新增群組
  // =========================

  async function handleAddGroup() {

    const name = newGroupName.trim();

    if (!name) return;

    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      icon: "📌",
    };

    await updateTrip({
      ...trip,
      expenseGroups: [
        ...groups,
        newGroup,
      ],
    });

    setNewGroupName("");

    setShowGroupModal(false);

  }


  // =========================
  // 找群組
  // =========================

  function getGroup(groupId) {

    return groups.find(
      (group) => group.id === groupId
    ) || {
      name: "其他",
      icon: "📌",
    };

  }


  return (

    <div className="bg-gray-100">

      <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-2 sm:px-6">


        {/* =========================
            總花費
        ========================= */}

        <div className="mb-8">

          <div className="mb-4 flex items-center justify-between">

            <h1 className="text-xl font-bold text-gray-900">
              💰 總花費
            </h1>

            {editable && (

              <button
                onClick={() => {

                  setEditingExpense(null);

                  setShowModal(true);

                }}
                className="
                  rounded-xl
                  bg-blue-500
                  px-4
                  py-2
                  font-semibold
                  text-white
                  hover:bg-blue-600
                "
              >
                ＋新增花費
              </button>

            )}

          </div>


          {/* 幣別總額 */}

          {Object.keys(currencyTotals).length === 0 ? (

            <div className="
              rounded-2xl
              bg-white
              p-6
              text-center
              text-gray-400
              shadow
            ">
              尚未有花費
            </div>

          ) : (

            <div className="grid grid-cols-2 gap-3">

              {Object.entries(currencyTotals).map(
                ([currencyCode, amount]) => {

                  const currency =
                    getCurrency(currencyCode);

                  return (

                    <div
                      key={currencyCode}
                      className="
                        rounded-2xl
                        bg-white
                        p-4
                        shadow-sm
                      "
                    >

                      <div className="text-xs text-gray-500">
                        {currencyCode} {currency.name}
                      </div>

                      <div className="
                        mt-2
                        text-xl
                        font-bold
                        text-emerald-600
                      ">
                        {currency.symbol}
                        {formatMoney(amount)}
                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </div>


        {/* =========================
            每個付款人的總計
        ========================= */}

        {allPeople.length > 0 && (

          <div className="mb-6">

            {/* 區塊標題 */}

            <div className="mb-2 flex items-center gap-2">

              <div className="text-base font-bold text-gray-800">
                👤 按付款人統計
              </div>

              <div className="h-px flex-1 bg-gray-200" />

            </div>


            {/* 付款人統計卡片 */}

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

              {allPeople.map((person, index) => {

                const totals = personTotals[person] || {};

                const entries = Object.entries(totals);

                return (

                  <button
                    type="button"
                    key={person}
                    onClick={() => setSelectedPerson(person)}
                    className={`
                      flex
                      min-h-[72px]
                      w-full
                      flex-col
                      items-stretch
                      gap-2
                      px-3
                      py-3
                      text-left
                      transition
                      hover:bg-gray-50
                      active:bg-gray-100
                      ${index !== allPeople.length - 1
                        ? "border-b border-gray-100"
                        : ""}
                    `}
                  >

                    {/* 人名 */}

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-purple-50
                        text-base
                      ">
                        👤
                      </div>

                      <div className="
                        min-w-0
                        break-words
                        text-sm
                        font-semibold
                        text-gray-800
                      ">
                        {person}
                      </div>

                    </div>


                    {/* 各幣別 */}

                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                      pl-11
                      pr-6
                    ">

                      {entries.length > 0 ? (

                        entries.map(([currencyCode, amount]) => {

                          const currency =
                            getCurrency(currencyCode);

                          return (

                            <div
                              key={currencyCode}
                              className="text-right"
                            >

                              <div className="text-[11px] text-gray-400">
                                {currencyCode}
                              </div>

                              <div className="
                                whitespace-nowrap
                                text-xs
                                font-semibold
                                text-emerald-600
                              ">
                                {currency.symbol}
                                {formatMoney(amount)}
                              </div>

                            </div>

                          );

                        })

                      ) : (

                        <div className="text-xs text-gray-400">
                          尚未有花費
                        </div>

                      )}

                    </div>


                    {/* 右側箭頭 */}

                    <div className="ml-1 shrink-0 text-base text-gray-300">
                      ›
                    </div>

                  </button>

                );

              })}

            </div>

            <div className="mt-1 text-center text-[10px] text-gray-400">
              （僅顯示有資料的幣別）
            </div>

          </div>

        )}


        {/* =========================
            支出群組
        ========================= */}

        <div className="mb-8">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-lg font-bold">
              支出群組
            </h2>

            {editable && (

              <button
                onClick={() => setShowGroupModal(true)}
                className="
                  rounded-lg
                  px-3
                  py-1.5
                  text-sm
                  text-blue-600
                  hover:bg-blue-50
                "
              >
                ＋群組
              </button>

            )}

          </div>


          <div className="space-y-2">

            {groups.map((group) => {

              const totals =
                groupTotals[group.id];

              if (!totals) return null;

              return (

                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="
                    flex
                    select-none
                    items-center
                    justify-between
                    rounded-xl
                    bg-white
                    px-4
                    py-3
                    shadow-sm
                    active:bg-gray-50
                  "
                >

                  <div className="font-medium">

                    {group.icon} {group.name}

                  </div>

                  <div className="flex gap-4">

                    {Object.entries(totals).map(
                      ([currencyCode, amount]) => {

                        const currency =
                          getCurrency(currencyCode);

                        return (

                          <span
                            key={currencyCode}
                            className="
                              font-semibold
                              text-gray-700
                            "
                          >
                            {currency.symbol}
                            {formatMoney(amount)}
                          </span>

                        );

                      }
                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </div>


      </div>


      {/* =========================
          群組花費明細
      ========================= */}

      {selectedGroup && (

        <ExpenseGroupModal
          group={selectedGroup}
          expenses={allExpenses}
          editable={editable}
          getGroup={getGroup}
          onClose={() => setSelectedGroup(null)}
          onEdit={(expense) => {

            setSelectedGroup(null);
            setEditingExpense(expense);
            setShowModal(true);

          }}
          onDelete={handleDeleteExpense}
        />

      )}


      {/* =========================
          付款人花費明細
      ========================= */}

      {selectedPerson && (

        <PersonExpenseModal
          person={selectedPerson}
          expenses={allExpenses}
          editable={editable}
          getGroup={getGroup}
          getCurrency={getCurrency}
          formatMoney={formatMoney}
          onClose={() => setSelectedPerson(null)}
          onEdit={(expense) => {
            setSelectedPerson(null);
            setEditingExpense(expense);
            setShowModal(true);
          }}
          onDelete={handleDeleteExpense}
        />

      )}


      {/* =========================
          新增 / 編輯花費
      ========================= */}

      {editable && showModal && (

        <ExpenseModal
          expense={editingExpense}
          people={people}
          groups={groups}
          onClose={() => {

            setEditingExpense(null);

            setShowModal(false);

          }}
          onSave={handleSaveExpense}
          onAddPerson={async (name) => {

            if (!name.trim()) return;

            if (people.includes(name.trim())) return;

            await updateTrip({
              ...trip,
              expensePeople: [
                ...people,
                name.trim(),
              ],
            });

          }}
        />

      )}


      {/* =========================
          新增群組
      ========================= */}

      {editable && showGroupModal && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/40
          p-5
        ">

          <div className="
            w-full
            max-w-md
            rounded-3xl
            bg-white
            p-6
          ">

            <h2 className="text-2xl font-bold">
              新增群組
            </h2>

            <input
              value={newGroupName}
              onChange={(e) =>
                setNewGroupName(e.target.value)
              }
              placeholder="例如：寶寶用品"
              className="
                mt-5
                w-full
                rounded-xl
                border
                px-4
                py-3
                outline-none
                focus:border-blue-500
              "
            />

            <div className="mt-5 flex gap-3">

              <button
                onClick={() => {

                  setNewGroupName("");

                  setShowGroupModal(false);

                }}
                className="
                  flex-1
                  rounded-xl
                  bg-gray-200
                  py-3
                "
              >
                取消
              </button>

              <button
                onClick={handleAddGroup}
                className="
                  flex-1
                  rounded-xl
                  bg-blue-500
                  py-3
                  text-white
                "
              >
                新增
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


// ======================================================
// 付款人花費明細
// ======================================================

function PersonExpenseModal({
  person,
  expenses,
  editable,
  getGroup,
  getCurrency,
  formatMoney,
  onClose,
  onEdit,
  onDelete,
}) {

  const personExpenses = [...expenses]
    .filter((expense) => expense.person === person)
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );

  const totals = {};

  personExpenses.forEach((expense) => {

    const amount = Number(expense.amount);

    if (!Number.isFinite(amount)) return;

    if (!totals[expense.currency]) {
      totals[expense.currency] = 0;
    }

    totals[expense.currency] += amount;

  });

  const groupTotals = {};

  personExpenses.forEach((expense) => {

    const amount = Number(expense.amount);

    if (!Number.isFinite(amount)) return;

    if (!groupTotals[expense.groupId]) {
      groupTotals[expense.groupId] = {};
    }

    if (!groupTotals[expense.groupId][expense.currency]) {
      groupTotals[expense.groupId][expense.currency] = 0;
    }

    groupTotals[expense.groupId][expense.currency] += amount;

  });

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-3
      "
      onClick={onClose}
    >

      <div
        className="
          max-h-[85vh]
          w-full
          max-w-md
          overflow-y-auto
          rounded-3xl
          bg-white
          p-3
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* 標題 */}

        <div className="mb-5 flex items-center justify-between">

          <div className="min-w-0">

            <div className="
              text-xs
              font-medium
              text-purple-500
            ">
              👤 付款人明細
            </div>

            <h2 className="
              mt-1
              truncate
              text-lg
              font-bold
              text-gray-900
            ">
              {person}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              shrink-0
              rounded-full
              px-3
              py-1
              text-2xl
              text-gray-400
              hover:bg-gray-100
            "
          >
            ×
          </button>

        </div>


        {/* 明細 */}

        <div>

          <div className="
            mb-3
            text-sm
            font-bold
            text-gray-800
          ">
            記帳明細
          </div>

          {personExpenses.length === 0 ? (

            <div className="
              rounded-2xl
              bg-gray-50
              p-6
              text-center
              text-[13px]
              text-gray-400
            ">
              尚未有花費
            </div>

          ) : (

            <div
              className="
                max-h-[55vh]
                min-h-0
                space-y-2
                overflow-y-scroll
                overscroll-contain
                pr-1
                text-[13px]
                [scrollbar-width:thin]
              "
            >

              {personExpenses.map((expense) => (

                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={getCurrency(expense.currency)}
                  group={getGroup(expense.groupId)}
                  readonly={!editable || !!expense.sourceType}
                  onEdit={() => onEdit(expense)}
                  onDelete={() => onDelete(expense.id)}
                />

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


// ======================================================
// 群組花費明細
// ======================================================

function ExpenseGroupModal({
  group,
  expenses,
  editable,
  getGroup,
  onClose,
  onEdit,
  onDelete,
}) {

  const groupExpenses = [...expenses]
    .filter((expense) => expense.groupId === group.id)
    .sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-5
      "
      onClick={onClose}
    >

      <div
        className="
          max-h-[80vh]
          w-full
          max-w-md
          overflow-y-auto
          rounded-3xl
          bg-white
          p-6
        "
        onClick={(event) => event.stopPropagation()}
      >

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-bold">
            {group.icon} {group.name}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              px-3
              py-1
              text-xl
              text-gray-400
              hover:bg-gray-100
            "
          >
            ×
          </button>

        </div>

        {groupExpenses.length === 0 ? (

          <div className="py-10 text-center text-gray-400">
            尚未新增花費
          </div>

        ) : (

          <div className="space-y-3">

            {groupExpenses.map((expense) => (

              <ExpenseItem
                key={expense.id}
                expense={expense}
                currency={getCurrency(expense.currency)}
                group={getGroup(expense.groupId)}
                readonly={!editable || !!expense.sourceType}
                onEdit={() => onEdit(expense)}
                onDelete={() => onDelete(expense.id)}
              />

            ))}

          </div>

        )}

      </div>

    </div>

  );

}


// ======================================================
// 花費明細
// ======================================================

function ExpenseItem({
  expense,
  currency,
  group,
  readonly,
  onEdit,
  onDelete,
}) {

  const [showMenu, setShowMenu] = useState(false);

  return (

    <div className="
      rounded-2xl
      bg-white
      p-4
      shadow-sm
    ">

      <div className="flex items-start justify-between">

        <div className="min-w-0">

          <div className="text-xs text-gray-400">
            {expense.date}
          </div>

          <div className="mt-1 font-semibold text-gray-900">

            {group.icon} {expense.title}

          </div>

          <div className="mt-1 text-sm text-gray-500">
            👤 {expense.person || "尚未設定付款人"}
          </div>

          {expense.sourceType && (

            <div className="
              mt-1
              text-xs
              font-medium
              text-blue-500
            ">
              {expense.sourceType === "hotel"
                ? "🏨 來自住宿"
                : "🚆 來自交通"}
            </div>

          )}

          {expense.note && (

            <div className="
              mt-2
              text-xs
              leading-5
              text-gray-500
            ">
              📝 {expense.note}
            </div>

          )}

        </div>


        <div className="ml-3 flex shrink-0 items-start gap-2">

          <div className="
            text-right
            text-lg
            font-bold
            text-emerald-600
          ">

            {currency.symbol}
            {formatMoney(expense.amount)}

            <div className="
              text-xs
              font-normal
              text-gray-400
            ">
              {expense.currency}
            </div>

          </div>


          {!readonly && (

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowMenu((value) => !value)
                }
                className="
                  rounded-lg
                  px-2
                  py-1
                  text-xl
                  font-bold
                  leading-none
                  text-gray-400
                  hover:bg-gray-100
                "
              >
                ⋯
              </button>

              {showMenu && (

                <div className="
                  absolute
                  right-0
                  top-full
                  z-30
                  mt-1
                  w-28
                  overflow-hidden
                  rounded-xl
                  bg-white
                  shadow-xl
                  ring-1
                  ring-black/5
                ">

                  <button
                    onClick={() => {

                      setShowMenu(false);

                      onEdit();

                    }}
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      hover:bg-gray-100
                    "
                  >
                    ✏️ 編輯
                  </button>

                  <button
                    onClick={() => {

                      setShowMenu(false);

                      onDelete();

                    }}
                    className="
                      w-full
                      px-4
                      py-3
                      text-left
                      text-sm
                      text-red-600
                      hover:bg-red-50
                    "
                  >
                    🗑️ 刪除
                  </button>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


// ======================================================
// 花費 Modal
// ======================================================

function ExpenseModal({
  expense,
  people,
  groups,
  onClose,
  onSave,
  onAddPerson,
}) {

  const [form, setForm] = useState(
    expense
      ? {
          ...expense,
          amount: String(expense.amount),
        }
      : getInitialExpense()
  );

  const [showNewPerson, setShowNewPerson] =
    useState(false);

  const [personInput, setPersonInput] =
    useState("");


  function update(field, value) {

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

  }


  async function handleAddPerson() {

    const name = personInput.trim();

    if (!name) return;

    await onAddPerson(name);

    setForm((prev) => ({
      ...prev,
      person: name,
    }));

    setPersonInput("");

    setShowNewPerson(false);

  }


  return (

    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-5
    ">

      <div className="
        max-h-[90vh]
        w-full
        max-w-md
        overflow-y-auto
        rounded-3xl
        bg-white
        p-6
      ">

        <h2 className="text-2xl font-bold">
          {expense ? "編輯花費" : "新增花費"}
        </h2>


        {/* 名稱 */}

        <input
          value={form.title}
          onChange={(e) =>
            update("title", e.target.value)
          }
          placeholder="花費名稱，例如：晚餐"
          className="
            mt-5
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
            focus:border-blue-500
          "
        />


        {/* 金額 */}

        <input
          type="number"
          inputMode="decimal"
          value={form.amount}
          onChange={(e) =>
            update("amount", e.target.value)
          }
          placeholder="金額"
          className="
            mt-3
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
            focus:border-blue-500
          "
        />


        {/* 幣別 */}

        <select
          value={form.currency}
          onChange={(e) =>
            update("currency", e.target.value)
          }
          className="
            mt-3
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
          "
        >

          {Object.entries(CURRENCY_MAP).map(
            ([code, currency]) => (

              <option
                key={code}
                value={code}
              >
                {code} — {currency.name}
              </option>

            )
          )}

        </select>


        {/* 日期 */}

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            update("date", e.target.value)
          }
          className="
            mt-3
            box-border
            block
            w-full
            max-w-full
            min-w-0
            rounded-xl
            border
            px-4
            py-3
          "
        />


        {/* 群組 */}

        <select
          value={form.groupId}
          onChange={(e) =>
            update("groupId", e.target.value)
          }
          className="
            mt-3
            w-full
            rounded-xl
            border
            px-4
            py-3
          "
        >

          {groups.map((group) => (

            <option
              key={group.id}
              value={group.id}
            >
              {group.icon} {group.name}
            </option>

          ))}

        </select>


        {/* 付款人 */}

        <div className="mt-3">

          <select
            value={form.person}
            onChange={(e) =>
              update("person", e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              px-4
              py-3
            "
          >

            <option value="">
              選擇付款人
            </option>

            {people.map((person) => (

              <option
                key={person}
                value={person}
              >
                {person}
              </option>

            ))}

          </select>


          <button
            type="button"
            onClick={() =>
              setShowNewPerson((value) => !value)
            }
            className="
              mt-2
              text-sm
              text-blue-600
            "
          >
            ＋ 新增付款人
          </button>


          {showNewPerson && (

            <div className="mt-2 flex gap-2">

              <input
                value={personInput}
                onChange={(e) =>
                  setPersonInput(e.target.value)
                }
                placeholder="輸入姓名"
                className="
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  px-4
                  py-2
                "
              />

              <button
                type="button"
                onClick={handleAddPerson}
                className="
                  rounded-xl
                  bg-blue-500
                  px-4
                  text-white
                "
              >
                加入
              </button>

            </div>

          )}

        </div>


        {/* 備註 */}

        <textarea
          value={form.note}
          onChange={(e) =>
            update("note", e.target.value)
          }
          placeholder="備註（可不填）"
          rows={3}
          className="
            mt-3
            w-full
            resize-none
            rounded-xl
            border
            px-4
            py-3
          "
        />


        {/* 按鈕 */}

        <div className="mt-5 flex gap-3">

          <button
            onClick={onClose}
            className="
              flex-1
              rounded-xl
              bg-gray-200
              py-3
              font-semibold
            "
          >
            取消
          </button>

          <button
            onClick={() => onSave(form)}
            className="
              flex-1
              rounded-xl
              bg-blue-500
              py-3
              font-semibold
              text-white
            "
          >
            {expense ? "儲存" : "新增"}
          </button>

        </div>

      </div>

    </div>

  );

}