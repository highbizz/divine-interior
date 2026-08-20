// ============================================================
// MySQL / PHP Database Types
// Matches MySQL schema defined in api/schema.sql
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      blogs: {
        Row: Blog;
        Insert: BlogInsert;
        Update: BlogUpdate;
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at'>;
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
      };
    };
  };
}

// ─── Product ────────────────────────────────────────────────
export interface Product {
  id: string;
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
  is_active: boolean;
  is_featured: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  available: boolean;
  options: { name: string; value: string }[];
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

// ─── Order ──────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
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

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  variant_title: string;
  price: number;
  quantity: number;
  total: number;
  image: string | null;
}

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'>;
export type OrderUpdate = Partial<OrderInsert>;

// ─── Blog ───────────────────────────────────────────────────
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface Blog {
  id: string;
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

export type BlogInsert = Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'views'>;
export type BlogUpdate = Partial<BlogInsert>;

// ─── Customer ───────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  addresses: ShippingAddress[];
  total_orders: number;
  total_spent: number;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_orders' | 'total_spent'>;
export type CustomerUpdate = Partial<CustomerInsert>;

// ─── Admin User ─────────────────────────────────────────────
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  user_id: string; // Supabase auth UID
  name: string;
  email: string;
  role: AdminRole;
  avatar: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  products_change: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  image: string | null;
  total_sold: number;
  revenue: number;
}
