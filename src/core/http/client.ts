import axios from 'axios'
import { appEnv } from '@/core/config/env'
import { setupInterceptors } from './interceptors'

export const http = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: 10000,
})

setupInterceptors(http)
