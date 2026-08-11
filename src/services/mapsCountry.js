const COUNTRY_CONFIG = [
  { code: "JP", names: ["日本", "japan", "jp"] },
  { code: "KR", names: ["韓國", "南韓", "korea", "south korea", "kr"] },
  { code: "TW", names: ["台灣", "臺灣", "taiwan", "tw"] },
  { code: "US", names: ["美國", "usa", "united states", "america"] },
  { code: "CA", names: ["加拿大", "canada", "ca"] },
  { code: "GB", names: ["英國", "united kingdom", "uk", "great britain", "gb"] },
  { code: "FR", names: ["法國", "france", "fr"] },
  { code: "IT", names: ["義大利", "意大利", "italy", "it"] },
  { code: "DE", names: ["德國", "germany", "de"] },
  { code: "ES", names: ["西班牙", "spain", "es"] },
  { code: "TH", names: ["泰國", "thailand", "th"] },
  { code: "SG", names: ["新加坡", "singapore", "sg"] },
  { code: "HK", names: ["香港", "hong kong", "hk"] },
  { code: "MO", names: ["澳門", "澳门", "macau", "macao", "mo"] },
  { code: "VN", names: ["越南", "vietnam", "vn"] },
  { code: "AU", names: ["澳洲", "澳大利亞", "australia", "au"] },
  { code: "NZ", names: ["紐西蘭", "new zealand", "nz"] },
  { code: "MY", names: ["馬來西亞", "malaysia", "my"] },
  { code: "ID", names: ["印尼", "印度尼西亞", "indonesia", "id"] },
  { code: "PH", names: ["菲律賓", "philippines", "ph"] },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function getCountryCode(country = "") {
  const value = normalize(country);
  if (!value) return "";
  const exact = COUNTRY_CONFIG.find((item) =>
    item.names.some((name) => value === normalize(name))
  );
  return exact?.code || "";
}

export function getCountryNames(country = "") {
  const code = getCountryCode(country);
  return COUNTRY_CONFIG.find((item) => item.code === code)?.names || [country];
}

/**
 * 判斷 Google Places 回傳的地址是否屬於旅程國家。
 * 優先使用 Places API 回傳的 ISO country code；舊資料沒有 code 時才退回地址文字。
 */
export function isPlaceInCountry(place, country = "") {
  const expectedCode = getCountryCode(country);
  if (!expectedCode) return true;

  const actualCode = normalize(place?.countryCode);
  if (actualCode) return actualCode === expectedCode.toLowerCase();

  const address = normalize(place?.address);
  if (!address) return false;

  return getCountryNames(country).some((name) => {
    const n = normalize(name);
    if (!n) return false;
    return address.includes(n);
  });
}

export function isItemInCountry(item, country = "") {
  if (!String(item?.address || "").trim()) return false;

  const expectedCode = getCountryCode(country);
  if (!expectedCode) return true;

  const storedCode = normalize(item?.extra?.countryCode);
  if (storedCode) return storedCode === expectedCode.toLowerCase();

  return isPlaceInCountry({ address: item.address }, country);
}

export const COUNTRY_REGION_CODES = Object.fromEntries(
  COUNTRY_CONFIG.map((item) => [item.code, item.code])
);

export function getRegionCode(country = "") {
  return getCountryCode(country);
}
