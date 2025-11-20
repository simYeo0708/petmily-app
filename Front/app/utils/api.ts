import API_CONFIG from '../config/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * URL에 쿼리 파라미터 추가
 */
const buildUrlWithParams = (url: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

  return queryString ? `${url}?${queryString}` : url;
};

/**
 * 기본 fetch 래퍼 함수
 */
const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, ...fetchOptions } = options;

  const url = buildUrlWithParams(
    `${API_CONFIG.BASE_URL}${endpoint}`,
    params
  );

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...API_CONFIG.HEADERS,
      ...fetchOptions.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('요청 시간이 초과되었습니다.');
      }
      throw new ApiError(`네트워크 오류: ${error.message}`);
    }

    throw new ApiError('알 수 없는 오류가 발생했습니다.');
  }
};

/**
 * GET 요청
 */
export const get = <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: Omit<RequestOptions, 'params'>
): Promise<T> => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'GET',
    params,
  });
};

/**
 * POST 요청
 */
export const post = <T = any>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT 요청
 */
export const put = <T = any>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE 요청
 */
export const del = <T = any>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

export default {
  get,
  post,
  put,
  delete: del,
};
