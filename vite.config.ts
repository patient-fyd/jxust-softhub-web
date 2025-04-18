import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { dirname, resolve } from 'path'

// 获取当前文件的目录
const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.vue', '.ts', '.js', '.json'],
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // 修改为本地后端API地址
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          // 在发送请求到后端之前打印调试信息
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('向后端发送请求:', req.method, req.url);
          });
          // 接收后端响应时打印调试信息
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('收到后端响应:', proxyRes.statusCode, req.url);
          });
          // 代理出错时打印调试信息
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err);
          });
        }
      }
    }
  },
  build: {
    assetsInlineLimit: 10240, // 10KB
  },
  optimizeDeps: {
    include: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/commands',
      '@codemirror/lang-javascript',
      '@codemirror/lang-python',
      '@codemirror/lang-cpp',
      '@codemirror/theme-one-dark',
      'vue-codemirror',
      'prismjs'
    ]
  }
})
