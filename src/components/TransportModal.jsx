import { useState } from "react";

export default function TransportModal({
  transport,
  onClose,
  onSave,
  people = [],
  onAddPerson,
}) {

  const isEdit = !!transport;

  const [type, setType] = useState(
    transport?.type || "🚆 電車"
  );

  const [company, setCompany] = useState(
    transport?.company || ""
  );

  const [from, setFrom] = useState(
    transport?.from || ""
  );

  const [to, setTo] = useState(
    transport?.to || ""
  );

  const [departureDate, setDepartureDate] = useState(
    transport?.departureDate || ""
  );

  const [departureTime, setDepartureTime] = useState(
    transport?.departureTime || ""
  );

  const [arrivalDate, setArrivalDate] = useState(
    transport?.arrivalDate || ""
  );

  const [arrivalTime, setArrivalTime] = useState(
    transport?.arrivalTime || ""
  );

  const [price, setPrice] = useState(
    transport?.price || ""
  );

  const [currency, setCurrency] = useState(
    transport?.currency || "JPY"
  );

  const [group, setGroup] = useState(
    transport?.group || "一般交通"
  );

  // 付款人：與花費共用 expensePeople
  const [payer, setPayer] = useState(
    transport?.payer || ""
  );

  const [newPayer, setNewPayer] = useState("");

  const [showPayerInput, setShowPayerInput] = useState(false);

  const [website, setWebsite] = useState(
    transport?.website || ""
  );

  const [note, setNote] = useState(
    transport?.note || ""
  );


  function handleAddPayer() {

    const name = newPayer.trim();

    if (!name) return;

    if (people.includes(name)) {

      setPayer(name);
      setNewPayer("");
      setShowPayerInput(false);

      return;

    }

    if (onAddPerson) {

      onAddPerson(name);

    }

    setPayer(name);
    setNewPayer("");
    setShowPayerInput(false);

  }


  function handleSave() {

    if (!company.trim()) {

      alert("請輸入交通名稱");

      return;

    }

    onSave({

      id: transport?.id || Date.now(),

      type,
      company,

      from,
      to,

      departureDate,
      departureTime,

      arrivalDate,
      arrivalTime,

      price,
      currency,

      group,

      payer,

      website,
      note,

    });

    onClose();

  }


  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/40
        p-3
      "
    >

      <div
        className="
          my-4
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-5
          shadow-2xl
        "
      >

        <h2 className="mb-4 text-2xl font-bold">

          {isEdit ? "修改交通" : "新增交通"}

        </h2>


        <div className="space-y-3">


          {/* 交通類型 */}

          <select
            className="
              h-11
              w-full
              rounded-xl
              border
              px-3
            "
            value={type}
            onChange={(e) => setType(e.target.value)}
          >

            <option>✈️ 飛機</option>
            <option>🚄 新幹線</option>
            <option>🚆 電車</option>
            <option>🚇 地鐵</option>
            <option>🚌 公車</option>
            <option>🚖 計程車</option>
            <option>🚶 步行</option>
            <option>🚗 租車</option>
            <option>🚢 渡輪</option>
            <option>🚠 纜車</option>

          </select>


          {/* 交通名稱 */}

          <input
            className="
              h-11
              w-full
              rounded-xl
              border
              px-3
            "
            placeholder="交通名稱（JR、南海電鐵...）"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />


          {/* 付款人 */}

          <div>

            <div className="mb-1 text-xs font-semibold text-gray-500">
              付款人
            </div>

            <div className="flex gap-2">

              <select
                className="
                  h-11
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  px-3
                "
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
              >

                <option value="">選擇付款人</option>

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
                  setShowPayerInput((value) => !value)
                }
                className="
                  h-11
                  shrink-0
                  rounded-xl
                  bg-gray-100
                  px-3
                  text-sm
                  font-semibold
                  text-gray-700
                  hover:bg-gray-200
                "
              >
                ＋ 人名
              </button>

            </div>


            {showPayerInput && (

              <div className="mt-2 flex gap-2">

                <input
                  autoFocus
                  className="
                    h-10
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    px-3
                    text-sm
                  "
                  placeholder="輸入付款人姓名"
                  value={newPayer}
                  onChange={(e) =>
                    setNewPayer(e.target.value)
                  }
                  onKeyDown={(e) => {

                    if (e.key === "Enter") {
                      handleAddPayer();
                    }

                  }}
                />

                <button
                  type="button"
                  onClick={handleAddPayer}
                  className="
                    h-10
                    rounded-xl
                    bg-blue-500
                    px-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  新增
                </button>

              </div>

            )}

          </div>


          {/* 群組 */}

          <div className="flex gap-2">

            <select
              className="
                h-11
                flex-1
                rounded-xl
                border
                px-3
              "
              value={
                [
                  "一般交通",
                  "機場交通",
                  "市區交通",
                  "自駕",
                ].includes(group)
                  ? group
                  : "自訂群組"
              }
              onChange={(e) => {

                if (e.target.value === "自訂群組") {

                  setGroup("");

                } else {

                  setGroup(e.target.value);

                }

              }}
            >

              <option>一般交通</option>
              <option>機場交通</option>
              <option>市區交通</option>
              <option>自駕</option>
              <option>自訂群組</option>

            </select>

            {!(
              [
                "一般交通",
                "機場交通",
                "市區交通",
                "自駕",
              ].includes(group)
            ) && (

              <input
                className="
                  h-11
                  flex-1
                  rounded-xl
                  border
                  px-3
                "
                placeholder="群組名稱"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />

            )}

          </div>


          {/* 起點 / 終點 */}

          <div className="grid grid-cols-2 gap-2">

            <input
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-3
              "
              placeholder="起點"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-3
              "
              placeholder="終點"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

          </div>


          {/* 出發日期 / 時間 */}

          <div className="grid grid-cols-[1fr_0.78fr] gap-2">

            <input
              type="date"
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-2
                text-sm
              "
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />

            <input
              type="time"
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-2
                text-sm
              "
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />

          </div>


          {/* 抵達日期 / 時間 */}

          <div className="grid grid-cols-[1fr_0.78fr] gap-2">

            <input
              type="date"
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-2
                text-sm
              "
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
            />

            <input
              type="time"
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-2
                text-sm
              "
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />

          </div>


          {/* 價格 / 幣別 */}

          <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">

            <select
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-2
                text-sm
              "
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >

              <option value="JPY">JPY 日圓</option>
              <option value="TWD">TWD 台幣</option>
              <option value="USD">USD 美金</option>
              <option value="KRW">KRW 韓元</option>
              <option value="CNY">CNY 人民幣</option>
              <option value="HKD">HKD 港幣</option>
              <option value="SGD">SGD 新幣</option>
              <option value="THB">THB 泰銖</option>

            </select>

            <input
              type="number"
              className="
                h-11
                min-w-0
                rounded-xl
                border
                px-3
              "
              placeholder="價格"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

          </div>


          {/* 網站 */}

          <input
            className="
              h-11
              w-full
              rounded-xl
              border
              px-3
            "
            placeholder="網站"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />


          {/* 備註 */}

          <textarea
            rows="3"
            className="
              w-full
              rounded-xl
              border
              p-3
              resize-none
            "
            placeholder="備註"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

        </div>


        {/* 按鈕 */}

        <div className="mt-5 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="
              rounded-xl
              bg-gray-200
              px-5
              py-2.5
            "
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="
              rounded-xl
              bg-blue-500
              px-5
              py-2.5
              text-white
            "
          >
            {isEdit ? "儲存" : "新增"}
          </button>

        </div>

      </div>

    </div>

  );

}
