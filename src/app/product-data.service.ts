import { Injectable, signal } from '@angular/core';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductDataService {
  
  readonly products = signal<Product[]>([
    {
      id: 1,
      owner: 'Sarah Chen',
      name: 'Revenue Analytics Core',
      description:
        'Consolidated revenue streams across all business units with YoY growth metrics, margin analysis, and forecast accuracy tracking.',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2025-02-10'),
      product_createdAt: new Date('2023-11-01'),
      product_updatedAt: new Date('2025-02-08'),
      is_certified_on_bi_platform: true,
      is_published: true,
    },
    {
      id: 2,
      owner: 'Marcus Webb',
      name: 'Customer Lifetime Value',
      description:
        'CLV computation engine combining transactional history, engagement scores, and churn probability for segmentation.',
      createdAt: new Date('2024-06-22'),
      updatedAt: new Date('2025-01-28'),
      product_createdAt: new Date('2024-01-15'),
      product_updatedAt: new Date('2025-01-25'),
      is_certified_on_bi_platform: true,
      is_published: true,
    },
    {
      id: 3,
      owner: 'Anika Patel',
      name: 'Supply Chain Velocity',
      description:
        'End-to-end supply chain metrics from procurement through delivery, including lead times, bottleneck identification, and vendor scorecards.',
      createdAt: new Date('2024-09-10'),
      updatedAt: new Date('2025-02-12'),
      product_createdAt: new Date('2024-05-20'),
      product_updatedAt: new Date('2025-02-12'),
      is_certified_on_bi_platform: false,
      is_published: true,
    },
    {
      id: 4,
      owner: 'James Thornton',
      name: 'Workforce Planning Model',
      description:
        'Headcount forecasting with attrition modeling, skills gap analysis, and capacity planning across departments.',
      createdAt: new Date('2024-11-05'),
      updatedAt: new Date('2025-02-14'),
      product_createdAt: new Date('2024-08-12'),
      product_updatedAt: new Date('2025-02-14'),
      is_certified_on_bi_platform: false,
      is_published: false,
    },
    {
      id: 5,
      owner: 'Sarah Chen',
      name: 'Marketing Attribution',
      description:
        'Multi-touch attribution model mapping campaign spend to conversion events across digital and offline channels.',
      createdAt: new Date('2024-07-18'),
      updatedAt: new Date('2025-02-01'),
      product_createdAt: new Date('2024-02-28'),
      product_updatedAt: new Date('2025-01-30'),
      is_certified_on_bi_platform: true,
      is_published: true,
    },
    {
      id: 6,
      owner: 'Elena Vasquez',
      name: 'Risk Exposure Dashboard',
      description:
        'Real-time risk scoring aggregating market, credit, and operational risk factors with regulatory threshold alerts.',
      createdAt: new Date('2025-01-08'),
      updatedAt: new Date('2025-02-15'),
      product_createdAt: new Date('2024-10-01'),
      product_updatedAt: new Date('2025-02-15'),
      is_certified_on_bi_platform: false,
      is_published: false,
    },
    {
      id: 7,
      owner: 'David Kim',
      name: 'Product Usage Telemetry',
      description:
        'Feature adoption and usage patterns across product lines with cohort analysis and engagement scoring.',
      createdAt: new Date('2024-08-30'),
      updatedAt: new Date('2025-02-09'),
      product_createdAt: new Date('2024-04-10'),
      product_updatedAt: new Date('2025-02-09'),
      is_certified_on_bi_platform: true,
      is_published: true,
    },
    {
      id: 8,
      owner: 'Marcus Webb',
      name: 'Financial Close Accelerator',
      description:
        'Automated reconciliation datasets for month-end close with variance detection and audit trail lineage.',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2025-02-13'),
      product_createdAt: new Date('2024-09-15'),
      product_updatedAt: new Date('2025-02-13'),
      is_certified_on_bi_platform: true,
      is_published: true,
    },
  ]);
}
