import { requestClient } from '#/api/request';

/** 商品信息 */
export interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  stock: number;
  status: '上架' | '下架' | '缺货';
  image: string;
  description: string;
  createTime: string;
}

/** 商品列表查询参数 */
export interface ProductListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  category?: string;
  status?: string;
}

/** 商品列表响应 */
export interface ProductListResult {
  items: ProductItem[];
  total: number;
}

/**
 * 获取商品列表
 */
export async function getProductListApi(params: ProductListParams) {
  return requestClient.get<ProductListResult>('/ecommerce/product/list', {
    params,
  });
}

/**
 * 获取商品详情
 */
export async function getProductDetailApi(id: string) {
  return requestClient.get<ProductItem>('/ecommerce/product/detail', {
    params: { id },
  });
}

/** 创建商品参数 */
export interface CreateProductParams {
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
}

/**
 * 新增商品
 */
export async function createProductApi(data: CreateProductParams) {
  return requestClient.post<ProductItem>('/ecommerce/product/create', data);
}

/**
 * 更新商品
 */
export async function updateProductApi(
  id: string,
  data: Partial<CreateProductParams>,
) {
  return requestClient.post(`/ecommerce/product/update?id=${id}`, data);
}

/**
 * 删除商品
 */
export async function deleteProductApi(id: string) {
  return requestClient.delete(`/ecommerce/product/delete?id=${id}`);
}
