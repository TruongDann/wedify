/** Ngân hàng hỗ trợ VietQR (img.vietqr.io): mã, tên hiển thị và các cách gõ thường gặp. */
const BANKS: Array<{ code: string; name: string; aliases?: string[] }> = [
  { code: "VCB", name: "Vietcombank", aliases: ["vietcombank", "vcb"] },
  { code: "TCB", name: "Techcombank", aliases: ["techcombank", "tcb"] },
  { code: "MB", name: "MB Bank", aliases: ["mbbank", "mb", "quandoi"] },
  { code: "ACB", name: "ACB", aliases: ["acb"] },
  { code: "BIDV", name: "BIDV", aliases: ["bidv"] },
  { code: "ICB", name: "VietinBank", aliases: ["vietinbank", "viettinbank", "vietin", "icb", "ctg"] },
  { code: "VBA", name: "Agribank", aliases: ["agribank", "vba"] },
  { code: "VPB", name: "VPBank", aliases: ["vpbank", "vpb"] },
  { code: "TPB", name: "TPBank", aliases: ["tpbank", "tpb"] },
  { code: "STB", name: "Sacombank", aliases: ["sacombank", "stb"] },
  { code: "SHB", name: "SHB", aliases: ["shb"] },
  { code: "HDB", name: "HDBank", aliases: ["hdbank", "hdb"] },
  { code: "VIB", name: "VIB", aliases: ["vib"] },
  { code: "OCB", name: "OCB", aliases: ["ocb"] },
  { code: "MSB", name: "MSB", aliases: ["msb", "maritimebank"] },
  { code: "SCB", name: "SCB", aliases: ["scb"] },
  { code: "EIB", name: "Eximbank", aliases: ["eximbank", "eib"] },
  { code: "LPB", name: "LPBank", aliases: ["lpbank", "lienvietpostbank", "lpb"] },
  { code: "SEAB", name: "SeABank", aliases: ["seabank", "seab"] },
  { code: "ABB", name: "ABBank", aliases: ["abbank", "abb"] },
  { code: "NAB", name: "Nam A Bank", aliases: ["namabank", "nab"] },
  { code: "BAB", name: "Bac A Bank", aliases: ["bacabank", "bab"] },
  { code: "VAB", name: "VietABank", aliases: ["vietabank", "vab"] },
  { code: "PVCB", name: "PVcomBank", aliases: ["pvcombank", "pvcb"] },
  { code: "CAKE", name: "Cake by VPBank", aliases: ["cake"] },
  { code: "Ubank", name: "Ubank by VPBank", aliases: ["ubank"] },
  { code: "TIMO", name: "Timo", aliases: ["timo"] },
  { code: "KLB", name: "Kienlongbank", aliases: ["kienlongbank", "klb"] },
  { code: "BVB", name: "BaoVietBank", aliases: ["baovietbank", "bvb"] },
  { code: "DOB", name: "DongA Bank", aliases: ["dongabank", "dob"] },
];

const norm = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const VIETQR_BANKS = BANKS.map((bank) => ({ value: bank.code, label: `${bank.name} (${bank.code})` }));

/** Đổi tên ngân hàng người dùng gõ (vd. "Viettinbank") về mã VietQR (vd. "ICB"). Không nhận ra thì giữ nguyên. */
export const resolveBankCode = (bank: string) => {
  const key = norm(bank);
  const found = BANKS.find((item) => norm(item.code) === key || item.aliases?.includes(key) || norm(item.name) === key);
  return found?.code ?? bank.trim();
};

export const vietQrUrl = (bank: string, number: string, holder?: string) =>
  `https://img.vietqr.io/image/${encodeURIComponent(resolveBankCode(bank))}-${encodeURIComponent(number.replace(/\s/g, ""))}-compact2.png?accountName=${encodeURIComponent(holder || "")}`;
