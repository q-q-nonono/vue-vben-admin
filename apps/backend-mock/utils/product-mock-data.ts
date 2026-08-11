import { faker } from '@faker-js/faker';

import { getCategoryIds, getCategoryNameById } from './category-mock-data';

/**
 * 商品 Mock 数据
 * 知识点：这个文件是共享模块，list（查询）和 create（新增）都引用同一份数据
 * 这样新增的商品就能在列表中查到了
 */

const statuses = ['上架', '下架', '缺货'];

/**
 * 知识点：商品存 categoryId 而不是 category 名称
 * 这样修改分类名称后所有商品自动同步
 * 展示时通过 getCategoryNameById() 获取名称
 */
function generateMockProductList(count: number) {
  const categoryIds = getCategoryIds();
  const dataList = [];
  for (let i = 0; i < count; i++) {
    const categoryId = faker.helpers.arrayElement(categoryIds);
    dataList.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      categoryId,
      category: getCategoryNameById(categoryId), // 预填名称，但后续展示会动态查
      price: Number.parseFloat(faker.commerce.price({ min: 10, max: 9999 })),
      stock: faker.number.int({ min: 0, max: 1000 }),
      status: faker.helpers.arrayElement(statuses),
      image: faker.image.url(),
      description: faker.lorem.sentence(),
      createTime: faker.date
        .between({ from: '2023-01-01', to: '2025-12-31' })
        .toISOString()
        .split('T')[0],
    });
  }
  return dataList;
}

// 导出可变的商品列表，新增/删除时会修改这个数组
export const productList = generateMockProductList(100);
