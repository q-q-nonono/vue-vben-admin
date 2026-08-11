<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCategoryListApi } from '#/api/ecommerce/category';
import { deleteProductApi, getProductListApi } from '#/api/ecommerce/product';

/**
 * 知识点：VxeTable 表格配置详解
 *
 * 1. columns: 定义表格列
 *    - field: 对应 API 返回的字段名
 *    - title: 列标题
 *    - width: 列宽度
 *    - formatter: 格式化显示（如价格加 ¥）
 *    - slots: 插槽，自定义渲染（如操作按钮）
 *
 * 2. proxyConfig: 代理配置
 *    自动处理分页、排序、搜索，不用手动写 loading/分页逻辑
 *
 * 3. formOptions: 顶部搜索表单
 *    自动生成搜索条件，和表格联动
 *
 * 4. 高度自适应:
 *    - minHeight: 表格最小高度，保证即使数据少也能看到表格
 *    - height: 'auto' + maxHeight: 数据多时自动出现滚动条
 */

// 分类选项，从分类接口动态获取
// 知识点：使用 ref 包裹，VxeGrid 会响应式更新选项
const categoryOptions = ref<any[]>([
  { label: '电子产品', value: '电子产品' },
  { label: '服装', value: '服装' },
  { label: '食品', value: '食品' },
  { label: '家居', value: '家居' },
  { label: '图书', value: '图书' },
]);

async function loadCategoryOptions() {
  try {
    const result = await getCategoryListApi({ page: 1, pageSize: 100 });
    if (result.items && result.items.length > 0) {
      categoryOptions.value = result.items.map((cat: any) => ({
        label: cat.name,
        value: cat.name,
      }));
    }
  } catch {
    // 兜底选项在初始化时已设置，这里不做处理
  }
}

loadCategoryOptions();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '商品名称',
        componentProps: {
          placeholder: '请输入商品名称',
        },
      },
      {
        component: 'Select',
        fieldName: 'category',
        label: '分类',
        // 知识点：componentProps 写成函数，VxeGrid 会在 computed 中调用
        // 这样 categoryOptions 变化时，下拉选项会响应式更新
        componentProps: () => ({
          allowClear: true,
          placeholder: '选择分类',
          options: categoryOptions.value,
        }),
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '状态',
        componentProps: {
          allowClear: true,
          placeholder: '选择状态',
          options: [
            { label: '上架', value: '上架' },
            { label: '下架', value: '下架' },
            { label: '缺货', value: '缺货' },
          ],
        },
      },
    ],
    submitOnChange: false,
    // 知识点: submitOnChange = false 表示点"查询"按钮才搜索
    // 如果改为 true，选择下拉框或输入文字后立即搜索
  },
  gridOptions: {
    // 列定义
    columns: [
      {
        field: 'name',
        title: '商品名称',
        width: 280,
        // 知识点：用 slots 自定义渲染商品名称列
        // 同时展示商品图片 + 名称
        slots: { default: 'name' },
      },
      {
        field: 'category',
        title: '分类',
        width: 120,
      },
      {
        field: 'price',
        title: '价格',
        width: 120,
        formatter: ({ cellValue }: any) => `¥${cellValue.toFixed(2)}`,
      },
      {
        field: 'stock',
        title: '库存',
        width: 100,
      },
      {
        field: 'status',
        title: '状态',
        width: 100,
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

    // 代理：自动请求后端数据
    proxyConfig: {
      ajax: {
        // 知识点：proxy query 回调的第二个参数是表单搜索条件
        // 第一个参数解构出 page/sort 等表格自身状态
        query: async ({ page }: any, formValues: any) => {
          const { items, total } = await getProductListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return { items, total };
        },
      },
    },

    // 分页配置
    pagerConfig: {
      pageSize: 10,
      pageSizes: [5, 10, 20, 50],
    },

    // 工具栏
    toolbarConfig: {
      refresh: true,
      zoom: true,
      custom: true,
      search: true,
    },

    // 行标识字段
    rowConfig: {
      keyField: 'id',
    },

    // 表格高度：自适应内容，但保证最小高度
    height: 'auto',
    minHeight: 400,
  },
});

const router = useRouter();

function handleAdd() {
  router.push('/ecommerce/product/add');
}

function handleEdit(row: any) {
  router.push(`/ecommerce/product/edit/${row.id}`);
}

async function handleDelete(row: any) {
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除商品「${row.name}」吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

  if (!confirmed) return;

  try {
    await deleteProductApi(row.id);
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
    description="管理您的商品信息，包括新增、编辑、上下架等操作"
    title="商品管理"
  >
    <template #extra>
      <Button type="primary" @click="handleAdd">
        <template #icon>
          <Plus class="size-4" />
        </template>
        新增商品
      </Button>
    </template>

    <Grid>
      <template #name="{ row }">
        <div class="flex items-center gap-3">
          <img
            :src="row.image"
            :alt="row.name"
            class="h-10 w-10 rounded-md object-cover"
          />
          <span class="font-medium">{{ row.name }}</span>
        </div>
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
