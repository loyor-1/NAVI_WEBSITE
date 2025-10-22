import axios from 'axios'
import { getToken } from '@/utils/auth'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus';


const baseURL = import.meta.env.VITE_BASE_API
export default {
  name (name, isDelete = true) {
    var url = baseURL + "/file/download?fileName=" + name + "&delete=" + isDelete
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    }).then(async (res) => {
      const isLogin = await blobValidate(res.data)
      if (isLogin) {
        const blob = new Blob([res.data])
        saveAs(blob, decodeURI(name))
      } else {
        ElMessage({
          message: '无效的会话，或者会话已过期，请重新登录。',
          type: 'error',
        })
      }
    })
  },
  saveAs(text, name, opts) {
    saveAs(text, name, opts);
  },
  // post请求
  downLoadXls (url, data) {
    var url = baseURL + url
    axios({
      method: 'post',
      url: url,
      data: data,
      responseType: 'blob',
      headers: {
        "content-type": "application/json;application/octet-stream",
        Authorization: getToken(),
      },
    }).then(async (res) => {
      const isLogin = await blobValidate(res.data)
      if (isLogin) {
        const fileNames = res.headers['content-disposition']
        if (fileNames) {
          //解码
          const fileName = decodeURIComponent(fileNames.match(/=(.*)$/)[1])
          // 处理返回的文件流
          const content = res.data
          const blob = new Blob([content], {
            type: "application/octet-stream; charset=utf-8"
          })
          if ('download' in document.createElement('a')) {
            //非IE下载
            const a = document.createElement('a')
            a.download = fileName.replace(new RegExp('"', 'g'), '')
            a.style.display = 'none'
            a.href = URL.createObjectURL(blob)
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(a.href) //释放URL 对象
            document.body.removeChild(a) //删掉a标签
          } else {
            //IE10 + 下载
            navigator.msSaveBlob(blob, fileName)
          }
        }
      } else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
      }
    })

  },
  // get请求
  getDownLoadXls (url, query) {
    var url = baseURL + url
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: url,
        params: query,
        responseType: 'blob',
        headers: {
          "content-type": "application/json;application/octet-stream",
          Authorization: getToken(),
        },
      }).then(async (res) => {
        const isLogin = await blobValidate(res.data)
        if (isLogin) {
          const fileNames = res.headers['content-disposition']
          if (fileNames) {
            //解码
            const fileName = decodeURIComponent(fileNames.match(/=(.*)$/)[1])
            // 处理返回的文件流
            const content = res.data
            const blob = new Blob([content], {
              type: "application/octet-stream; charset=utf-8"
            })
            if ('download' in document.createElement('a')) {
              //非IE下载
              const a = document.createElement('a')
              a.download = fileName.replace(new RegExp('"', 'g'), '')
              a.style.display = 'none'
              a.href = URL.createObjectURL(blob)
              document.body.appendChild(a)
              a.click()
              URL.revokeObjectURL(a.href) //释放URL 对象
              document.body.removeChild(a) //删掉a标签
            } else {
              //IE10 + 下载
              navigator.msSaveBlob(blob, fileName)
            }
          }
          resolve(true)
        } else {
          ElMessage({
            message: res.msg,
            type: 'error',
          })
          reject(false)
        }
      })
    })
  },
  async blobValidate (data) {
    try {
      const text = await data.text()
      JSON.parse(text)
      return false
    } catch (error) {
      return true
    }
  },
}

