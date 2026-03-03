export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  taxId?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: string;
  name: string;
  specification: string;
  defaultPrice: number;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  name: string;
  specification: string;
  price: number;
  quantity: number;
}

export type TaxType = "none" | "exclusive" | "inclusive";
export type DiscountType = "amount" | "percentage";
