import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { productList } from '~/utils/product-mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = getQuery(event);
  const index = productList.findIndex((item) => item.id === id);

  if (index === -1) {
    return useResponseSuccess(null);
  }

  // 从数组中移除该商品
  productList.splice(index, 1);

  return useResponseSuccess({ success: true });
});
