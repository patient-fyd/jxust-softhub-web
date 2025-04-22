<template>
    <div class="page-container">
      <div class="info-panel">
        <h2>找回密码</h2>
        <p>请输入您的邮箱地址，我们将发送重置链接</p>
        <img src="../../assets/security-illustration.svg" alt="忘记密码插图" />
      </div>
      <div class="form-card">
        <h1>忘记密码</h1>
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" v-model="email" placeholder="请输入邮箱" required />
          </div>
          <button type="submit">发送重置链接</button>
          <p class="login-text">
            想起密码了？<router-link to="/login" class="login-link">返回登录</router-link>
          </p>
        </form>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'ForgotPassword',
    setup() {
      const email = ref('');
  
      const handleForgotPassword = () => {
        // 忘记密码逻辑
      };
  
      return { email, handleForgotPassword };
    },
  });
  </script>
  
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

  .form-card {
    flex: 1;
    max-width: 420px;
    background: #ffffff;
    padding: 40px 32px;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  .form-card h1 {
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

  .login-text {
    margin-top: 18px;
    font-size: 14px;
    text-align: center;
    color: #666;
  }

  .login-link {
    color: #4785ff;
    font-weight: 600;
    text-decoration: none;
  }

  .login-link:hover {
    text-decoration: underline;
  }
  </style>