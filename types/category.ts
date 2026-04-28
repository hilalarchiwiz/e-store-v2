export type SubCategory = {
  id: number;
  title: string;
  description?: string;
  img?: string;
  status: string;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
};

export type Category = {
  id: number;
  title: string;
  description: string;
  img: string;
  specifications: object;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  subCategories?: SubCategory[];
  _count?: { products: number };
};
