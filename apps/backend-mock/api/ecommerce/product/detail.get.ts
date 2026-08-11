import { eventHandler, getQuery } from 'h3';
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
  const product = productList.find((item) => item.id === id);

  if (!product) {
    return useResponseSuccess(null);
  }

  // 返回时根据 categoryId 动态获取最新分类名称
  return useResponseSuccess({
    ...product,
    category: getCategoryNameById(product.categoryId),
  });
});
