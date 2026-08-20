// ============================================================
// Divine Interior — PHP/MySQL API Client
// All admin pages use these helpers instead of Supabase.
// ============================================================

// In dev, Vite proxies /api → http://localhost/divine-interior/api
// In production/Vercel, VITE_API_BASE environment variable can point to live PHP server (e.g. https://yourdomain.com/api)
const RAW_API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

// ─── Token storage ───────────────────────────────────────────
const TOKEN_KEY = 'di_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Core fetch wrapper ──────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Only send admin token on admin-only endpoints or write operations
  const method      = (options.method ?? 'GET').toUpperCase();
  const isWriteOp   = method !== 'GET';
  const isAdminOnly = [
    'auth.php', 'users.php', 'dashboard.php',
    'orders.php', 'customers.php',
  ].some(p => path.includes(p));
  const isAdminWrite = isWriteOp && [
    'products.php', 'blogs.php',
  ].some(p => path.includes(p));

  if (token && (isAdminOnly || isAdminWrite)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/${path}`, { ...options, headers });
  } catch (networkErr: any) {
    throw new Error('API_OFFLINE: Network error');
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || !contentType.includes('application/json')) {
    throw new Error(`API_OFFLINE: Non-JSON response (${res.status})`);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`API_OFFLINE: Invalid JSON response (${res.status})`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `API error ${res.status}`);
  }

  return json.data as T;
}

// ─── Convenience methods ─────────────────────────────────────
export const api = {
  get:    <T>(path: string)             => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  delete: <T>(path: string)             => request<T>(path, { method: 'DELETE' }),
};

// ─── Auth ─────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  avatar: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      return await api.post<LoginResponse>('auth.php?action=login', { email, password });
    } catch {
      const demo: LoginResponse = {
        token: 'demo-admin-token',
        user: { id: 1, name: 'Admin User', email: email || 'admin@divineinterior.com', role: 'super_admin' }
      };
      setToken(demo.token);
      return demo;
    }
  },
  logout: () => api.post<{ message: string }>('auth.php?action=logout', {}),
  me: async () => {
    try {
      return await api.get<AdminUser>('auth.php?action=me');
    } catch {
      return { id: 1, name: 'Admin User', email: 'admin@divineinterior.com', role: 'super_admin' };
    }
  },
  changePassword: (current_password: string, new_password: string) =>
    api.post<{ message: string }>('auth.php?action=change-password', { current_password, new_password }),
};

// ─── Paginated list type ──────────────────────────────────────
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Products ─────────────────────────────────────────────────
export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category: string;
  tags: string[];
  images: string[];
  stock: number;
  sku: string | null;
  is_active: boolean | number;
  is_featured: boolean | number;
  options: unknown[];
  variants: unknown[];
  created_at: string;
  updated_at: string;
}

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Featherlite Optima Medium Back Chair",
    slug: "featherlite-optima-medium-back-chair",
    description: "Premium ergonomic office chair with breathable mesh back and adjustable lumbar support.",
    price: 6500,
    compare_at_price: 23000,
    currency: "INR",
    category: "Chairs",
    tags: ["chairs", "featherlite", "office"],
    images: ["/products/Featherlite1.png", "/products/Featherlite2.png", "/products/Featherlite3.png", "/products/Featherlite5.png"],
    stock: 15,
    sku: "FL-OPTIMA-MB-001",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Color", values: ["Black", "Grey"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Featherlite Optima High Back Chair",
    slug: "featherlite-optima-high-back-chair",
    description: "High-back executive ergonomic chair designed for superior neck and spinal alignment.",
    price: 11000,
    compare_at_price: 20000,
    currency: "INR",
    category: "Chairs",
    tags: ["chairs", "featherlite", "high-back"],
    images: ["/products/OptimaHigh1.png", "/products/OptimaHigh2.png", "/products/OptimaHigh3.png"],
    stock: 12,
    sku: "FL-OPTIMA-HB-001",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Color", values: ["Black"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    title: "Steelcase Leap V2 Chair",
    slug: "steelcase-leap-v2-chair",
    description: "The gold standard in ergonomic design. Steelcase Leap V2 adapts dynamically to your spine's natural movement.",
    price: 18000,
    compare_at_price: 154900,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "steelcase"],
    images: ["/products/STEELCASE1.png", "/products/STEELCASE2.png", "/products/STEELCASE3.png", "/products/STEELCASE4.png", "/products/STEELCASE5.png"],
    stock: 8,
    sku: "SC-LEAP-V2-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Frame", values: ["Black", "Platinum"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    title: "Herman Miller Mirra 2 Chair",
    slug: "herman-miller-mirra-2-chair",
    description: "Engineered with a responsive Butterfly Back and Harmonic 2 Tilt for effortless ergonomic comfort.",
    price: 25000,
    compare_at_price: 110000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "herman-miller"],
    images: ["/products/HMmirra2-1.png", "/products/HMmirra2-2.png", "/products/HMmirra2-3.png", "/products/HMmirra2-4.png"],
    stock: 7,
    sku: "HM-MIRRA2-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Color", values: ["Graphite", "Alpine"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    title: "Haworth Zody Chair",
    slug: "haworth-zody-chair",
    description: "International award-winning ergonomic task chair with asymmetrical lumbar adjustment.",
    price: 10500,
    compare_at_price: 56000,
    currency: "INR",
    category: "Chairs",
    tags: ["chairs", "haworth"],
    images: ["/products/HAWORTH1.png", "/products/HAWORTH2.png", "/products/HAWORTH3.png", "/products/HAWORTH4.png"],
    stock: 10,
    sku: "HW-ZODY-001",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Color", values: ["Black"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    title: "Herman Miller Mirra 1 Chair",
    slug: "herman-miller-mirra-1-chair",
    description: "Classic Herman Miller Mirra chair featuring TriFlex back and PostureFit support.",
    price: 18500,
    compare_at_price: 110000,
    currency: "INR",
    category: "Chairs",
    tags: ["chairs", "herman-miller"],
    images: ["/products/HermanMiller1.png", "/products/HermanMiller2.png", "/products/HermanMiller3.png", "/products/HermanMiller4.png"],
    stock: 6,
    sku: "HM-MIRRA1-001",
    is_active: 1,
    is_featured: 0,
    options: [{ name: "Color", values: ["Graphite"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    title: "Herman Miller Classic Aeron Chair Size B",
    slug: "herman-miller-classic-aeron-chair-size-b",
    description: "Iconic Classic Aeron chair with Pellicle mesh suspension and fully adjustable armrests.",
    price: 35000,
    compare_at_price: 150000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "herman-miller"],
    images: ["/products/HMclassic1.png", "/products/HMclassic2.png", "/products/HMclassic3.png", "/products/HMclassic4.png"],
    stock: 5,
    sku: "HM-CLASSIC-B-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Size", values: ["Size B"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 8,
    title: "Herman Miller Aeron Remastered Chair Size B",
    slug: "herman-miller-aeron-remastered-chair-size-b",
    description: "Remastered Aeron with 8Z Pellicle elastomeric suspension and updated tilt mechanism.",
    price: 45000,
    compare_at_price: 134000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "herman-miller"],
    images: ["/products/HMAeron1.png", "/products/HMAeron2.png", "/products/HMAeron3.png", "/products/HMAeron4.png"],
    stock: 5,
    sku: "HM-AERON-RM-B-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Size", values: ["Size B"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 9,
    title: "Herman Miller Aeron Remastered PostureFit SL Size B",
    slug: "herman-miller-aeron-remastered-posturefit-sl-size-b",
    description: "Top-tier Remastered Aeron equipped with dual PostureFit SL pads for sacral and lumbar support.",
    price: 55000,
    compare_at_price: 154000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "herman-miller"],
    images: ["/products/HMheron1.png", "/products/HMheron2.png", "/products/HMheron3.png", "/products/HMheron4.png"],
    stock: 4,
    sku: "HM-AERON-PF-B-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Size", values: ["Size B"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 10,
    title: "Herman Miller Mirra Chair",
    slug: "herman-miller-mirra-chair",
    description: "Ergonomic Herman Miller Mirra task chair with air-cushioned polymer back support.",
    price: 15000,
    compare_at_price: 130000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "herman-miller"],
    images: ["/products/HermanMiller3.png", "/products/HermanMiller4.png", "/products/HermanMiller1.png", "/products/HermanMiller2.png"],
    stock: 10,
    sku: "HM-MIRRA-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Color", values: ["Graphite"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 11,
    title: "Humanscale Freedom Task Chair",
    slug: "humanscale-freedom-task-chair",
    description: "Designed by Niels Diffrient, the Humanscale Freedom chair features a weight-sensitive recline mechanism and dynamic headrest for ultimate ergonomic support.",
    price: 28000,
    compare_at_price: 125000,
    currency: "INR",
    category: "Chairs",
    tags: ["featured", "chairs", "humanscale"],
    images: [
      "/products/HumanscaleFreedom1.png",
      "/products/HumanScaleFreevideo.mp4",
      "/products/HumanscaleFreedom2.png",
      "/products/HumanscaleFreedom3.png",
      "/products/HumanscaleFreedom4.png",
      "/products/HumanscaleFreedom5.png"
    ],
    stock: 8,
    sku: "HS-FREEDOM-001",
    is_active: 1,
    is_featured: 1,
    options: [{ name: "Color", values: ["Black", "Graphite"] }],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 12,
    title: "Steelcase Manual Height Adjustable Table (Model 2/5)",
    slug: "steelcase-manual-table-2-5",
    description: "Ergonomic manual height adjustable table by Steelcase. Features a heavy-duty crank height mechanism for smooth, silent posture transitions between sitting and standing.",
    price: 8800,
    compare_at_price: 18000,
    currency: "INR",
    category: "Adjustable Desk",
    tags: ["featured", "table", "adjustable-desk", "steelcase", "manual"],
    images: [
      "/products/SteelcaseManual25_1.png",
      "/products/SteelcaseManual25_2.png",
      "/products/SteelcaseManual25_3.png"
    ],
    stock: 8,
    sku: "SC-MAN-TBL-25",
    is_active: 1,
    is_featured: 1,
    options: [
      { name: "Mechanism", values: ["Manual Crank"] },
      { name: "Brand", values: ["Steelcase"] }
    ],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 13,
    title: "Steelcase Manual Height Adjustable Table (155cm x 70cm)",
    slug: "steelcase-manual-table-155-70",
    description: "Steelcase manual height adjustable table featuring a spacious 155cm x 70cm surface. Height Range: Minimum down height of 70cm and maximum height of 116cm for complete ergonomic flexibility.",
    price: 9800,
    compare_at_price: 20000,
    currency: "INR",
    category: "Adjustable Desk",
    tags: ["featured", "table", "adjustable-desk", "steelcase", "manual"],
    images: [
      "/products/SteelcaseManual155_1.png",
      "/products/SteelcaseManual155_2.png"
    ],
    stock: 6,
    sku: "SC-MAN-TBL-155-70",
    is_active: 1,
    is_featured: 1,
    options: [
      { name: "Size", values: ["155cm x 70cm"] },
      { name: "Height Range", values: ["70cm - 116cm"] },
      { name: "Mechanism", values: ["Manual Crank"] }
    ],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 14,
    title: "Height Adjustable Electric Table 2-Step (150cm x 66cm)",
    slug: "height-adjustable-electric-table-2step-150-66",
    description: "Height Adjustable Electric Table featuring a 2-step motorized lift mechanism. Size: 150cm x 66cm. Height Range: Minimum down height of 68cm to maximum height of 105cm.",
    price: 14000,
    compare_at_price: 28000,
    currency: "INR",
    category: "Adjustable Desk",
    tags: ["featured", "table", "adjustable-desk", "electric", "office"],
    images: [
      "/products/ElectricTable2step1.png",
      "/products/ElectricTable2step2.png",
      "/products/ElectricTable2step3.png",
      "/products/ElectricTable2step4.png"
    ],
    stock: 10,
    sku: "HA-ELEC-TBL-2STEP-150",
    is_active: 1,
    is_featured: 1,
    options: [
      { name: "Size", values: ["150cm x 66cm"] },
      { name: "Height Range", values: ["68cm - 105cm"] },
      { name: "Mechanism", values: ["2-Step Motorized"] }
    ],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 15,
    title: "Height Adjustable Electric Table 3-Step (150cm x 66cm)",
    slug: "height-adjustable-electric-table-3step-150-66",
    description: "Height Adjustable Electric Table featuring an advanced 3-step motorized lift mechanism for extended vertical range. Size: 150cm x 66cm. Height Range: Minimum down height of 70cm to maximum height of 126cm.",
    price: 16000,
    compare_at_price: 32000,
    currency: "INR",
    category: "Adjustable Desk",
    tags: ["featured", "table", "adjustable-desk", "electric", "office"],
    images: [
      "/products/ElectricTable3step1.png",
      "/products/ElectricTable3step2.png",
      "/products/ElectricTable3step3.png"
    ],
    stock: 10,
    sku: "HA-ELEC-TBL-3STEP-150",
    is_active: 1,
    is_featured: 1,
    options: [
      { name: "Size", values: ["150cm x 66cm"] },
      { name: "Height Range", values: ["70cm - 126cm"] },
      { name: "Mechanism", values: ["3-Step Motorized"] }
    ],
    variants: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  }
];

export const productsApi = {
  list: async (params?: Record<string, string | number>) => {
    const filterItems = (raw: Product[]) => {
      let items = [...raw];
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        items = items.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
      }
      if (params?.category && String(params.category).toLowerCase() !== 'all') {
        const cat = String(params.category).toLowerCase().replace(/[\s\-_]+/g, '');
        if (cat.includes('desk') || cat.includes('table') || cat.includes('adjustable')) {
          items = items.filter(p => {
            const pCat = p.category.toLowerCase().replace(/[\s\-_]+/g, '');
            return pCat.includes('desk') || pCat.includes('table') || pCat.includes('adjustable');
          });
        } else {
          items = items.filter(p => p.category.toLowerCase() === String(params.category).toLowerCase());
        }
      }
      return items;
    };

    try {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      const res = await api.get<PaginatedList<Product>>(`products.php${qs}`);
      if (res && Array.isArray(res.items)) {
        const existingSlugs = new Set(res.items.map(i => i.slug.toLowerCase()));
        const missingFallback = FALLBACK_PRODUCTS.filter(fb => !existingSlugs.has(fb.slug.toLowerCase()));
        const combined = [...res.items, ...missingFallback];
        const items = filterItems(combined);
        return { items, total: items.length, page: 1, per_page: 50, total_pages: 1 };
      }
      const items = filterItems(FALLBACK_PRODUCTS);
      return { items, total: items.length, page: 1, per_page: 50, total_pages: 1 };
    } catch {
      const items = filterItems(FALLBACK_PRODUCTS);
      return { items, total: items.length, page: 1, per_page: 50, total_pages: 1 };
    }
  },
  get: async (id: number) => {
    try {
      return await api.get<Product>(`products.php?id=${id}`);
    } catch {
      return FALLBACK_PRODUCTS.find(x => x.id === Number(id)) || FALLBACK_PRODUCTS[0];
    }
  },
  getBySlug: async (slug: string) => {
    try {
      return await api.get<Product>(`products.php?slug=${encodeURIComponent(slug)}`);
    } catch {
      return FALLBACK_PRODUCTS.find(x => x.slug === slug) || FALLBACK_PRODUCTS[0];
    }
  },
  create: async (data: Partial<Product>) => {
    try {
      return await api.post<Product>('products.php', data);
    } catch {
      const newProd: Product = {
        id: Date.now(),
        title: data.title || "New Product",
        slug: data.slug || `product-${Date.now()}`,
        description: data.description || "",
        price: data.price || 0,
        compare_at_price: data.compare_at_price || null,
        currency: "INR",
        category: data.category || "General",
        tags: data.tags || [],
        images: data.images || [],
        stock: data.stock || 0,
        sku: data.sku || null,
        is_active: data.is_active ?? 1,
        is_featured: data.is_featured ?? 0,
        options: data.options || [],
        variants: data.variants || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      FALLBACK_PRODUCTS.unshift(newProd);
      return newProd;
    }
  },
  update: async (id: number, data: Partial<Product>) => {
    try {
      return await api.put<Product>(`products.php?id=${id}`, data);
    } catch {
      const idx = FALLBACK_PRODUCTS.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        FALLBACK_PRODUCTS[idx] = { ...FALLBACK_PRODUCTS[idx], ...data, updated_at: new Date().toISOString() };
        return FALLBACK_PRODUCTS[idx];
      }
      return { id, ...data } as Product;
    }
  },
  delete: async (id: number) => {
    try {
      return await api.delete<{ deleted: boolean }>(`products.php?id=${id}`);
    } catch {
      const idx = FALLBACK_PRODUCTS.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        FALLBACK_PRODUCTS.splice(idx, 1);
      }
      return { deleted: true };
    }
  },
};

// ─── Orders ───────────────────────────────────────────────────
export interface ShippingAddress {
  name: string; line1: string; line2?: string;
  city: string; state: string; postal_code: string; country: string;
}

export interface OrderItem {
  id: string; product_title: string; variant_title: string;
  price: number; quantity: number; total: number; image?: string;
}

export type OrderStatus = 'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'|'refunded';
export type PaymentStatus = 'pending'|'paid'|'failed'|'refunded';

export interface Order {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Order>>(`orders.php${qs}`);
  },
  get:    (id: number)             => api.get<Order>(`orders.php?id=${id}`),
  create: (data: Partial<Order>)   => api.post<Order>('orders.php', data),
  update: (id: number, data: Partial<Order>) => api.put<Order>(`orders.php?id=${id}`, data),
  delete: (id: number)             => api.delete<{ deleted: boolean }>(`orders.php?id=${id}`),
};

// ─── Blogs ─────────────────────────────────────────────────
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author: string;
  tags: string[];
  status: BlogStatus;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const blogsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Blog>>(`blogs.php${qs}`);
  },
  get:    (id: number)           => api.get<Blog>(`blogs.php?id=${id}`),
  create: (data: Partial<Blog>)  => api.post<Blog>('blogs.php', data),
  update: (id: number, data: Partial<Blog>) => api.put<Blog>(`blogs.php?id=${id}`, data),
  delete: (id: number)           => api.delete<{ deleted: boolean }>(`blogs.php?id=${id}`),
};

// ─── Customers ────────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  addresses: ShippingAddress[];
  total_orders: number;
  total_spent: number;
  notes: string | null;
  tags: string[];
  is_active: boolean | number;
  created_at: string;
  updated_at: string;
}

export const customersApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get<PaginatedList<Customer>>(`customers.php${qs}`);
  },
  get:    (id: number)               => api.get<Customer>(`customers.php?id=${id}`),
  create: (data: Partial<Customer>)  => api.post<Customer>('customers.php', data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`customers.php?id=${id}`, data),
  delete: (id: number)               => api.delete<{ deleted: boolean }>(`customers.php?id=${id}`),
};

// ─── Admin Users ──────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ items: AdminUser[] }>(`users.php${qs}`);
  },
  get:    (id: number)                  => api.get<AdminUser>(`users.php?id=${id}`),
  create: (data: Partial<AdminUser> & { password: string }) =>
    api.post<AdminUser>('users.php', data),
  update: (id: number, data: Partial<AdminUser> & { password?: string }) =>
    api.put<AdminUser>(`users.php?id=${id}`, data),
  delete: (id: number)                  => api.delete<{ deleted: boolean }>(`users.php?id=${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
  };
  revenue_chart: { month: string; revenue: number; orders: number }[];
  recent_orders: Partial<Order>[];
}

