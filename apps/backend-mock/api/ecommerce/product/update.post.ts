import { eventHandler, getQuery, readBody } from 'h3';
import { getCategoryNameById } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { productList } from '~/utils/product-mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = getQuery(event);
  const body = await readBody(event);

  const index = productList.findIndex((item) => item.id === id);
  if (index === -1) {
    return useResponseSuccess(null);
  }

  // 知识点：如果更新时传了 categoryId，同步更新 category 名称
  const updatedBody = { ...body };
  if (updatedBody.categoryId) {
    updatedBody.category = getCategoryNameById(updatedBody.categoryId);
  }

  productList[index] = {
    ...productList[index],
    ...updatedBody,
  };

  return useResponseSuccess(productList[index]);
});
