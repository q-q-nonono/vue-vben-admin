import { eventHandler, getQuery } from 'h3';
import { getCategoryNameById } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { productList } from '~/utils/product-mock-data';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { page = 1, pageSize = 10, name, category, status } = getQuery(event);

  let filteredList = structuredClone(productList);

  // 按名称搜索
  if (name) {
    filteredList = filteredList.filter((item) =>
      item.name.toLowerCase().includes(String(name).toLowerCase()),
    );
  }

  // 按分类筛选：根据分类名称找出对应的分类ID
  if (category) {
    filteredList = filteredList.filter(
      (item) => getCategoryNameById(item.categoryId) === category,
    );
  }

  // 按状态筛选
  if (status) {
    filteredList = filteredList.filter((item) => item.status === status);
  }

  // 返回前解析分类名称（确保分类名是最新的）
  const resultList = filteredList.map((item) => ({
    ...item,
    category: getCategoryNameById(item.categoryId),
  }));

  return usePageResponseSuccess(page as string, pageSize as string, resultList);
});
