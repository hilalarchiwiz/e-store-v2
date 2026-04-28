export type Product = {
  id: number;
  title: string;
  description: string;
  warranty: string;
  brandId: number;
  brandName?: string;
  categoryId: number;
  categoryName?: string;
  color: string[];
  price: number;
  discountedPrice?: number;
  reviews?: [];
  images: string[];
  specifications: { [key: string]: string };
  additionalInfo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
