import axios from 'axios'
import { ElMessage } from 'element-plus'

import router from '../router'
import { clearSession, getToken } from './auth'

const request = axios.create({
    baseURL: '/api',
    timeout: 5000
})

request.interceptors.request.use(
    config => {
        const token = getToken()
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        if (error.response?.status === 401) {
            clearSession()
            if (router.currentRoute.value.name !== 'AdminLogin') {
                router.replace({
                    name: 'AdminLogin',
                    query: { redirect: router.currentRoute.value.fullPath },
                })
            }
        }
        ElMessage.error(error.response?.data?.detail || '网络请求错误')
        return Promise.reject(error)
    }
)

export default request
