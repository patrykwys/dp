export interface Product {
  id: number;
  owner: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  product_createdAt: Date;
  product_updatedAt: Date;
  is_certified_on_bi_platform: boolean;
  is_published: boolean;
}

export type FilterStatus = 'all' | 'certified' | 'published' | 'draft';
export type SortBy = 'name' | 'updated' | 'owner';
export type ViewMode = 'grid' | 'expansion' | 'table';

export interface HealthStatus {
  label: 'Healthy' | 'Stable' | 'Stale';
  color: string;
  bgColor: string;
}

export interface LifecycleEntry {
  label: string;
  date: Date;
  subtitle: string;
}
