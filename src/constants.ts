import { SalesRep, Vendor, Product, QuoteItem } from "./types";

export const MOCK_SALES_REPS: SalesRep[] = [
  { id: "s1", name: "陳大文 (Kevin)", email: "kevin@marketing.com", phone: "0912-345-678" },
  { id: "s2", name: "林小美 (May)", email: "may@marketing.com", phone: "0923-456-789" },
  { id: "s3", name: "張志明 (Jimmy)", email: "jimmy@marketing.com", phone: "0934-567-890" },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: "v1", companyName: "數位創意有限公司", taxId: "12345678", contactPerson: "王經理", phone: "02-2345-6789", email: "wang@digital.com" },
  { id: "v2", companyName: "未來科技股份有限公司", taxId: "87654321", contactPerson: "李小姐", phone: "03-3456-7890", email: "lee@future.com" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "FB/IG 社群代營運", specification: "每月 12 篇貼文 + 廣告投放操作", defaultPrice: 35000 },
  { id: "p2", name: "Google 關鍵字廣告", specification: "關鍵字策略規劃 + 報表分析", defaultPrice: 15000 },
  { id: "p3", name: "KOL 網紅媒合服務", specification: "包含 3 位微網紅合作洽談", defaultPrice: 50000 },
  { id: "p4", name: "品牌視覺設計 (Logo)", specification: "三款初稿 + 兩次修改", defaultPrice: 20000 },
  { id: "p5", name: "SEO 網站優化", specification: "站內結構調整 + 外部連結建立", defaultPrice: 45000 },
];
