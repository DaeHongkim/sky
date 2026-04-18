export interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  district: string;
  monthlyRent?: number;
  size?: number;
  status: "available" | "occupied" | "pending";
  phone?: string;
  description?: string;
  createdAt: string;
}

export interface District {
  name: string;
  storeCount: number;
  avgRent: number;
  growthRate: number;
  topCategory: string;
  lat: number;
  lng: number;
}

export type StoreCategory =
  | "음식점"
  | "카페"
  | "편의점"
  | "미용실"
  | "약국"
  | "학원"
  | "의류"
  | "기타";
