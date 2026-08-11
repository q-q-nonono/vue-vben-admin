<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCategoryApi,
  getCategoryListApi,
} from '#/api/ecommerce/category';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '分类名称',
        componentProps: {
          placeholder: '请输入分类名称',
        },
      },
    ],
    submitOnChange: false,
  },
  gridOptions: {
    columns: [
      {
        field: 'name',
        title: '分类名称',
        width: 200,
      },
      {
        field: 'sort',
        title: '排序',
        width: 100,
        align: 'center',
      },
      {
        field: 'description',
        title: '描述',
        width: 300,
        showOverflow: 'ellipsis',
      },
      {
        field: 'productCount',
        title: '商品数量',
        width: 120,
        align: 'center',
        slots: { default: 'productCount' },
      },
      {
        field: 'createTime',
        title: '创建时间',
        width: 160,
      },
      {
        field: 'action',
        title: '操作',
        width: 160,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: any) => {
          const { items, total } = await getCategoryListApi({
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

const router = useRouter();

function handleAdd() {
  router.push('/ecommerce/category/add');
}

function handleEdit(row: any) {
  router.push(`/ecommerce/category/edit/${row.id}`);
}

async function handleDelete(row: any) {
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除分类「${row.name}」吗？`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

  if (!confirmed) return;

  try {
    const result = await deleteCategoryApi(row.id);
    if (result.success === false) {
      message.warning(result.message || '该分类下还有商品，无法删除');
      return;
    }
    message.success('删除成功！');
    gridApi.reload();
  } catch {
    message.error('删除失败，请重试');
  }
}
</script>

<template>
  <Page
    auto-scroll
    description="管理商品分类，删除分类前请确保该分类下没有商品"
    title="分类管理"
  >
    <template #extra>
      <Button type="primary" @click="handleAdd">
        <template #icon>
          <Plus class="size-4" />
        </template>
        新增分类
      </Button>
    </template>

    <Grid>
      <template #productCount="{ row }">
        <Tag v-if="row.productCount > 0" color="blue">
          {{ row.productCount }}
        </Tag>
        <span v-else style="color: #999">{{ row.productCount }}</span>
      </template>
      <template #action="{ row }">
        <Button type="link" size="small" @click="handleEdit(row)">
          编辑
        </Button>
        <Button type="link" size="small" danger @click="handleDelete(row)">
          删除
        </Button>
      </template>
    </Grid>
  </Page>
</template>
