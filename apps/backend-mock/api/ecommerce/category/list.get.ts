import { eventHandler, getQuery } from 'h3';
import { categoryList } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { page = 1, pageSize = 10, name } = getQuery(event);
  let filteredList = [...categoryList];

  if (name) {
    filteredList = filteredList.filter((item) =>
      item.name.toLowerCase().includes(String(name).toLowerCase()),
    );
  }

  return usePageResponseSuccess(
    page as string,
    pageSize as string,
    filteredList,
  );
});
