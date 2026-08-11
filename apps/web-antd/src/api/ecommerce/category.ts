import { requestClient } from '#/api/request';

/** 分类信息 */
export interface CategoryItem {
  id: string;
  name: string;
  sort: number;
  description: string;
  productCount: number;
  createTime: string;
}

/** 分类列表查询参数 */
export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  name?: string;
}

/** 分类列表响应 */
export interface CategoryListResult {
  items: CategoryItem[];
  total: number;
}

/** 创建分类参数 */
export interface CreateCategoryParams {
  name: string;
  sort?: number;
  description?: string;
}

/**
 * 获取分类列表
 */
export async function getCategoryListApi(params: CategoryListParams) {
  return requestClient.get<CategoryListResult>('/ecommerce/category/list', {
    params,
  });
}

/**
 * 获取分类详情
 */
export async function getCategoryDetailApi(id: string) {
  return requestClient.get<CategoryItem>('/ecommerce/category/detail', {
    params: { id },
  });
}

/**
 * 新增分类
 */
export async function createCategoryApi(data: CreateCategoryParams) {
  return requestClient.post<CategoryItem>('/ecommerce/category/create', data);
}

/**
 * 更新分类
 */
export async function updateCategoryApi(
  id: string,
  data: Partial<CreateCategoryParams>,
) {
  return requestClient.post(`/ecommerce/category/update?id=${id}`, data);
}

/**
 * 删除分类
 */
export async function deleteCategoryApi(id: string) {
  return requestClient.delete(`/ecommerce/category/delete?id=${id}`);
}
