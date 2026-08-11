import { eventHandler, getQuery } from 'h3';
import { categoryList } from '~/utils/category-mock-data';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { id } = getQuery(event);
  const index = categoryList.findIndex((item) => item.id === id);
  if (index === -1) return useResponseSuccess(null);

  // 知识点：分类下有商品时不能删除，这里模拟检查
  // 实际应该从商品数据中统计，mock 中简化处理
  if (categoryList[index].productCount > 0) {
    return useResponseSuccess({
      success: false,
      message: '该分类下还有商品，无法删除',
    });
  }

  categoryList.splice(index, 1);

  return useResponseSuccess({ success: true });
});
