<template>
  <div class="page-container">
    <div class="info-panel">
      <h2>欢迎加入</h2>
      <p>江西应用科技学院 · 软件协会</p>
      <img src="@/assets/security-illustration.svg" alt="注册插图" />
    </div>
    <div class="register-container">
      <h1>创建账户</h1>
      <div v-if="registerError" class="error-message">
        {{ registerError }}
      </div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="formData.userName" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label for="name">姓名</label>
          <input type="text" id="name" v-model="formData.name" placeholder="请输入姓名" required />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input type="email" id="email" v-model="formData.email" placeholder="请输入邮箱" required />
        </div>
        <div class="form-group">
          <label for="phone">手机号</label>
          <input type="tel" id="phone" v-model="formData.phone" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="formData.password" placeholder="请输入密码" required />
        </div>
        <button type="submit" :disabled="isLoading">{{ isLoading ? '注册中...' : '注册' }}</button>
        <p class="login-text">
          已有账号？<router-link to="/login" class="login-link">立即登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import type { RegisterRequest } from '../services/userService';

export default defineComponent({
  name: 'Register',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const isLoading = ref(false);
    const registerError = ref('');

    const formData = reactive<RegisterRequest>({
      userName: '',
      name: '',
      email: '',
      phone: '',
      password: ''
    });

    const validateForm = () => {
      if (!formData.userName.trim()) {
        registerError.value = '用户名不能为空';
        return false;
      }
      if (!formData.name.trim()) {
        registerError.value = '姓名不能为空';
        return false;
      }
      if (!formData.email.trim()) {
        registerError.value = '邮箱不能为空';
        return false;
      }
      if (!formData.phone.trim()) {
        registerError.value = '手机号不能为空';
        return false;
      }
      if (!formData.password.trim()) {
        registerError.value = '密码不能为空';
        return false;
      }
      if (formData.password.length < 6) {
        registerError.value = '密码长度不能少于6位';
        return false;
      }
      return true;
    };

    const handleRegister = async () => {
      registerError.value = '';
      if (!validateForm()) return;
      
      isLoading.value = true;
      try {
        const result = await userStore.register(formData);
        if (result.success) {
          // 注册成功，跳转到登录页面
          router.push('/login');
        } else {
          registerError.value = result.error || '注册失败，请稍后再试';
        }
      } catch (error: any) {
        registerError.value = error.message || '注册过程中发生错误';
      } finally {
        isLoading.value = false;
      }
    };

    return { 
      formData, 
      handleRegister, 
      isLoading, 
      registerError 
    };
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

.register-container {
  flex: 1;
  max-width: 420px;
  background: #ffffff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.register-container h1 {
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

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  border-left: 4px solid #ef4444;
}

button:disabled {
  background: linear-gradient(to right, #93c5fd, #60a5fa);
  cursor: not-allowed;
}
</style>