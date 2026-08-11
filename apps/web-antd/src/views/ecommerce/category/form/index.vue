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
} from 'ant-design-vue';

import {
  createCategoryApi,
  getCategoryDetailApi,
  updateCategoryApi,
} from '#/api/ecommerce/category';

const route = useRoute();
const router = useRouter();

const categoryId = route.params.categoryId as string | undefined;
const isEdit = !!categoryId;

const formRef = ref<any>(null);
const loading = ref(false);

const formState = reactive({
  name: '',
  sort: 0,
  description: '',
});

onMounted(async () => {
  if (!isEdit) return;

  try {
    const category = await getCategoryDetailApi(categoryId);
    if (!category) {
      message.error('分类不存在');
      router.push('/ecommerce/category/list');
      return;
    }

    formState.name = category.name;
    formState.sort = category.sort;
    formState.description = category.description;
  } catch {
    message.error('加载分类信息失败');
    router.push('/ecommerce/category/list');
  }
});

async function handleSubmit() {
  try {
    await formRef.value?.validate();

    loading.value = true;

    if (isEdit) {
      await updateCategoryApi(categoryId, formState);
      message.success('分类更新成功！');
    } else {
      await createCategoryApi(formState);
      message.success('分类新增成功！');
    }

    router.push('/ecommerce/category/list');
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
  router.push('/ecommerce/category/list');
}
</script>

<template>
  <Page
    auto-scroll
    :title="isEdit ? '编辑分类' : '新增分类'"
    :description="isEdit ? '修改分类信息' : '填写分类信息，带 * 的为必填项'"
  >
    <Card>
      <Form
        ref="formRef"
        :model="formState"
        layout="vertical"
        class="mx-auto max-w-2xl"
      >
        <Form.Item
          label="分类名称"
          name="name"
          :rules="[{ required: true, message: '请输入分类名称' }]"
        >
          <Input v-model:value="formState.name" placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sort"
          :rules="[{ required: true, message: '请输入排序号' }]"
        >
          <InputNumber
            v-model:value="formState.sort"
            class="w-full"
            :min="0"
            :max="999"
            placeholder="数字越小越靠前"
          />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea
            v-model:value="formState.description"
            :rows="4"
            placeholder="请输入分类描述"
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
