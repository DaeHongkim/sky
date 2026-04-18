import { Store, District } from "@/types";

export const mockStores: Store[] = [
  { id: "1", name: "해운대 카페", category: "카페", address: "부산 해운대구 해운대해변로 30", lat: 35.1587, lng: 129.1603, district: "해운대구", monthlyRent: 250, size: 50, status: "available", phone: "051-123-4567", description: "해운대 해변 인근 카페 자리", createdAt: "2024-01-15" },
  { id: "2", name: "서면 음식점", category: "음식점", address: "부산 부산진구 서면로 68", lat: 35.1579, lng: 129.0596, district: "부산진구", monthlyRent: 180, size: 80, status: "available", phone: "051-234-5678", description: "서면 중심부 음식점 자리", createdAt: "2024-01-20" },
  { id: "3", name: "남포동 의류", category: "의류", address: "부산 중구 광복로 43", lat: 35.0975, lng: 129.0317, district: "중구", monthlyRent: 320, size: 65, status: "occupied", phone: "051-345-6789", description: "광복로 상권 의류 매장", createdAt: "2024-02-01" },
  { id: "4", name: "동래 학원", category: "학원", address: "부산 동래구 동래로 161", lat: 35.1992, lng: 129.0855, district: "동래구", monthlyRent: 150, size: 120, status: "available", phone: "051-456-7890", description: "주거밀집 학원 입지", createdAt: "2024-02-10" },
  { id: "5", name: "사직 편의점", category: "편의점", address: "부산 동래구 사직로 55", lat: 35.1940, lng: 129.0605, district: "동래구", monthlyRent: 90, size: 30, status: "pending", phone: "051-567-8901", description: "사직야구장 인근 편의점", createdAt: "2024-02-15" },
  { id: "6", name: "기장 미용실", category: "미용실", address: "부산 기장군 기장읍 기장대로 560", lat: 35.2449, lng: 129.2226, district: "기장군", monthlyRent: 70, size: 40, status: "available", phone: "051-678-9012", description: "기장읍 주택가 미용실", createdAt: "2024-03-01" },
  { id: "7", name: "수영 약국", category: "약국", address: "부산 수영구 수영로 427", lat: 35.1456, lng: 129.1134, district: "수영구", monthlyRent: 130, size: 35, status: "available", phone: "051-789-0123", description: "수영역 인근 약국 자리", createdAt: "2024-03-05" },
  { id: "8", name: "센텀 카페", category: "카페", address: "부산 해운대구 센텀중앙로 60", lat: 35.1699, lng: 129.1286, district: "해운대구", monthlyRent: 300, size: 70, status: "available", phone: "051-890-1234", description: "센텀시티 상업지구 카페", createdAt: "2024-03-10" },
];

export const mockDistricts: District[] = [
  { name: "해운대구", storeCount: 4820, avgRent: 275, growthRate: 8.2, topCategory: "카페/음식점", lat: 35.1631, lng: 129.1636 },
  { name: "부산진구", storeCount: 6130, avgRent: 210, growthRate: 5.1, topCategory: "음식점", lat: 35.1623, lng: 129.0530 },
  { name: "중구", storeCount: 3200, avgRent: 380, growthRate: 3.7, topCategory: "의류/잡화", lat: 35.1062, lng: 129.0325 },
  { name: "동래구", storeCount: 2980, avgRent: 145, growthRate: 4.5, topCategory: "학원", lat: 35.1996, lng: 129.0858 },
  { name: "수영구", storeCount: 2450, avgRent: 165, growthRate: 6.3, topCategory: "카페", lat: 35.1456, lng: 129.1134 },
  { name: "기장군", storeCount: 1200, avgRent: 85, growthRate: 9.8, topCategory: "음식점", lat: 35.2449, lng: 129.2226 },
  { name: "강서구", storeCount: 890, avgRent: 75, growthRate: 12.4, topCategory: "음식점", lat: 35.2121, lng: 128.9822 },
  { name: "사하구", storeCount: 2100, avgRent: 110, growthRate: 3.2, topCategory: "편의점", lat: 35.1027, lng: 128.9742 },
];
