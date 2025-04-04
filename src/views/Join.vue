<template>
  <div class="join-container">
    <h1 class="page-title">加入我们</h1>
    <p class="page-subtitle">成为软件协会的一员，开启你的技术之旅</p>
    
    <div class="join-content">
      <div v-if="successMessage" class="success-message">
        <div class="icon-check">✓</div>
        <h3>申请提交成功！</h3>
        <p>{{ successMessage }}</p>
        <button @click="resetForm" class="btn-primary">再次申请</button>
      </div>
      
      <form v-else @submit.prevent="submitApplication" class="join-form">
        <div class="form-group">
          <label for="name">姓名 <span class="required">*</span></label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            placeholder="请输入你的姓名"
          />
        </div>
        
        <div class="form-group">
          <label for="studentId">学号 <span class="required">*</span></label>
          <input 
            type="text" 
            id="studentId" 
            v-model="formData.studentId" 
            required
            placeholder="请输入你的学号"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="grade">年级 <span class="required">*</span></label>
            <select id="grade" v-model="formData.grade" required>
              <option value="" disabled selected>请选择年级</option>
              <option v-for="grade in gradeOptions" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="college">学院 <span class="required">*</span></label>
            <select id="college" v-model="formData.college" required>
              <option value="" disabled selected>请选择学院</option>
              <option v-for="college in collegeOptions" :key="college" :value="college">
                {{ college }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="major">专业 <span class="required">*</span></label>
          <input 
            type="text" 
            id="major" 
            v-model="formData.major" 
            required
            placeholder="请输入你的专业"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="phone">联系电话 <span class="required">*</span></label>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone" 
              required
              placeholder="请输入你的联系电话"
              pattern="^1[3-9]\d{9}$"
              title="请输入正确格式的手机号码"
            />
          </div>
          
          <div class="form-group">
            <label for="email">电子邮箱 <span class="required">*</span></label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required
              placeholder="请输入你的电子邮箱"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="expectDepartment">期望加入的部门 <span class="required">*</span></label>
          <select id="expectDepartment" v-model="formData.expectDepartment" required>
            <option value="" disabled selected>请选择期望加入的部门</option>
            <option v-for="dept in departmentOptions" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="skills">个人技能 <span class="required">*</span></label>
          <textarea 
            id="skills" 
            v-model="formData.skills" 
            required
            placeholder="请描述你的个人技能，如编程语言、设计技能、沟通能力等"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="reason">申请理由 <span class="required">*</span></label>
          <textarea 
            id="reason" 
            v-model="formData.reason" 
            required
            placeholder="请说明你为什么想加入软件协会，以及你的期望"
            rows="5"
          ></textarea>
        </div>
        
        <div class="form-notice">
          <p>注：带 <span class="required">*</span> 的为必填项</p>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交申请' }}
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">重置</button>
        </div>
      </form>
      
      <div class="check-status-link">
        <p>已经提交申请？<router-link to="/join/application-status">查看申请状态</router-link></p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { submitJoinApplication } from '../services/joinService';
import { JoinApplicationForm } from '../types/join';
import { collegeOptions, departmentOptions, gradeOptions } from '../types/join';

export default defineComponent({
  name: 'JoinView',
  setup() {
    const initialFormState: JoinApplicationForm = {
      name: '',
      studentId: '',
      grade: '',
      college: '',
      major: '',
      phone: '',
      email: '',
      reason: '',
      skills: '',
      expectDepartment: ''
    };
    
    const formData = reactive<JoinApplicationForm>({...initialFormState});
    const isSubmitting = ref(false);
    const successMessage = ref('');
    
    const submitApplication = async () => {
      try {
        isSubmitting.value = true;
        const response = await submitJoinApplication(formData);
        
        if (response.code === 0) {
          successMessage.value = `申请已成功提交，你的申请ID为：${response.data.applicationId}。我们将尽快处理你的申请，请关注站内通知或邮件提醒。`;
        } else {
          alert(`提交失败：${response.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('提交申请出错：', error);
        alert('提交失败，请稍后重试或联系管理员');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const resetForm = () => {
      Object.assign(formData, initialFormState);
      successMessage.value = '';
    };
    
    return {
      formData,
      isSubmitting,
      successMessage,
      submitApplication,
      resetForm,
      collegeOptions,
      departmentOptions,
      gradeOptions
    };
  }
});
</script>

<style scoped>
.join-container {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 2rem;
  text-align: center;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 40px;
  text-align: center;
}

.join-content {
  background-color: #f9fafb;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

input, select, textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.required {
  color: #dc2626;
}

.form-notice {
  color: #6b7280;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #1e40af;
  color: white;
}

.btn-primary:hover {
  background-color: #1e3a8a;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.success-message {
  text-align: center;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-check {
  width: 60px;
  height: 60px;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
}

.success-message h3 {
  font-size: 1.5rem;
  color: #10b981;
  margin: 10px 0;
}

.check-status-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.check-status-link a {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
}

.check-status-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .join-content {
    padding: 30px 20px;
  }
  
  .join-container {
    padding: 20px 15px;
  }
}
</style> 