export type ApiErrorBody = {
  error?: { code?: string; message?: string; requestId?: string };
};

export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
};

export type Article = {
  id: string;
  title: string;
  format: string;
  isLowData: boolean;
  language: 'EN' | 'RW' | string;
  categoryId: string;
};

export type Myth = {
  id: string;
  language: 'EN' | 'RW' | string;
  mythText: string;
  factText: string;
  sources: string[];
};

export type FacilityService = {
  id: string;
  facilityId: string;
  serviceName: string;
  status: 'YES' | 'LIKELY' | 'NO' | 'UNKNOWN' | string;
  costType: 'FREE' | 'SUBSIDIZED' | 'PAID' | 'UNKNOWN' | string;
};

export type Facility = {
  id: string;
  name: string;
  facilityType: string;
  ownership: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  openingHours: string | null;
  isYouthFriendly: string;
  isIsange: string;
  showInApp: boolean;
  verifiedAt: string | null;
  services: FacilityService[];
};

export type RegistrationInput = {
  email: string;
  password: string;
  ageBand?: string;
  gender?: string;
  district?: string;
  language?: 'EN' | 'RW';
};

export type ProfileInput = {
  alias?: string;
  ageBand?: string;
  gender?: string;
  district?: string;
  language?: 'EN' | 'RW';
};
