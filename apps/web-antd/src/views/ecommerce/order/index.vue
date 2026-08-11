<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button, message, Modal, Tag } from 'ant-design-vue';

import { getOrderListApi, updateOrderStatusApi } from '#/api/ecommerce/order';
const router = useRouter();
import { useVbenVxeGrid } from '#/adapter/vxe-table';

// 知识点：状态对应的颜色标签
// 待付款 → orange / 待发货 → blue / 已发货 → cyan / 已完成 → green / 已取消 → red
const statusColorMap: Record<string, string> = {
  待付款: 'orange',
  待发货: 'blue',
  已发货: 'cyan',
  已完成: 'green',
  已取消: 'red',
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '订单号',
        componentProps: {
          placeholder: '请输入订单号',
        },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '状态',
        componentProps: {
          allowClear: true,
          placeholder: '选择状态',
          options: [
            { label: '待付款', value: '待付款' },
            { label: '待发货', value: '待发货' },
            { label: '已发货', value: '已发货' },
            { label: '已完成', value: '已完成' },
            { label: '已取消', value: '已取消' },
          ],
        },
      },
      {
        component: 'Input',
        fieldName: 'userName',
        label: '用户',
        componentProps: {
          placeholder: '请输入用户名',
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns: [
      {
        field: 'orderNo',
        title: '订单号',
        width: 200,
      },
      {
        field: 'userName',
        title: '用户',
        width: 120,
      },
      {
        field: 'totalAmount',
        title: '金额',
        width: 120,
        align: 'right',
        formatter: ({ cellValue }: any) => `¥${cellValue.toFixed(2)}`,
      },
      {
        field: 'status',
        title: '状态',
        width: 100,
        align: 'center',
        slots: { default: 'status' },
      },
      {
        field: 'items',
        title: '商品数',
        width: 80,
        align: 'center',
        formatter: ({ cellValue }: any) => `${cellValue.length}`,
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 160,
      },
      {
        field: 'action',
        title: '操作',
        width: 240,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: any) => {
          const { items, total } = await getOrderListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return { items, total };
        },
      },
    },
    pagerConfig: {
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
    },
    toolbarConfig: {
      refresh: true,
      zoom: true,
      custom: true,
      search: true,
    },
    rowConfig: {
      keyField: 'id',
    },
    height: 'auto',
    minHeight: 400,
  },
});

/**
 * 知识点：订单状态流转操作
 * 每个状态对应不同的可操作项
 */
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

async function handleUpdateStatus(row: any, nextStatus: string) {
  const statusLabels: Record<string, string> = {
    待付款: '确认付款',
    待发货: '标记发货',
    已发货: '确认收货',
    已取消: '取消订单',
  };

  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要将订单「${row.orderNo}」${statusLabels[nextStatus] || '更新状态'}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

  if (!confirmed) return;

  try {
    const result = await updateOrderStatusApi(row.id, nextStatus);
    if (result.success === false) {
      message.warning(result.message || '状态更新失败');
      return;
    }
    message.success('状态更新成功！');
    gridApi.reload();
  } catch {
    message.error('操作失败，请重试');
  }
}
</script>

<template>
  <Page
    auto-scroll
    description="管理订单，支持订单状态流转（待付款 → 待发货 → 已发货 → 已完成）"
    title="订单管理"
  >
    <Grid>
      <template #status="{ row }">
        <Tag :color="statusColorMap[row.status] || 'default'">
          {{ row.status }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button
          type="link"
          size="small"
          @click="router.push(`/ecommerce/order/detail/${row.id}`)"
        >
          详情
        </Button>
        <template
          v-for="action in getStatusActions(row.status)"
          :key="action.nextStatus"
        >
          <Button
            :type="action.type || 'link'"
            size="small"
            :danger="action.type === 'danger'"
            @click="handleUpdateStatus(row, action.nextStatus)"
          >
            {{ action.label }}
          </Button>
        </template>
      </template>
    </Grid>
  </Page>
</template>
