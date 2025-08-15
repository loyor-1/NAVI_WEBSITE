import { defineStore } from 'pinia'
import { useLogin, useGetUserInfoByToken } from '@/api'
import { setToken, setUserInfo } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  async function login(data) {
    const res_token = await useLogin(data)
    setToken(res_token.data.access_token)
    const res_user_info =  await useGetUserInfoByToken()
    setUserInfo(JSON.stringify(res_user_info.user))
  }

  return { login }
})
