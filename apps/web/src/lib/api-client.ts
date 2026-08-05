const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: { code: string; message: string; details?: Array<{ field: string; message: string }> };
}

// Simple in-memory cache with TTL
interface CacheEntry { data: any; timestamp: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 seconds

// In-flight request deduplication
const inflight = new Map<string, Promise<any>>();

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /** Invalidate all cached responses (call after mutations) */
  invalidateCache(prefix?: string) {
    if (!prefix) {
      cache.clear();
    } else {
      for (const key of cache.keys()) {
        if (key.includes(prefix)) cache.delete(key);
      }
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) { this.clearTokens(); return false; }

      const json = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>;
      if (json.success && json.data) {
        this.setTokens(json.data.accessToken, json.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch {
      return {
        success: false, message: 'Network error', data: {} as T,
        error: { code: 'NETWORK_ERROR', message: 'Cannot connect to server. Please check your internet connection.' },
      };
    }

    // 401 → refresh token
    if (res.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        try { res = await fetch(url, { ...options, headers }); }
        catch { return { success: false, message: 'Network error', data: {} as T, error: { code: 'NETWORK_ERROR', message: 'Cannot connect to server.' } }; }
      } else {
        this.clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    let json: ApiResponse<T>;
    try { json = (await res.json()) as ApiResponse<T>; }
    catch { return { success: false, message: 'Invalid server response', data: {} as T, error: { code: 'PARSE_ERROR', message: `Server returned status ${res.status} with non-JSON response.` } }; }
    return json;
  }

  /** GET with automatic caching + deduplication */
  async get<T>(endpoint: string, opts?: { skipCache?: boolean }): Promise<ApiResponse<T>> {
    const cacheKey = endpoint;

    // Return cached if fresh
    if (!opts?.skipCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as ApiResponse<T>;
      }
    }

    // Deduplicate in-flight requests
    if (inflight.has(cacheKey)) {
      return inflight.get(cacheKey) as Promise<ApiResponse<T>>;
    }

    const promise = this.request<T>(endpoint, { method: 'GET' }).then((result) => {
      // Cache successful responses
      if (result.success) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      inflight.delete(cacheKey);
      return result;
    });

    inflight.set(cacheKey, promise);
    return promise;
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
    if (result.success) this.invalidateCache(); // Invalidate after mutation
    return result;
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
    if (result.success) this.invalidateCache();
    return result;
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
    if (result.success) this.invalidateCache();
    return result;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'DELETE' });
    if (result.success) this.invalidateCache();
    return result;
  }
}

export const apiClient = new ApiClient(API_BASE);
