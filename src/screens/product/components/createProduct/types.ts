export interface ProductPayload {
  store_id: number;
  category?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: boolean;
  discount_percentage?: number;
  discount_start?: string;
  discount_end?: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, string>;
  warranty?: string;
  condition?: 'Nuevo' | 'Usado';
  weight_kg?: number;
  dimensions_cm?: Record<string, number>;
  shipping_included?: boolean;
  sku?: string;
  barcode?: string;
  slug?: string;
  keywords?: string[];
  tags?: string[];
  media?: any[];
  is_featured?: boolean;
  is_recommended?: boolean;
  visibility?: 'publico' | 'privado' | 'tienda';
  options?: { name: string; values: string[] }[];
  variants?: {
    sku: string;
    price: number;
    stock: number;
    options: Record<string, string>;
  }[];
}
