import { faker } from '@faker-js/faker';

// 预定义分类数据
export interface CategoryItem {
  id: string;
  name: string;
  sort: number;
  description: string;
  productCount: number;
  createTime: string;
}

// 预定义分类（固定 ID，方便商品引用）
export const PREDEFINED_CATEGORIES = [
  {
    id: 'cat-electronics',
    name: '电子产品',
    sort: 1,
    description: '手机、电脑、数码配件等电子产品',
  },
  {
    id: 'cat-clothing',
    name: '服装',
    sort: 2,
    description: '男装、女装、童装等',
  },
  { id: 'cat-food', name: '食品', sort: 3, description: '零食、饮料、生鲜等' },
  {
    id: 'cat-home',
    name: '家居',
    sort: 4,
    description: '家具、家纺、日用百货等',
  },
  { id: 'cat-books', name: '图书', sort: 5, description: '书籍、电子书等' },
];

const fakerProductCount = () => faker.number.int({ min: 5, max: 50 });

export const categoryList = PREDEFINED_CATEGORIES.map((cat) => ({
  ...cat,
  productCount: fakerProductCount(),
  createTime: faker.date.past({ years: 1 }).toISOString().split('T')[0],
}));

// 从分类ID获取分类名称的辅助函数
// 知识点：从 categoryList 查找（支持动态更新的名称），而非 PREDEFINED_CATEGORIES
export function getCategoryNameById(id: string): string {
  const cat = categoryList.find((c) => c.id === id);
  return cat ? cat.name : '未知分类';
}

// 获取所有分类ID列表
export function getCategoryIds(): string[] {
  return PREDEFINED_CATEGORIES.map((c) => c.id);
}
