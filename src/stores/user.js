import { defineStore } from 'pinia'
import { useLogin, useLogout, useGetUserInfoByToken, useQRCodeLogin, useGetDicts } from '@/api'
import { setToken, removeToken, setUserInfo, getUserInfo, removeUserInfo, getTeamInfo, removeTeamInfo } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {

  const router = useRouter()

  // 登录
  async function login(data) {
    try {
      // 存储token
      const res_token = await useLogin(data)
      setToken(res_token.data.access_token)
      // 存储用户信息
      const res_user_info = await useGetUserInfoByToken()
      res_user_info.user.avatar_path = res_user_info.user.avatar ? import.meta.env.VITE_FILE_API + res_user_info.user.avatar : ''
      await getTeamInfo()
      const res_dict = await useGetDicts('customer_service_qrcode')//获取区域客服二维码
      localStorage.setItem('kefu_list', JSON.stringify(res_dict.data))
      setUserInfo(JSON.stringify(res_user_info.user))
      ElMessage.success('登录成功！')
      return true
    }
    catch(err) {
      console.log(err)
      return false
    }
  }

  //扫码登录
  async function QRCode_login(data) {
    try {
      // 存储token
      const res_token = await useQRCodeLogin(data)
      setToken(res_token.token)
      // 存储用户信息
      const res_user_info = await useGetUserInfoByToken()
      res_user_info.user.avatar_path = res_user_info.user.avatar ? import.meta.env.VITE_FILE_API + res_user_info.user.avatar : ''
      setUserInfo(JSON.stringify(res_user_info.user))
      await getTeamInfo()
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
      removeTeamInfo()
      await router.push('/home_page')
      window.location.reload()
      ElMessage.success('退出登录成功！')
    }
    catch(err) {
      console.log(err)
    }
  }

  return { login, logout, QRCode_login }
})
