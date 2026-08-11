import { eventHandler, getQuery } from 'h3';
import { categoryList } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { id } = getQuery(event);
  const category = categoryList.find((item) => item.id === id);

  if (!category) return useResponseSuccess(null);

  return useResponseSuccess(category);
});
