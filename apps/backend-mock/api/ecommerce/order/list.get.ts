import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { orderList } from '~/utils/order-mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const {
    page = 1,
    pageSize = 10,
    orderNo,
    status,
    userName,
  } = getQuery(event);
  let filteredList = structuredClone(orderList);

  if (orderNo) {
    filteredList = filteredList.filter((item) =>
      item.orderNo.toLowerCase().includes(String(orderNo).toLowerCase()),
    );
  }

  if (status) {
    filteredList = filteredList.filter((item) => item.status === status);
  }

  if (userName) {
    filteredList = filteredList.filter((item) =>
      item.userName.includes(String(userName)),
    );
  }

  return usePageResponseSuccess(
    page as string,
    pageSize as string,
    filteredList,
  );
});
