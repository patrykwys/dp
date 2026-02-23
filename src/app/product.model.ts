export interface Product {
  id: number;
  name: string;
  description: string;
  owner: string;
  connected_count: number;
  content_url: string;
  product_createdAt: Date;
  product_updatedAt: Date;
  has_extracts: boolean;
  is_certified_on_source: boolean;
  is_certified_on_bi_platform: boolean;
  is_published: boolean;
  size: number;
  webPageUrl: string;
  sourceDisplayName: string;
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
