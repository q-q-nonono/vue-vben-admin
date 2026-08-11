import { faker } from '@faker-js/faker';
import { eventHandler, readBody } from 'h3';
import { getCategoryNameById } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { productList } from '~/utils/product-mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody(event);

  // 知识点：新增商品时存 categoryId，通过分类名称找到对应的 ID
  const categoryId = body.categoryId || body.category; // 兼容两种传参方式

  const newProduct = {
    id: faker.string.uuid(),
    name: body.name,
    categoryId,
    category: getCategoryNameById(categoryId),
    price: body.price,
    stock: body.stock,
    status: body.status || '上架',
    image: faker.image.url(),
    description: body.description || '',
    createTime: new Date().toISOString().split('T')[0],
  };

  productList.unshift(newProduct);

  return useResponseSuccess(newProduct);
});
