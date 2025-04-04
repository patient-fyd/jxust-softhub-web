<template>
    <div class="page-container">
      <div class="info-panel">
        <h2>JXUST SoftHub</h2>
        <p>江西应用科技学院 · 软件协会</p>
        <img src="@/assets/security-illustration.svg" alt="security illustration" />
      </div>
      <div class="login-container">
        <h1>登录账户</h1>
        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="username" placeholder="请输入用户名" required />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="password" placeholder="请输入密码" required />
          </div>
          <div class="form-footer">
            <label><input type="checkbox" /> 记住我</label>
            <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
          </div>
          <button type="submit" :disabled="isLoading">{{ isLoading ? '登录中...' : '登录' }}</button>
          <p class="signup-text">
            还没有账户？ <router-link to="/register" class="signup-link">立即注册</router-link>
          </p>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../stores/userStore';
  
  export default defineComponent({
    name: 'Login',
    setup() {
      const router = useRouter();
      const userStore = useUserStore();
      const username = ref('');
      const password = ref('');
      const isLoading = ref(false);
      const loginError = ref('');
  
      const handleLogin = async () => {
        loginError.value = '';
        if (!username.value.trim() || !password.value.trim()) {
          loginError.value = '请输入用户名和密码';
          return;
        }
        
        isLoading.value = true;
        try {
          const result = await userStore.login({
            userName: username.value,
            password: password.value
          });
          
          if (result.success) {
            // 登录成功，跳转到首页
            router.push('/');
          } else {
            loginError.value = result.error || '登录失败，请检查用户名和密码';
          }
        } catch (error: any) {
          loginError.value = error.message || '登录过程中发生错误';
        } finally {
          isLoading.value = false;
        }
      };
  
      return { username, password, handleLogin, isLoading, loginError };
    },
  });
  </script>
  
  <style>
  .error-message {
    background-color: #ffebee;
    color: #d32f2f;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
  }
  </style>
  
  <style scoped>
  .page-container {
    display: flex;
    min-height: calc(100vh - 200px);
    background: #fff;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 40px;
  }

  .info-panel {
    flex: 1;
    text-align: center;
  }

  .info-panel h2 {
    font-size: 28px;
    font-weight: 700;
    color: #222;
    margin-bottom: 12px;
  }

  .info-panel p {
    font-size: 16px;
    color: #888;
    margin-bottom: 24px;
  }

  .info-panel img {
    width: 320px;
    max-width: 90%;
  }

  .login-container {
    flex: 1;
    max-width: 420px;
    background: #ffffff;
    padding: 40px 32px;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  .login-container h1 {
    font-size: 20px;
    margin-bottom: 24px;
    color: #333;
    font-weight: 600;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 6px;
    color: #333;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    color: #666;
    margin-bottom: 20px;
  }

  .form-footer label {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(to right, #4785ff, #1e90ff);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover {
    background: linear-gradient(to right, #3575e6, #1a82ff);
  }

  .signup-text {
    margin-top: 18px;
    font-size: 14px;
    text-align: center;
    color: #666;
  }

  .signup-link {
    color: #43b02a;
    font-weight: 600;
  }

  .signup-link:hover {
    text-decoration: underline;
  }

  .forgot-link {
    color: #4785ff;
    font-size: 13px;
    text-decoration: none;
  }

  .forgot-link:hover {
    text-decoration: underline;
  }
  </style>