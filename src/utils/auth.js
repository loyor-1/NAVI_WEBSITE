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

export function getUserInfo() {
  return localStorage.getItem('user_info')
}

export function removeUserInfo() {
  localStorage.removeItem('user_info')
}