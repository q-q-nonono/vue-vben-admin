import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:shopping-cart',
      order: 1000,
      title: $t('page.ecommerce.title'),
    },
    name: 'Ecommerce',
    path: '/ecommerce',
    children: [
      {
        name: 'ProductList',
        path: '/ecommerce/product/list',
        component: () => import('#/views/ecommerce/product/index.vue'),
        meta: {
          icon: 'lucide:package',
          title: $t('page.ecommerce.product'),
        },
      },
      {
        name: 'ProductAdd',
        path: '/ecommerce/product/add',
        component: () => import('#/views/ecommerce/product/form/index.vue'),
        meta: {
          hideInMenu: true,
          title: '新增商品',
        },
      },
      {
        name: 'ProductEdit',
        path: '/ecommerce/product/edit/:productId',
        component: () => import('#/views/ecommerce/product/form/index.vue'),
        meta: {
          hideInMenu: true,
          title: '编辑商品',
        },
      },
      {
        name: 'CategoryList',
        path: '/ecommerce/category/list',
        component: () => import('#/views/ecommerce/category/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: $t('page.ecommerce.category'),
        },
      },
      {
        name: 'CategoryAdd',
        path: '/ecommerce/category/add',
        component: () => import('#/views/ecommerce/category/form/index.vue'),
        meta: {
          hideInMenu: true,
          title: '新增分类',
        },
      },
      {
        name: 'CategoryEdit',
        path: '/ecommerce/category/edit/:categoryId',
        component: () => import('#/views/ecommerce/category/form/index.vue'),
        meta: {
          hideInMenu: true,
          title: '编辑分类',
        },
      },
      {
        name: 'OrderList',
        path: '/ecommerce/order/list',
        component: () => import('#/views/ecommerce/order/index.vue'),
        meta: {
          icon: 'lucide:receipt',
          title: $t('page.ecommerce.order'),
        },
      },
      {
        name: 'OrderDetail',
        path: '/ecommerce/order/detail/:orderId',
        component: () => import('#/views/ecommerce/order/detail/index.vue'),
        meta: {
          hideInMenu: true,
          title: '订单详情',
        },
      },
    ],
  },
];

export default routes;
