<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
} from 'ant-design-vue';

import { getCategoryListApi } from '#/api/ecommerce/category';
import {
  createProductApi,
  getProductDetailApi,
  updateProductApi,
} from '#/api/ecommerce/product';

const route = useRoute();
const router = useRouter();

// 从路由参数获取 productId（编辑模式）
const productId = route.params.productId as string | undefined;
const isEdit = !!productId;

const formRef = ref<any>(null);
const loading = ref(false);
const categoryOptions = ref<any[]>([]);

// 表单数据
const formState = reactive({
  name: '',
  categoryId: undefined as string | undefined,
  price: undefined as number | undefined,
  stock: undefined as number | undefined,
  status: '上架',
  description: '',
});

// 加载分类选项
async function loadCategoryOptions() {
  try {
    const result = await getCategoryListApi({ page: 1, pageSize: 100 });
    categoryOptions.value = result.items.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    }));
  } catch {
    // 如果加载失败，使用静态选项兜底
    categoryOptions.value = [
      { label: '电子产品', value: 'cat-electronics' },
      { label: '服装', value: 'cat-clothing' },
      { label: '食品', value: 'cat-food' },
      { label: '家居', value: 'cat-home' },
      { label: '图书', value: 'cat-books' },
    ];
  }
}

/**
 * 编辑模式：加载商品数据并回填表单
 */
onMounted(async () => {
  await loadCategoryOptions();

  if (!isEdit) return;

  try {
    const product = await getProductDetailApi(productId);
    if (!product) {
      message.error('商品不存在');
      router.push('/ecommerce/product/list');
      return;
    }

    // 知识点：现在回填 categoryId 而不是 category 名称
    formState.name = product.name;
    formState.categoryId = product.categoryId;
    formState.price = product.price;
    formState.stock = product.stock;
    formState.status = product.status;
    formState.description = product.description;
  } catch {
    message.error('加载商品信息失败');
    router.push('/ecommerce/product/list');
  }
});

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    await formRef.value?.validate();

    loading.value = true;

    if (isEdit) {
      await updateProductApi(productId, formState as any);
      message.success('商品更新成功！');
    } else {
      await createProductApi(formState as any);
      message.success('商品新增成功！');
    }

    router.push('/ecommerce/product/list');
  } catch (error) {
    if (error && (error as any).errorFields) {
      return;
    }
    message.error('操作失败，请重试');
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  router.push('/ecommerce/product/list');
}
</script>

<template>
  <Page
    auto-scroll
    :title="isEdit ? '编辑商品' : '新增商品'"
    :description="isEdit ? '修改商品信息' : '填写商品信息，带 * 的为必填项'"
  >
    <Card>
      <Form
        ref="formRef"
        :model="formState"
        layout="vertical"
        class="mx-auto max-w-2xl"
      >
        <Form.Item
          label="商品名称"
          name="name"
          :rules="[{ required: true, message: '请输入商品名称' }]"
        >
          <Input v-model:value="formState.name" placeholder="请输入商品名称" />
        </Form.Item>

        <Form.Item
          label="分类"
          name="categoryId"
          :rules="[{ required: true, message: '请选择商品分类' }]"
        >
          <Select
            v-model:value="formState.categoryId"
            :options="categoryOptions"
            placeholder="请选择分类"
          />
        </Form.Item>

        <div class="flex gap-4">
          <Form.Item
            label="价格 (¥)"
            name="price"
            class="flex-1"
            :rules="[{ required: true, message: '请输入价格' }]"
          >
            <InputNumber
              v-model:value="formState.price"
              class="w-full"
              :min="0"
              :precision="2"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            label="库存"
            name="stock"
            class="flex-1"
            :rules="[{ required: true, message: '请输入库存数量' }]"
          >
            <InputNumber
              v-model:value="formState.stock"
              class="w-full"
              :min="0"
              :step="1"
              placeholder="0"
            />
          </Form.Item>
        </div>

        <Form.Item label="状态" name="status">
          <Select
            v-model:value="formState.status"
            :options="[
              { label: '上架', value: '上架' },
              { label: '下架', value: '下架' },
              { label: '缺货', value: '缺货' },
            ]"
          />
        </Form.Item>

        <Form.Item label="商品描述" name="description">
          <Input.TextArea
            v-model:value="formState.description"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </Form.Item>

        <Form.Item>
          <div class="flex gap-3">
            <Button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '保存修改' : '确认新增' }}
            </Button>
            <Button @click="handleCancel">取消</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  </Page>
</template>
