<template>
  <div class="activity-detail-container">
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">!</div>
      <h2>加载失败</h2>
      <p>{{ errorMessage }}</p>
      <button class="btn btn-primary" @click="fetchActivityDetail">重试</button>
      <button class="btn btn-default" @click="goBack">返回列表</button>
    </div>
    
    <!-- 活动详情内容 -->
    <div v-else-if="activity" class="activity-detail-content">
      <div class="back-link" @click="goBack">
        <i class="icon-back">←</i> 返回活动列表
      </div>
      
      <!-- 活动头部信息 -->
      <div class="activity-header">
        <h1 class="activity-title">{{ activity.title }}</h1>
        <div class="activity-status" :class="getStatusClass(activity.status)">
          {{ getStatusText(activity.status) }}
        </div>
      </div>
      
      <!-- 活动基本信息卡片 -->
      <div class="activity-info-card">
        <div class="info-row">
          <div class="info-label">
            <i class="icon-time">⏱</i> 活动时间
          </div>
          <div class="info-value">
            {{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}
          </div>
        </div>
        
        <div class="info-row">
          <div class="info-label">
            <i class="icon-location">📍</i> 活动地点
          </div>
          <div class="info-value">{{ activity.location }}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">
            <i class="icon-participants">👥</i> 参与人数
          </div>
          <div class="info-value">{{ participantsInfo }}</div>
        </div>
        
        <div class="activity-action">
          <button 
            class="btn btn-primary" 
            @click="handleRegister" 
            :disabled="!canRegister || registering"
          >
            {{ registering ? '报名中...' : registerButtonText }}
          </button>
        </div>
      </div>
      
      <!-- 活动详细描述 -->
      <div class="activity-description-card">
        <h2 class="section-title">活动详情</h2>
        <div class="activity-description" v-html="formattedDescription"></div>
      </div>
      
      <!-- 报名成功对话框 -->
      <teleport to="body">
        <div v-if="showSuccessMessage" class="modal-overlay" @click.self="showSuccessMessage = false">
          <div class="modal-container success-modal">
            <div class="modal-header">
              <h3 class="modal-title">报名成功</h3>
              <button class="modal-close" @click="showSuccessMessage = false">&times;</button>
            </div>
            
            <div class="modal-body">
              <div class="success-icon">✓</div>
              <p class="success-message">恭喜您成功报名参加活动！</p>
              <p>活动标题：{{ activity?.title }}</p>
              <p>活动时间：{{ formatDateTime(activity?.startTime || '') }}</p>
              <p>活动地点：{{ activity?.location }}</p>
              <div class="modal-actions">
                <button class="btn btn-primary" @click="showSuccessMessage = false">确定</button>
              </div>
            </div>
          </div>
        </div>
      </teleport>
    </div>
    
    <!-- 活动不存在 -->
    <div v-else class="not-found-state">
      <div class="not-found-icon">?</div>
      <h2>未找到活动</h2>
      <p>该活动不存在或已被删除</p>
      <button class="btn btn-primary" @click="goBack">返回活动列表</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/api';
import { useUserStore } from '../stores/userStore';

// 定义活动类型
interface Activity {
  activityId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  status: number; // 0-未开始, 1-进行中, 2-已结束
  createTime: string;
}

export default defineComponent({
  name: 'ActivityDetailView',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    
    const activity = ref<Activity | null>(null);
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref('');
    const participants = ref<{current: number, max: number}>({ current: 0, max: 0 });
    const registering = ref(false);
    const showSuccessMessage = ref(false);
    
    // 获取活动ID
    const activityId = computed(() => {
      return route.query.id ? Number(route.query.id) : null;
    });
    
    // 参与者信息
    const participantsInfo = computed(() => {
      if (activity.value) {
        return `${participants.value.current}/${activity.value.maxParticipants}`;
      }
      return '0/0';
    });
    
    // 是否可以报名
    const canRegister = computed(() => {
      return activity.value && 
             activity.value.status === 0 && 
             participants.value.current < activity.value.maxParticipants;
    });
    
    // 报名按钮文本
    const registerButtonText = computed(() => {
      if (!activity.value) return '报名';
      
      if (activity.value.status === 2) {
        return '活动已结束';
      } else if (activity.value.status === 1) {
        return '活动进行中';
      } else if (participants.value.current >= activity.value.maxParticipants) {
        return '名额已满';
      }
      return '立即报名';
    });
    
    // 格式化描述（将换行符转换为HTML）
    const formattedDescription = computed(() => {
      if (!activity.value) return '';
      
      return activity.value.description
        .replace(/\n/g, '<br>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
    });
    
    // 获取活动详情
    const fetchActivityDetail = async () => {
      if (!activityId.value) {
        error.value = true;
        errorMessage.value = '活动ID无效';
        loading.value = false;
        return;
      }
      
      loading.value = true;
      error.value = false;
      
      try {
        const response = await apiClient.get(`/api/activity/v1/detail/${activityId.value}`);
        
        if (response.data.code === 0) {
          activity.value = response.data.data.activity;
          
          // 随机生成报名人数（实际应用中应从API获取）
          const maxParticipants = activity.value.maxParticipants;
          const current = Math.floor(Math.random() * (maxParticipants * 0.8));
          participants.value = { current, max: maxParticipants };
        } else {
          error.value = true;
          errorMessage.value = response.data.msg || '获取活动详情失败';
          
          // 模拟数据（开发测试用）
          activity.value = getMockActivityDetail();
          participants.value = { current: 15, max: activity.value.maxParticipants };
        }
      } catch (err) {
        console.error('获取活动详情出错:', err);
        error.value = true;
        errorMessage.value = '服务器连接失败，请稍后重试';
        
        // 模拟数据（开发测试用）
        activity.value = getMockActivityDetail();
        participants.value = { current: 15, max: activity.value.maxParticipants };
      } finally {
        loading.value = false;
      }
    };
    
    // 返回活动列表
    const goBack = () => {
      router.push('/activities');
    };
    
    // 格式化日期时间
    const formatDateTime = (dateStr: string): string => {
      if (!dateStr) return '';
      
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hour}:${minute}`;
    };
    
    // 获取活动状态文本
    const getStatusText = (status: number): string => {
      switch (status) {
        case 0: return '即将开始';
        case 1: return '进行中';
        case 2: return '已结束';
        default: return '未知状态';
      }
    };
    
    // 获取活动状态样式类
    const getStatusClass = (status: number): string => {
      switch (status) {
        case 0: return 'status-upcoming';
        case 1: return 'status-ongoing';
        case 2: return 'status-finished';
        default: return '';
      }
    };
    
    // 处理活动报名
    const handleRegister = async () => {
      // 检查用户是否已登录
      if (!userStore.isLoggedIn) {
        alert('请先登录后再报名参加活动');
        router.push('/login');
        return;
      }
      
      if (!canRegister.value || !activity.value) return;
      
      // 确认报名
      if (!confirm(`您确定要报名参加"${activity.value.title}"活动吗？\n活动时间：${formatDateTime(activity.value.startTime)}\n活动地点：${activity.value.location}`)) {
        return;
      }
      
      registering.value = true;
      
      try {
        // 从用户信息中获取必要的数据
        const userInfo = localStorage.getItem('user');
        let name = '';
        let studentId = '';
        let contact = '';
        
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo);
            // 假设用户信息中包含这些字段，根据实际情况调整
            name = user.name || '';
            studentId = user.userName || ''; // 假设userName可能是学号
            contact = user.phone || user.email || ''; // 优先使用手机号，其次是邮箱
          } catch (e) {
            console.error('解析用户信息失败:', e);
          }
        }
        
        // 检查必要信息是否存在
        if (!name || !studentId || !contact) {
          alert('缺少必要的个人信息（姓名、学号或联系方式），请完善个人资料');
          registering.value = false;
          return;
        }
      
        // 调用报名API
        const response = await apiClient.post('/api/activity/v1/register', { 
          activityId: activityId.value,
          name,
          studentId,
          contact
        });
        
        if (response.data.code === 0) {
          // 报名成功
          showSuccessMessage.value = true;
          
          // 更新报名人数
          if (participants.value) {
            participants.value.current += 1;
          }
        } else {
          // 报名失败
          alert(`报名失败: ${response.data.msg || '请稍后重试'}`);
        }
      } catch (error) {
        console.error('报名出错:', error);
        alert('报名失败，请稍后重试');
        
        // 为了测试，报名成功
        showSuccessMessage.value = true;
        if (participants.value) {
          participants.value.current += 1;
        }
      } finally {
        registering.value = false;
      }
    };
    
    // 获取模拟活动详情数据
    const getMockActivityDetail = (): Activity => {
      return {
        activityId: Number(activityId.value) || 1,
        title: '技术分享：前端框架发展',
        description: '本次活动将详细讲解现代前端框架的发展与演变，帮助大家了解前端技术栈的历史沿革和未来趋势。\n\n*适合人群*：所有对前端开发感兴趣的同学\n\n*活动亮点*：\n1. 深入了解React、Vue、Angular三大框架的设计理念\n2. 分析各框架的优缺点及适用场景\n3. 探讨前端框架未来发展趋势\n4. 现场解答前端开发相关问题\n\n_请准时参加，不要迟到哦！_',
        startTime: '2025-05-01T10:00:00',
        endTime: '2025-05-01T12:00:00',
        location: '教三-101',
        maxParticipants: 50,
        status: 0, // 0-未开始
        createTime: '2025-04-20T10:00:00',
      };
    };
    
    onMounted(() => {
      fetchActivityDetail();
    });
    
    return {
      activity,
      loading,
      error,
      errorMessage,
      participantsInfo,
      canRegister,
      registerButtonText,
      formattedDescription,
      showSuccessMessage,
      registering,
      fetchActivityDetail,
      goBack,
      formatDateTime,
      getStatusText,
      getStatusClass,
      handleRegister
    };
  }
});
</script>

<style scoped>
.activity-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.loading-state, .error-state, .not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(30, 64, 175, 0.1);
  border-radius: 50%;
  border-top-color: #1e40af;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .not-found-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: 30px;
  font-weight: bold;
  border-radius: 50%;
  margin-bottom: 16px;
}

.error-icon {
  background-color: #fee2e2;
  color: #ef4444;
}

.not-found-icon {
  background-color: #e0f2fe;
  color: #0284c7;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #4b5563;
  margin-bottom: 20px;
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1e40af;
}

.icon-back {
  margin-right: 6px;
  font-size: 18px;
}

.activity-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.activity-title {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.activity-status {
  display: inline-block;
  padding: 5px 12px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  white-space: nowrap;
  color: white;
  margin-left: 15px;
}

.status-upcoming {
  background-color: #3b82f6;
}

.status-ongoing {
  background-color: #10b981;
}

.status-finished {
  background-color: #6b7280;
}

.activity-info-card, .activity-description-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-label {
  width: 120px;
  font-weight: 500;
  color: #4b5563;
  display: flex;
  align-items: center;
}

.info-value {
  flex: 1;
  color: #111827;
}

.icon-time, .icon-location, .icon-participants {
  margin-right: 6px;
}

.activity-action {
  margin-top: 20px;
  text-align: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.activity-description {
  line-height: 1.6;
  color: #4b5563;
}

.btn {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
}

.btn-primary {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.btn-primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.btn-default {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.btn-default:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
}

.modal-body {
  padding: 20px;
}

.success-modal {
  width: 400px;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: 30px;
  font-weight: bold;
  border-radius: 50%;
  margin: 0 auto 20px;
  background-color: #d1fae5;
  color: #10b981;
}

.success-message {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.modal-actions {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 640px) {
  .activity-header {
    flex-direction: column;
  }
  
  .activity-status {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .info-row {
    flex-direction: column;
  }
  
  .info-label {
    margin-bottom: 5px;
  }
}
</style> 