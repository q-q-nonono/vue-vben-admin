import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { orderList } from '~/utils/order-mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { id } = getQuery(event);
  const order = orderList.find((item) => item.id === id);

  if (!order) return useResponseSuccess(null);

  return useResponseSuccess(order);
});
