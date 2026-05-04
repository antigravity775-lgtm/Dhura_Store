// In production (Vercel), set VITE_API_URL to your backend origin, e.g. https://your-backend.vercel.app
// (the /api path is added automatically if missing). In dev, the Vite proxy forwards /api to localhost:5000.
import { getApiBaseUrl } from '../utils/apiBaseUrl';

const BASE_URL = getApiBaseUrl();

// ─── Token Management ───
// Auth tokens are managed securely via HttpOnly cookies by the backend.
// No client-side token handling needed.

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
});

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  const normalizedId = product.id ?? product.productId ?? product._id ?? null;
  return normalizedId ? { ...product, id: normalizedId } : product;
}

function normalizeProductsListResponse(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeProduct);
  }
  if (data && Array.isArray(data.items)) {
    return data.items.map(normalizeProduct);
  }
  if (data && Array.isArray(data.products)) {
    return data.products.map(normalizeProduct);
  }
  return [];
}

async function request(url, options = {}) {
  options.credentials = 'include'; // Ensure cookies are sent with every request

  const primaryUrl = `${BASE_URL}${url}`;
  let res;

  try {
    res = await fetch(primaryUrl, options);
  } catch (err) {
    // Dev fallback: if VITE_API_URL is misconfigured, retry through Vite local proxy.
    if (import.meta.env.DEV && BASE_URL !== '/api') {
      res = await fetch(`/api${url}`, options);
    } else {
      throw err;
    }
  }

  if (!res.ok) {
    let message = `خطأ ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const body = JSON.parse(text);
          // Handle FluentValidation errors
          if (body.errors) {
            const firstErr = Object.values(body.errors).flat()[0];
            message = firstErr || body.title || message;
          } else {
            message = body.error || body.message || body.title || body.detail || text;
          }
        } catch {
          message = text;
        }
      }
    } catch { /* empty */ }
    const errObj = new Error(message);
    errObj.status = res.status;
    throw errObj;
  }

  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

// ─── Account ───
export async function login(email, password) {
  return request('/account/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return request('/account/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function register({ fullName, phoneNumber, email = '', password, city, role = 3 }) {
  return request('/account/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, phoneNumber, email, password, city, role }),
  });
}

export async function getProfile() {
  return request('/account/profile', { headers: jsonHeaders() });
}

export async function updateProfile(data) {
  return request('/account/profile', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return request('/account/change-password', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── Products ───
export async function getProducts({ city, maxPriceUsd, condition, specialOffers, pageNumber = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (maxPriceUsd) params.set('maxPriceUsd', maxPriceUsd);
  if (condition !== undefined && condition !== null) params.set('condition', condition);
  if (specialOffers) params.set('specialOffers', 'true');
  params.set('pageNumber', pageNumber);
  params.set('pageSize', pageSize);
  const data = await request(`/products?${params.toString()}`, { headers: jsonHeaders() });
  return normalizeProductsListResponse(data);
}

export async function getProductById(id) {
  const data = await request(`/products/${id}`, { headers: jsonHeaders() });
  return normalizeProduct(data);
}

export async function createProduct(data) {
  return request('/products', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return request(`/products/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteProduct(id) {
  return request(`/products/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export async function toggleProductVisibility(id) {
  return request(`/products/${id}/toggle-visibility`, {
    method: 'PATCH',
    headers: jsonHeaders(),
  });
}

export async function getMyProducts() {
  return request('/products/my-products', { headers: jsonHeaders() });
}

// ─── Image Upload (Local API) ───
export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/products/upload-image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('فشل رفع الصورة');
  }

  const data = await res.json();
  return data.secure_url;
}

// ─── Categories ───
export async function getCategories() {
  return request('/categories', { headers: jsonHeaders() });
}

export async function getProductsByCategory(categoryId) {
  return request(`/categories/${categoryId}/products`, { headers: jsonHeaders() });
}

export async function uploadCategoryIcon(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/categories/upload-icon`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('فشل رفع أيقونة التصنيف');
  }

  const data = await res.json();
  return data.url;
}

// ─── Orders ───
export async function createOrder(data) {
  return request('/orders', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function getMyOrders() {
  return request('/orders/my-orders', { headers: jsonHeaders() });
}

export async function trackMyOrder(code) {
  return request(`/orders/track/${encodeURIComponent(code)}`, { headers: jsonHeaders() });
}

export async function getSales() {
  return request('/orders/sales', { headers: jsonHeaders() });
}

export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ orderId, status }),
  });
}

// ─── Admin ───
export async function getAdminDashboard() {
  return request('/admin/dashboard', { headers: jsonHeaders() });
}

export async function getAdminUsers() {
  return request('/admin/users', { headers: jsonHeaders() });
}

export async function blockUser(id) {
  return request(`/admin/users/${id}/block`, {
    method: 'PATCH',
    headers: jsonHeaders(),
  });
}

export async function changeUserRole(id, newRole) {
  return request(`/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ newRole }),
  });
}

export async function deleteUser(id) {
  return request(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export async function getAdminProducts() {
  return request('/admin/products', { headers: jsonHeaders() });
}

export async function deleteAdminProduct(id) {
  return request(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export async function getAdminOrders(status) {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.set('status', status);
  const qs = params.toString();
  return request(`/admin/orders${qs ? `?${qs}` : ''}`, { headers: jsonHeaders() });
}

export async function updateAdminOrderStatus(orderId, status) {
  return request(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function createCategory(data) {
  return request('/categories', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return request(`/categories/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(),
  });
}

export async function getExchangeRates() {
  return request('/SystemSettings/exchange-rates', { headers: jsonHeaders() });
}

export async function updateExchangeRates(data) {
  return request('/SystemSettings/exchange-rates', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}

export async function getStoreInfo() {
  return request('/SystemSettings/store-info', { headers: jsonHeaders() });
}

export async function updateStoreInfo(data) {
  return request('/SystemSettings/store-info', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
}


// ─── Enum Helpers ───
export const CurrencyMap = {
  1: 'ريال (صنعاء)',
  2: 'ريال (عدن)',
  3: 'دولار',
  4: 'ريال سعودي',
  5: 'يورو',
};
export const CurrencySymbol = {
  1: 'ريال (صنعاء)',
  2: 'ريال (عدن)',
  3: '$',
  4: 'ر.س',
  5: '€',
  YER_Sanaa: 'ريال (صنعاء)',
  YER_Aden: 'ريال (عدن)',
  USD: '$',
  SAR: 'ر.س',
  EUR: '€',
};

export function getCurrencySymbol(currency) {
  if (currency === null || currency === undefined || currency === '') return '';
  return CurrencySymbol[currency] || CurrencySymbol[String(currency)] || '';
}

export const ConditionMap = { 1: 'جديد', 2: 'مستعمل', 3: 'مجدد' };
export const ConditionEn = { 1: 'New', 2: 'Used', 3: 'Refurbished' };
export const RoleMap = { 1: 'Admin', 2: 'Seller', 3: 'Buyer' };

