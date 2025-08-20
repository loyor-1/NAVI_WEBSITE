import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 8088,
      open: true,
      proxy: {
        // API 服务代理
        [env.VITE_BASE_API]: {
          target: env.VITE_PROXY_API_TARGET || 'https://test.navi-sci.cn/dev-api',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_BASE_API}`), ''),
          // 如果需要携带 cookie
          // cookieDomainRewrite: 'localhost'
        },
        // 文件服务代理
        [env.VITE_FILE_API]: {
          target: env.VITE_PROXY_FILE_TARGET || 'https://test.navi-sci.cn/dev-file',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_FILE_API}`), '')
        }
      }
    },
  }
})