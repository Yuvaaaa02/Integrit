// API Client for Integrit Frontend Integration

const BASE_URL = "/api";
const TOKEN_KEY = "pingwin_jwt_token";
const REFRESH_TOKEN_KEY = "pingwin_refresh_token";
const USER_KEY = "pingwin_user";

// Custom API Error class
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Token helper helpers
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function removeTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function saveStoredUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Low-level fetch wrapper with automatic request caching, deduplication, and JWT injection
const requestCache = new Map<string, { data: any; timestamp: number }>();
const activeRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 10000; // 10 seconds cache TTL

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || "GET";
  const cacheKey = `${method}:${endpoint}:${options.body ? String(options.body) : ""}`;

  // Caching & Deduplication logic for GET requests
  if (method === "GET") {
    // 1. Check in-memory Cache
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[API Cache Hit] ${endpoint}`);
      return cached.data;
    }

    // 2. Check Active Requests (Deduplication)
    const active = activeRequests.get(cacheKey);
    if (active) {
      console.log(`[API Deduplication Hit] ${endpoint}`);
      return active;
    }
  }

  const executeRequest = async () => {
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config = {
      ...options,
      headers,
    };

    console.log(`[API Fetching] ${method} ${endpoint}`);
    let response = await fetch(url, config);

    // If unauthorized, attempt to refresh the token and retry once
    if (response.status === 401 && endpoint !== "/auth/login") {
      const refreshToken = getRefreshToken();
      if (refreshToken && endpoint !== "/auth/refresh") {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { data } = await refreshResponse.json();
            saveTokens(data.token, refreshToken);
            
            // Retry original request with new token
            headers.set("Authorization", `Bearer ${data.token}`);
            response = await fetch(url, config);
          } else {
            // Refresh failed, clean session
            removeTokens();
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("pingwin_admin_session");
              window.location.href = "/admin";
            }
          }
        } catch (err) {
          removeTokens();
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("pingwin_admin_session");
            window.location.href = "/admin";
          }
        }
      } else {
        // No refresh token, but unauthorized on protected route
        removeTokens();
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pingwin_admin_session");
          window.location.href = "/admin";
        }
      }
    }

    const resJson = await response.json();

    if (!response.ok) {
      throw new ApiError(resJson.message || "Something went wrong", response.status);
    }

    const responseData = resJson.data;

    // Cache the successful GET response
    if (method === "GET") {
      requestCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    }

    return responseData;
  };

  if (method === "GET") {
    const promise = executeRequest().finally(() => {
      activeRequests.delete(cacheKey);
    });
    activeRequests.set(cacheKey, promise);
    return promise;
  }

  return executeRequest();
}

// API methods
export const api = {
  // Authentication
  auth: {
    async login(credentials: any) {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      saveTokens(data.token, data.refreshToken);
      saveStoredUser(data.user);
      return data;
    },
    async logout() {
      const refreshToken = getRefreshToken();
      try {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err) {
        // Suppress logout errors
      } finally {
        removeTokens();
      }
    },
    async getMe() {
      const user = await request("/auth/me");
      saveStoredUser(user);
      return user;
    },
  },

  // Products
  products: {
    async list(params?: { category?: string; tag?: string; search?: string; status?: string }) {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = query ? `/products?${query}` : "/products";
      const result = await request(endpoint);
      return result.products;
    },
    async get(slug: string) {
      return request(`/products/${slug}`);
    },
    async create(data: any) {
      return request("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(slug: string, data: any) {
      return request(`/products/${slug}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(slug: string) {
      return request(`/products/${slug}`, {
        method: "DELETE",
      });
    },
  },

  // Services
  services: {
    async list() {
      return request("/services");
    },
    async get(slug: string) {
      return request(`/services/${slug}`);
    },
    async create(data: any) {
      return request("/services", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(slug: string, data: any) {
      return request(`/services/${slug}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(slug: string) {
      return request(`/services/${slug}`, {
        method: "DELETE",
      });
    },
  },

  // Blogs
  blog: {
    async list(params?: { tag?: string; search?: string; status?: string }) {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = query ? `/blog?${query}` : "/blog";
      const result = await request(endpoint);
      return result.posts;
    },
    async get(slug: string) {
      return request(`/blog/${slug}`);
    },
    async create(data: any) {
      return request("/blog", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(slug: string, data: any) {
      return request(`/blog/${slug}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(slug: string) {
      return request(`/blog/${slug}`, {
        method: "DELETE",
      });
    },
  },

  // Testimonials
  testimonials: {
    async list() {
      return request("/testimonials");
    },
    async create(data: any) {
      return request("/testimonials", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: any) {
      return request(`/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request(`/testimonials/${id}`, {
        method: "DELETE",
      });
    },
  },

  orders: {
    async list(params?: { status?: string }) {
      const query = new URLSearchParams(params as any).toString();
      const endpoint = query ? `/orders?${query}` : "/orders";
      const result = await request(endpoint);
      return result.orders;
    },
    async get(id: string) {
      return request(`/orders/${id}`);
    },
    async create(data: any) {
      return request("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async updateStatus(id: string, status: string) {
      return request(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    async update(id: string, data: any) {
      return request(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    async delete(id: string) {
      return request(`/orders/${id}`, {
        method: "DELETE",
      });
    },
  },

  payments: {
    async initiate(data: {
      orderId?: string;
      customer: string;
      product: string;
      productSlug: string;
      amount: number;
      currency?: string;
      gateway?: string;
    }) {
      return request("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({
          customer: data.customer,
          productSlug: data.productSlug,
          quantity: 1,
        }),
      });
    },
    async verify(transactionId: string, status: "success" | "failed") {
      return request("/payments/verify-session", {
        method: "POST",
        body: JSON.stringify({ sessionId: transactionId }),
      });
    },
    async createCheckoutSession(data: {
      customer: string;
      productSlug: string;
      quantity?: number;
    }) {
      return request("/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async verifySession(sessionId: string) {
      return request("/payments/verify-session", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
    },
  },

  // Inquiries
  inquiries: {
    async list() {
      const result = await request("/inquiries");
      return result.inquiries;
    },
    async create(data: { name: string; email: string; phone?: string; type?: string; message: string }) {
      return request("/inquiries", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async markRead(id: string, read: boolean) {
      return request(`/inquiries/${id}/read`, {
        method: "PUT",
        body: JSON.stringify({ read }),
      });
    },
    async delete(id: string) {
      return request(`/inquiries/${id}`, {
        method: "DELETE",
      });
    },
  },

  // FAQs
  faqs: {
    async list() {
      return request("/faqs");
    },
  },

  // Settings
  settings: {
    async get() {
      return request("/settings");
    },
    async update(data: any) {
      return request("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  // Admin and System Analytics
  admin: {
    async getStats() {
      return request("/admin/dashboard");
    },
    async getLogs() {
      return request("/admin/logs");
    },
  },

  // Pre-Release System
  prerelease: {
    async enroll(data: { name: string; email: string; phone: string }) {
      return request("/prerelease/enroll", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async getEnrollments() {
      return request("/prerelease/enrollments");
    },
    async getConfig() {
      return request("/prerelease/config");
    },
    async updateConfig(data: any) {
      return request("/prerelease/config", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  // Upload utility
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return request("/uploads", {
      method: "POST",
      body: formData,
    });
  },
};
