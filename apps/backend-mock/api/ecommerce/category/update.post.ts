import { eventHandler, getQuery, readBody } from 'h3';
import { categoryList } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { id } = getQuery(event);
  const body = await readBody(event);

  const index = categoryList.findIndex((item) => item.id === id);
  if (index === -1) return useResponseSuccess(null);

  categoryList[index] = {
    ...categoryList[index],
    ...body,
  };

  return useResponseSuccess(categoryList[index]);
});
