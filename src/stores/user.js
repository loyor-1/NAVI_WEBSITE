import { defineStore } from 'pinia'
import { useLogin, useLogout, useGetUserInfoByToken } from '@/api'
import { setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 登录
  async function login(data) {
    try {
      // 存储token
      const res_token = await useLogin(data)
      setToken(res_token.data.access_token)
      // 存储用户信息
      const res_user_info = await useGetUserInfoByToken()
      res_user_info.user.avatar_path = import.meta.env.VITE_FILE_API + res_user_info.user.avatar
      setUserInfo(JSON.stringify(res_user_info.user))
      ElMessage.success('登录成功！')
      return true
    }
    catch(err) {
      console.log(err)
      return false
    }
  }

  //登出
  async function logout() {
    try {
      await useLogout()
      removeToken()
      removeUserInfo()
      ElMessage.success('退出登录成功！')
    }
    catch(err) {
      console.log(err)
    }
  }

  return { login, logout }
})
