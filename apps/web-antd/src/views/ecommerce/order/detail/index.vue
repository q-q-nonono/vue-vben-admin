<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Table,
  Tag,
  Timeline,
} from 'ant-design-vue';

import { getOrderDetailApi, updateOrderStatusApi } from '#/api/ecommerce/order';

const route = useRoute();
const router = useRouter();

const orderId = route.params.orderId as string;
const order = ref<any>(null);
const loading = ref(false);

const statusColorMap: Record<string, string> = {
  待付款: 'orange',
  待发货: 'blue',
  已发货: 'cyan',
  已完成: 'green',
  已取消: 'red',
};

onMounted(async () => {
  try {
    order.value = await getOrderDetailApi(orderId);
    if (!order.value) {
      message.error('订单不存在');
      router.push('/ecommerce/order/list');
    }
  } catch {
    message.error('加载订单信息失败');
    router.push('/ecommerce/order/list');
  }
});

async function handleUpdateStatus(nextStatus: string) {
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要将此订单${nextStatus === '已取消' ? '取消' : `更新为「${nextStatus}」`}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

  if (!confirmed) return;

  try {
    const result = await updateOrderStatusApi(orderId, nextStatus);
    if (result.success === false) {
      message.warning(result.message || '状态更新失败');
      return;
    }
    message.success('状态更新成功！');
    // 重新加载订单数据
    order.value = await getOrderDetailApi(orderId);
  } catch {
    message.error('操作失败，请重试');
  }
}

function getStatusActions(
  status: string,
): { label: string; nextStatus: string; type?: string }[] {
  const actions: Record<
    string,
    { label: string; nextStatus: string; type?: string }[]
  > = {
    待付款: [
      { label: '确认付款', nextStatus: '待发货', type: 'primary' },
      { label: '取消订单', nextStatus: '已取消', type: 'danger' },
    ],
    待发货: [
      { label: '标记发货', nextStatus: '已发货', type: 'primary' },
      { label: '取消订单', nextStatus: '已取消', type: 'danger' },
    ],
    已发货: [{ label: '确认收货', nextStatus: '已完成', type: 'primary' }],
    已完成: [],
    已取消: [],
  };
  return actions[status] || [];
}

const statusTimeline: Record<string, { color: string; label: string }> = {
  待付款: { label: '下单', color: 'blue' },
  待发货: { label: '付款', color: 'green' },
  已发货: { label: '发货', color: 'cyan' },
  已完成: { label: '收货完成', color: 'green' },
};
</script>

<template>
  <Page
    auto-scroll
    :title="`订单详情 - ${order?.orderNo || ''}`"
    :description="order ? `创建时间：${order.createTime}` : '加载中...'"
  >
    <template #extra>
      <Button class="mr-2" @click="router.push('/ecommerce/order/list')">
        返回列表
      </Button>
      <template v-if="order">
        <template
          v-for="action in getStatusActions(order.status)"
          :key="action.nextStatus"
        >
          <Button
            :type="action.type || 'default'"
            :danger="action.type === 'danger'"
            @click="handleUpdateStatus(action.nextStatus)"
          >
            {{ action.label }}
          </Button>
        </template>
      </template>
    </template>

    <!-- 基本信息 -->
    <Card title="基本信息" class="mb-4">
      <Descriptions v-if="order" :column="2" bordered size="small">
        <Descriptions.Item label="订单号">
          {{ order.orderNo }}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag :color="statusColorMap[order.status] || 'default'">
            {{ order.status }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="用户">
          {{ order.userName }}
        </Descriptions.Item>
        <Descriptions.Item label="总金额">
          <span class="text-lg font-bold text-red-500">
            ¥{{ order.totalAmount.toFixed(2) }}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="收货地址" :span="2">
          {{ order.shippingAddress }}
        </Descriptions.Item>
        <Descriptions.Item label="联系电话">
          {{ order.phone }}
        </Descriptions.Item>
        <Descriptions.Item label="备注">
          {{ order.remark || '无' }}
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <!-- 商品明细 -->
    <Card title="商品明细" class="mb-4">
      <Table
        v-if="order?.items"
        :data-source="order.items"
        :columns="[
          { title: '商品', dataIndex: 'productName', key: 'productName' },
          {
            title: '单价',
            dataIndex: 'price',
            key: 'price',
            customRender: ({ text }: any) => `¥${text.toFixed(2)}`,
          },
          { title: '数量', dataIndex: 'quantity', key: 'quantity' },
          {
            title: '小计',
            dataIndex: 'subtotal',
            key: 'subtotal',
            customRender: ({ text }: any) => `¥${text.toFixed(2)}`,
          },
        ]"
        :pagination="false"
        row-key="id"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'productName'">
            <div class="flex items-center gap-2">
              <img
                :src="record.productImage"
                :alt="record.productName"
                class="h-10 w-10 rounded object-cover"
              />
              <span>{{ record.productName }}</span>
            </div>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 状态时间线 -->
    <Card title="订单进度">
      <Timeline v-if="order">
        <Timeline.Item
          v-for="(info, status) in statusTimeline"
          :key="status"
          :color="info.color"
        >
          <template #label>
            {{ info.label }}
          </template>
          <span :class="{ 'font-bold': order.status === status }">
            {{ status }}
          </span>
        </Timeline.Item>
      </Timeline>
    </Card>
  </Page>
</template>
