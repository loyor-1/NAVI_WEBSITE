import axios from 'axios';
import errorCode from './errorCode'
import { debounce } from 'lodash';
import { getToken, removeToken, removeUserInfo, removeTeamInfo } from '@/utils/auth'; // 假设有获取/删除Token的工具函数
import { ElMessage } from 'element-plus'; // UI提示库（可选）

// 存储正在debounce的请求
const debounceMap = new Map();

// 创建Axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // 从环境变量读取API地址
  timeout: 10000, // 超时时间
  withCredentials: true,
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 为每个请求生成唯一key，可以根据URL、method和params组合
    const requestKey = `${config.url}_${config.method}_${JSON.stringify(config.params)}`;
    // 如果已经有相同的请求在debounce中，取消新请求--- 除非含有  no_debounce：true 字段
    if (debounceMap.has(requestKey) && !config.no_debounce) {
      // return Promise.reject(new Error('数据正在提交，请勿重复上传！'));
      return Promise.reject();
    }
    // 设置debounce
    debounceMap.set(requestKey, true);
    // 一定时间后清除记录，500ms防抖时间
    debounce(() => {
      debounceMap.delete(requestKey);
    }, 1000)()
    // 在发送请求前做的事情
    if (getToken()) {
      config.headers['Authorization'] = `Bearer ${getToken()}`; // 携带Token
    }
    return config;
  },
  error => {
    // 对请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  //成功
  response=> {
    // 未设置状态码则默认成功状态
    const code = response.data.code || 200;
    const msg = response.data.msg || errorCode[code] || errorCode['default']
    if (code === 401) {
      removeToken()
      removeUserInfo, removeTeamInfo()
      removeTeamInfo()
      return Promise.reject(response.data)
    } else if (code === 400 || code === 410 || code === 411 || code === 412) {
      return Promise.reject(msg)
    } else if (code === 500) {
      ElMessage.error(msg || 'Error')
      return Promise.reject(new Error(msg))
    } else {
      return response.data
    }
  },
  //失败
  error => {
    if(!error) return
    // 对响应错误处理（HTTP状态码非2xx）
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
);

export default service;