import { faker } from '@faker-js/faker';
/** 订单状态 */
export const ORDER_STATUSES = [
  '待付款',
  '待发货',
  '已发货',
  '已完成',
  '已取消',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

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

/** 订单 */
export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  userName: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  remark: string;
  createTime: string;
  updateTime: string;
}

function generateMockOrderList(count: number): Order[] {
  const dataList: Order[] = [];
  for (let i = 0; i < count; i++) {
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const items: OrderItem[] = Array.from({ length: itemCount }, () => ({
      id: faker.string.uuid(),
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      productImage: faker.image.url(),
      price: Number.parseFloat(faker.commerce.price({ min: 10, max: 9999 })),
      quantity: faker.number.int({ min: 1, max: 10 }),
      subtotal: 0, // 下面计算
    }));
    // 计算小计和总金额
    items.forEach((item) => {
      item.subtotal = Number.parseFloat(
        (item.price * item.quantity).toFixed(2),
      );
    });
    const totalAmount = Number.parseFloat(
      items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );

    const createdAt = faker.date.past({ years: 1 });
    const status = faker.helpers.arrayElement([...ORDER_STATUSES]);

    dataList.push({
      id: faker.string.uuid(),
      orderNo: `ORD${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}${faker.string.numeric(6)}`,
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      totalAmount,
      status,
      shippingAddress: `${faker.location.street()}, ${faker.location.city()}`,
      phone: faker.phone.number(),
      items,
      remark:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.3,
        }) || '',
      createTime: createdAt.toISOString().split('T')[0],
      updateTime: faker.date
        .between({ from: createdAt, to: new Date() })
        .toISOString()
        .split('T')[0],
    });
  }
  return dataList;
}

export const orderList = generateMockOrderList(80);
