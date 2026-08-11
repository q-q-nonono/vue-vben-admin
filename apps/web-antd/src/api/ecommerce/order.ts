import { requestClient } from '#/api/request';

/** 订单商品项 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/** 订单信息 */
export interface OrderInfo {
  id: string;
  orderNo: string;
  userId: string;
  userName: string;
  totalAmount: number;
  status: '已发货' | '已取消' | '已完成' | '待付款' | '待发货';
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  remark: string;
  createTime: string;
  updateTime: string;
}

/** 订单列表查询参数 */
export interface OrderListParams {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  status?: string;
  userName?: string;
}

/** 订单列表响应 */
export interface OrderListResult {
  items: OrderInfo[];
  total: number;
}

/**
 * 获取订单列表
 */
export async function getOrderListApi(params: OrderListParams) {
  return requestClient.get<OrderListResult>('/ecommerce/order/list', {
    params,
  });
}

/**
 * 获取订单详情
 */
export async function getOrderDetailApi(id: string) {
  return requestClient.get<OrderInfo>('/ecommerce/order/detail', {
    params: { id },
  });
}

/**
 * 更新订单状态（带流转规则校验）
 */
export async function updateOrderStatusApi(id: string, status: string) {
  return requestClient.post(`/ecommerce/order/status/update?id=${id}`, {
    status,
  });
}
