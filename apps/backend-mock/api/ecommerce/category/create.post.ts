import { faker } from '@faker-js/faker';
import { eventHandler, readBody } from 'h3';
import { categoryList } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const body = await readBody(event);

  const newCategory = {
    id: faker.string.uuid(),
    name: body.name,
    sort: body.sort || 0,
    description: body.description || '',
    productCount: 0,
    createTime: new Date().toISOString().split('T')[0],
  };

  categoryList.push(newCategory);

  return useResponseSuccess(newCategory);
});