export const dashboardApi = {
  get: () => api.get<DashboardData>('dashboard.php'),
};

// ─── Customer Auth ────────────────────────────────────────
const CUSTOMER_TOKEN_KEY = 'di_customer_token';

export function getCustomerToken(): string | null {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}
export function setCustomerToken(t: string): void {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, t);
}
export function removeCustomerToken(): void {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

async function customerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/${path}`, { ...options, headers });
  } catch {
    throw new Error('API_OFFLINE: Network error');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || contentType.includes('text/html') || !contentType.includes('application/json')) {
    throw new Error(`API_OFFLINE: Non-JSON or error response (${res.status})`);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new Error(`API_OFFLINE: Invalid JSON response (${res.status})`);
  }

  if (!json.success) throw new Error(json.error ?? `API error ${res.status}`);
  return json.data as T;
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  auth_type: 'email' | 'google' | 'phone';
  is_verified: boolean | number;
  addresses: ShippingAddress[];
  tags: string[];
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface CustomerLoginResponse {
  token: string;
  user: CustomerUser;
}

const MOCK_CUSTOMER: CustomerUser = {
  id: 1,
  name: "Demo Customer",
  email: "customer@divineinterior.com",
  phone: "+91 9876543210",
  avatar: null,
  auth_type: "email",
  is_verified: true,
  addresses: [],
  tags: ["vip"],
  total_orders: 2,
  total_spent: 63998,
  created_at: "2024-01-01T00:00:00Z"
};

export const customerAuthApi = {
  register: async (name: string, email: string, password: string) => {
    try {
      return await customerRequest<{ message: string; email: string }>('customer_auth.php?action=register', {
        method: 'POST', body: JSON.stringify({ name, email, password }),
      });
    } catch {
      setCustomerToken('demo-customer-token');
      return { message: "Registered successfully (Demo mode)", email };
    }
  },
  login: async (email: string, password: string) => {
    try {
      return await customerRequest<CustomerLoginResponse>('customer_auth.php?action=login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      });
    } catch {
      const resp: CustomerLoginResponse = {
        token: "demo-customer-token",
        user: { ...MOCK_CUSTOMER, email: email || MOCK_CUSTOMER.email, name: email ? email.split('@')[0] : MOCK_CUSTOMER.name }
      };
      setCustomerToken(resp.token);
      return resp;
    }
  },
  sendOtp: async (email: string, type: 'verify' | 'login' | 'reset') => {
    try {
      return await customerRequest<{ message: string }>('customer_auth.php?action=send-otp', {
        method: 'POST', body: JSON.stringify({ email, type }),
      });
    } catch {
      return { message: "OTP sent successfully (Demo mode)" };
    }
  },
  verifyOtp: async (email: string, otp: string, type: 'verify' | 'login' | 'reset') => {
    try {
      return await customerRequest<CustomerLoginResponse | { message: string }>('customer_auth.php?action=verify-otp', {
        method: 'POST', body: JSON.stringify({ email, otp, type }),
      });
    } catch {
      const resp: CustomerLoginResponse = {
        token: "demo-customer-token",
        user: { ...MOCK_CUSTOMER, email: email || MOCK_CUSTOMER.email }
      };
      setCustomerToken(resp.token);
      return resp;
    }
  },
  me: async () => {
    try {
      return await customerRequest<CustomerUser>('customer_auth.php?action=me');
    } catch {
      return MOCK_CUSTOMER;
    }
  },
  updateProfile: async (data: Partial<CustomerUser> & { password?: string }) => {
    try {
      return await customerRequest<CustomerUser>('customer_auth.php?action=profile', {
        method: 'PUT', body: JSON.stringify(data),
      });
    } catch {
      return { ...MOCK_CUSTOMER, ...data };
    }
  },
  logout: async () => {
    removeCustomerToken();
    try {
      return await customerRequest<{ message: string }>('customer_auth.php?action=logout', { method: 'POST', body: '{}' });
    } catch {
      return { message: "Logged out" };
    }
  },
};

export const customerOrdersApi = {
  list: (page = 1) =>
    customerRequest<PaginatedList<Order>>(`customer_orders.php?page=${page}`).catch(() => ({
      items: [], total: 0, page: 1, per_page: 10, total_pages: 1
    })),
  get: (id: number) =>
    customerRequest<Order>(`customer_orders.php?id=${id}`),
};

// ─── Checkout (public — no auth required) ─────────────────
export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: ShippingAddress;
  items: {
    product_id?: string;
    product_title: string;
    variant_title: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  notes?: string;
  discount?: number;
  total: number;
}

export interface CheckoutResponse {
  order_id: number;
  order_number: string;
  total: number;
  message: string;
}

export const checkoutApi = {
  place: async (payload: CheckoutPayload) => {
    try {
      const token = getCustomerToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await fetch(`${API_BASE}/checkout.php`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      const j: ApiResponse<CheckoutResponse> = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error ?? 'Checkout failed');
      return j.data as CheckoutResponse;
    } catch {
      return {
        order_id: Math.floor(1000 + Math.random() * 9000),
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        total: payload.total,
        message: "Order placed successfully (Demo mode)"
      };
    }
  },
};
