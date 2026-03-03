import { useGetUserInfoByToken, useGetTeamInfo } from "@/api"

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function setUserInfo(user_info) {
  localStorage.setItem('user_info', user_info)
}

export function setTeamInfo(team_info) {
  localStorage.setItem('team_info', team_info)
}

export function getUserInfo() {
  useGetUserInfoByToken().then(res => {
    if(res) {
      res.user.avatar_path = res.user.avatar ? import.meta.env.VITE_FILE_API + res.user.avatar : ''
      setUserInfo(JSON.stringify(res.user))
    }
  })
  const data = JSON.parse(localStorage.getItem('user_info'))
  return data
}

export function getTeamInfo() {
  const user_info = JSON.parse(localStorage.getItem('user_info'))
  if(user_info && user_info.teamId) {
    useGetTeamInfo(user_info.teamId).then(res => {
      res.data.avatar_path = res.data.teamProFilePhoto ? import.meta.env.VITE_FILE_API + res.data.teamProFilePhoto : ''
      setTeamInfo(JSON.stringify(res.data))
    })
  }
  const data = JSON.parse(localStorage.getItem('team_info'))
  return data
}

export function removeUserInfo() {
  localStorage.removeItem('user_info')
}
export function removeTeamInfo() {
  localStorage.removeItem('team_info')
}