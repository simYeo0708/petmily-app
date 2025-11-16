import { get } from '../utils/api';

/**
 * 검색 결과 아이템 타입
 */
export interface SearchResultItem {
  type: string;        // 검색 타입 (menu, product, walker, pet, booking 등)
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  route?: string;
  metadata?: Record<string, any>;
}

/**
 * 검색 응답 타입
 */
export interface SearchResponse {
  query: string;
  results: Record<string, SearchResultItem[]>;
  suggestions?: string[];
  totalCount?: number;
}

/**
 * 메뉴 아이템 타입
 */
export interface MenuItem {
  id: string;
  name: string;
  route: string;
  category: string;
  description?: string;
  icon?: string;
}

/**
 * 검색 서비스
 */
class SearchService {
  /**
   * 전체 검색
   * @param query 검색어
   * @param types 검색 타입 목록 (optional)
   */
  async searchAll(query: string, types?: string[]): Promise<SearchResponse> {
    const params: Record<string, any> = { query };
    if (types && types.length > 0) {
      params.types = types;
    }

    return get<SearchResponse>('/api/search', params);
  }

  /**
   * 타입별 검색
   * @param type 검색 타입
   * @param query 검색어
   */
  async searchByType(type: string, query: string): Promise<SearchResultItem[]> {
    return get<SearchResultItem[]>(`/api/search/${type}`, { query });
  }

  /**
   * 자동완성
   * @param type 검색 타입
   * @param query 검색어
   */
  async autocomplete(type: string, query: string): Promise<string[]> {
    return get<string[]>(`/api/search/${type}/autocomplete`, { query });
  }

  /**
   * 사용 가능한 검색 타입 목록 조회
   */
  async getAvailableTypes(): Promise<string[]> {
    return get<string[]>('/api/search/types');
  }

  /**
   * 카테고리별 메뉴 조회
   * @param category 카테고리
   */
  async getMenusByCategory(category: string): Promise<MenuItem[]> {
    return get<MenuItem[]>(`/api/search/menu/category/${category}`);
  }
}

export default new SearchService();
