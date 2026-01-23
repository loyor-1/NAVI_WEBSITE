import { defineStore } from 'pinia'
import { useLogin, useLogout, useGetUserInfoByToken, useQRCodeLogin, useGetDicts } from '@/api'
import { setToken, removeToken, setUserInfo, getUserInfo, removeUserInfo } from '@/utils/auth'
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
      await router.push('/home_page')
      window.location.reload()
      ElMessage.success('退出登录成功！')
    }
    catch(err) {
      console.log(err)
    }
  }

  //设置客服二维码
  async function setKefuQRCode() {
    const res_user_info = await getUserInfo()
    const res_dict = await useGetDicts('customer_service_qrcode')//获取区域客服二维码
    const data = res_dict.data.find(item => item.dictLabel == res_user_info.unitId)
    if(data) {
      localStorage.setItem('kefu_QR_code', data.dictValue)
    }
  }

  return { login, logout, QRCode_login, setKefuQRCode }
})
