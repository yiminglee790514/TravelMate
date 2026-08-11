const covers = [
  {
    keys: ["日本", "japan", "jp"],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85",
    position: "center 48%",
  },
  {
    keys: ["韓國", "南韓", "korea", "south korea", "kr"],
    image: "https://images.unsplash.com/photo-1538485399081-7c897e3b6b4f?auto=format&fit=crop&w=1600&q=85",
    position: "center 45%",
  },
  {
    keys: ["台灣", "臺灣", "taiwan", "tw"],
    image: "https://images.unsplash.com/photo-1509328271778-0f8d5e4b4c7f?auto=format&fit=crop&w=1600&q=85",
    position: "center 50%",
  },
  {
    keys: ["美國", "usa", "united states", "america"],
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=85",
    position: "center 45%",
  },
  {
    keys: ["法國", "france", "fr"],
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85",
    position: "center 50%",
  },
  {
    keys: ["義大利", "意大利", "italy", "it"],
    image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1600&q=85",
    position: "center 50%",
  },
  {
    keys: ["泰國", "thailand", "th"],
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=85",
    position: "center 45%",
  },
  {
    keys: ["新加坡", "singapore", "sg"],
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=85",
    position: "center 45%",
  },
];

const fallback = {
  image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85",
  position: "center 50%",
};

export function getTripCover(country = "") {
  const value = String(country).trim().toLowerCase();
  return covers.find((cover) => cover.keys.some((key) => value === key || value.includes(key))) || fallback;
}
