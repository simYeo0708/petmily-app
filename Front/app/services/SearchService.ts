import { API_BASE_URL } from '../config/api';

export interface BackendSearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

export interface BackendSearchResponse {
  query: string;
  results: Record<string, BackendSearchResult[]>;
  suggestions: string[];
  totalCount: number;
}

export const searchProducts = async (query: string): Promise<BackendSearchResult[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/search/product?query=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      console.warn('상품 검색 API 호출 실패', response.status);
      return [];
    }

    const data = (await response.json()) as BackendSearchResult[];
    return data ?? [];
  } catch (error) {
    console.warn('상품 검색 API 호출 중 오류', error);
    return [];
  }
};

export const searchAll = async (
  query: string,
  types?: string[]
): Promise<BackendSearchResponse | null> => {
  if (!query.trim()) {
    return null;
  }

  const params = new URLSearchParams({ query: query.trim() });
  if (types && types.length > 0) {
    types.forEach((type) => params.append('types', type));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
    if (!response.ok) {
      console.warn('통합 검색 API 호출 실패', response.status);
      return null;
    }

    const data = (await response.json()) as BackendSearchResponse;
    return data;
  } catch (error) {
    console.warn('통합 검색 API 호출 중 오류', error);
    return null;
  }
};

