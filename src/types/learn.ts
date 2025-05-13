// 定义教程类型
export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  date: string;
  level: string;
  tags: string[];
  order: number;
} 