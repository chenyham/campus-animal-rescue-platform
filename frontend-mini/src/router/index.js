import { createRouter, createWebHistory } from 'vue-router'

import { getSession } from '../utils/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'AdminLogin',
            component: () => import('../views/Login.vue'),
            meta: { title: '管理员登录' }
        },
        {
            path: '/',
            name: 'layout',
            component: () => import('../layout/index.vue'),
            redirect: '/dashboard',
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('../views/Dashboard.vue'),
                    meta: { title: '数据总览' }
                },
                {
                    path: 'animals',
                    name: 'Animals',
                    component: () => import('../views/Animals.vue'),
                    meta: { title: '动物档案' }
                },
                {
                    path: 'reports',
                    name: 'Reports',
                    component: () => import('../views/Reports.vue'),
                    meta: { title: '救助工单' }
                },
                {
                    path: 'checkins',
                    name: 'CheckIns',
                    component: () => import('../views/CheckIns.vue'),
                    meta: { title: '爱心救助' }
                },
                {
                    path: 'adoptions',
                    name: 'Adoptions',
                    component: () => import('../views/Adoptions.vue'),
                    meta: { title: '领养申请' }
                },
                {
                    path: 'aichat',
                    name: 'AIChat',
                    component: () => import('../views/AIChat.vue'),
                    meta: { title: 'AI专家问诊' }
                }
            ]
        }
    ]
})

router.beforeEach((to) => {
    document.title = to.meta.title || '校园救助后台'

    const session = getSession()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth && !session?.token) {
        return {
            name: 'AdminLogin',
            query: { redirect: to.fullPath },
        }
    }

    if (to.name === 'AdminLogin' && session?.token) {
        const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/dashboard'
        return redirect
    }
})

export default router
