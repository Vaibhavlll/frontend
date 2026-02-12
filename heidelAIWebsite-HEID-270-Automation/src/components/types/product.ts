export interface Product {
  _id: string;
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  stock: number;
  created_at?: string;
  metadata?: Record<string, unknown>;
  category: string;
  image_url: string;
  onsale: boolean;
  permalink: string;
  purchasable: boolean;
  regularprice: string;
  saleprice: string;
  slug: string;
}
