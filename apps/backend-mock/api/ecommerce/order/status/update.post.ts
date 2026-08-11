import { eventHandler, getQuery, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { orderList } from '~/utils/order-mock-data';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

// 知识点：订单状态流转规则
// 待付款 → 待发货 → 已发货 → 已完成
//                   ↘ 已取消
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  待付款: ['待发货', '已取消'],
  待发货: ['已发货', '已取消'],
  已发货: ['已完成'],
  已完成: [],
  已取消: [],
};

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) return unAuthorizedResponse(event);

  const { id } = getQuery(event);
  const body = await readBody(event);
  const { status: newStatus } = body;

  const index = orderList.findIndex((item) => item.id === id);
  if (index === -1) return useResponseSuccess(null);

  const currentStatus = orderList[index].status;

  // 校验状态流转是否合法
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return useResponseSuccess({
      success: false,
      message: `订单状态不允许从「${currentStatus}」变更为「${newStatus}」`,
    });
  }

  orderList[index] = {
    ...orderList[index],
    status: newStatus,
    updateTime: new Date().toISOString().split('T')[0],
  };

  return useResponseSuccess({
    success: true,
    order: orderList[index],
  });
});
