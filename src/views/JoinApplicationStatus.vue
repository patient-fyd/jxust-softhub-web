<template>
  <div class="application-status-container">
    <h1 class="page-title">申请状态查询</h1>
    <p class="page-subtitle">查询你的入会申请进度</p>
    
    <div class="status-content">
      <div v-if="!isLoggedIn" class="login-notice">
        <p>请先登录后查看你的申请状态</p>
        <router-link to="/login?redirect=/join/application-status" class="btn-primary">
          前往登录
        </router-link>
      </div>
      
      <div v-else-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中，请稍候...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchApplications" class="btn-primary">重试</button>
      </div>
      
      <div v-else-if="applications.length === 0" class="no-records">
        <div class="icon-info">i</div>
        <h3>暂无申请记录</h3>
        <p>你还没有提交过入会申请</p>
        <router-link to="/join" class="btn-primary">前往申请</router-link>
      </div>
      
      <div v-else class="application-list">
        <div
          v-for="application in applications"
          :key="application.applicationId"
          class="application-card"
          :class="getStatusClass(application.status)"
        >
          <div class="application-header">
            <h3>申请ID: {{ application.applicationId }}</h3>
            <span class="application-status">{{ getStatusText(application.status) }}</span>
          </div>
          
          <div class="application-info">
            <div class="info-item">
              <span class="info-label">申请人：</span>
              <span>{{ application.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span>{{ application.studentId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">期望部门：</span>
              <span>{{ application.expectDepartment }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">提交时间：</span>
              <span>{{ formatDate(application.createTime) }}</span>
            </div>
            
            <div v-if="application.status !== 0" class="review-info">
              <div class="info-item">
                <span class="info-label">审核人：</span>
                <span>{{ application.reviewerName || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">审核意见：</span>
                <span>{{ application.reviewComment || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">审核时间：</span>
                <span>{{ formatDate(application.updateTime) }}</span>
              </div>
            </div>
          </div>
          
          <button @click="showApplicationDetail(application.applicationId)" class="btn-secondary">
            查看详情
          </button>
        </div>
      </div>
      
      <!-- 申请详情弹窗 -->
      <div v-if="showDetailModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>申请详情</h3>
            <button @click="closeModal" class="btn-close">&times;</button>
          </div>
          
          <div v-if="isDetailLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中，请稍候...</p>
          </div>
          
          <div v-else-if="detailError" class="error-message">
            <p>{{ detailError }}</p>
          </div>
          
          <div v-else-if="applicationDetail" class="modal-body">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">申请ID：</span>
                  <span>{{ applicationDetail.applicationId }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">状态：</span>
                  <span :class="getStatusClass(applicationDetail.status)">
                    {{ getStatusText(applicationDetail.status) }}
                  </span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">姓名：</span>
                  <span>{{ applicationDetail.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">学号：</span>
                  <span>{{ applicationDetail.studentId }}</span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">年级：</span>
                  <span>{{ applicationDetail.grade }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">学院：</span>
                  <span>{{ applicationDetail.college }}</span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">专业：</span>
                  <span>{{ applicationDetail.major }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">期望部门：</span>
                  <span>{{ applicationDetail.expectDepartment }}</span>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">联系电话：</span>
                  <span>{{ applicationDetail.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">电子邮箱：</span>
                  <span>{{ applicationDetail.email }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>个人技能</h4>
              <p class="detail-text">{{ applicationDetail.skills }}</p>
            </div>
            
            <div class="detail-section">
              <h4>申请理由</h4>
              <p class="detail-text">{{ applicationDetail.reason }}</p>
            </div>
            
            <div v-if="applicationDetail.status !== 0" class="detail-section">
              <h4>审核信息</h4>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">审核人：</span>
                  <span>{{ applicationDetail.reviewerName || '未知' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">审核时间：</span>
                  <span>{{ formatDate(applicationDetail.updateTime) }}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>审核意见</h4>
                <p class="detail-text">{{ applicationDetail.reviewComment || '无' }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModal" class="btn-primary">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { getJoinApplicationList, getJoinApplicationDetail } from '../services/joinService';
import { JoinApplicationDetail } from '../types/join';

export default defineComponent({
  name: 'JoinApplicationStatus',
  setup() {
    const isLoggedIn = computed(() => !!localStorage.getItem('token'));
    const isLoading = ref(false);
    const error = ref('');
    const applications = ref<JoinApplicationDetail[]>([]);
    
    const showDetailModal = ref(false);
    const isDetailLoading = ref(false);
    const detailError = ref('');
    const applicationDetail = ref<JoinApplicationDetail | null>(null);
    
    const fetchApplications = async () => {
      if (!isLoggedIn.value) return;
      
      try {
        isLoading.value = true;
        error.value = '';
        
        const response = await getJoinApplicationList({});
        
        if (response.code === 0) {
          applications.value = response.data.list;
        } else {
          error.value = response.msg || '获取申请列表失败';
        }
      } catch (err) {
        console.error('获取申请列表出错：', err);
        error.value = '获取申请列表失败，请稍后重试';
      } finally {
        isLoading.value = false;
      }
    };
    
    const showApplicationDetail = async (applicationId: number) => {
      try {
        showDetailModal.value = true;
        isDetailLoading.value = true;
        detailError.value = '';
        
        const response = await getJoinApplicationDetail(applicationId);
        
        if (response.code === 0) {
          applicationDetail.value = response.data;
        } else {
          detailError.value = response.msg || '获取申请详情失败';
        }
      } catch (err) {
        console.error('获取申请详情出错：', err);
        detailError.value = '获取申请详情失败，请稍后重试';
      } finally {
        isDetailLoading.value = false;
      }
    };
    
    const closeModal = () => {
      showDetailModal.value = false;
      applicationDetail.value = null;
    };
    
    const getStatusText = (status: number) => {
      switch (status) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已拒绝';
        default: return '未知状态';
      }
    };
    
    const getStatusClass = (status: number) => {
      switch (status) {
        case 0: return 'status-pending';
        case 1: return 'status-approved';
        case 2: return 'status-rejected';
        default: return '';
      }
    };
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '未知';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    onMounted(() => {
      if (isLoggedIn.value) {
        fetchApplications();
      }
    });
    
    return {
      isLoggedIn,
      isLoading,
      error,
      applications,
      showDetailModal,
      isDetailLoading,
      detailError,
      applicationDetail,
      fetchApplications,
      showApplicationDetail,
      closeModal,
      getStatusText,
      getStatusClass,
      formatDate
    };
  }
});
</script>

<style scoped>
.application-status-container {
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

.status-content {
  background-color: #f9fafb;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #1e40af;
  color: white;
}

.btn-primary:hover {
  background-color: #1e3a8a;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #4b5563;
  padding: 8px 16px;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.login-notice, .loading, .error-message, .no-records {
  text-align: center;
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1e40af;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon-info {
  width: 60px;
  height: 60px;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.application-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #9ca3af;
}

.application-card.status-pending {
  border-left-color: #f59e0b;
}

.application-card.status-approved {
  border-left-color: #10b981;
}

.application-card.status-rejected {
  border-left-color: #ef4444;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.application-header h3 {
  margin: 0;
  color: #1f2937;
}

.application-status {
  font-weight: 500;
}

.status-pending {
  color: #f59e0b;
}

.status-approved {
  color: #10b981;
}

.status-rejected {
  color: #ef4444;
}

.application-info {
  margin-bottom: 20px;
}

.info-item, .detail-item {
  margin-bottom: 10px;
  display: flex;
}

.info-label, .detail-label {
  color: #6b7280;
  width: 100px;
  flex-shrink: 0;
}

.review-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e5e7eb;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background-color: white;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  color: #1f2937;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-item {
  flex: 1;
  min-width: 250px;
}

.detail-text {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .application-status-container {
    padding: 20px 15px;
  }
  
  .status-content {
    padding: 30px 20px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .application-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .info-label, .detail-label {
    width: 90px;
  }
}
</style> 