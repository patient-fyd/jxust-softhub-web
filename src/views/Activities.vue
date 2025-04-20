<template>
  <div class="activities-container">
    <h1 class="page-title">活动展示</h1>
    <p class="page-subtitle">了解我们最新的活动信息</p>
    
    <div class="activities-filters">
      <div class="filter-item">
        <select v-model="filter.status" class="filter-select" @change="handleFilterChange">
          <option value="-1">全部活动</option>
          <option value="0">即将开始</option>
          <option value="1">进行中</option>
          <option value="2">已结束</option>
        </select>
      </div>
    </div>
    
    <div class="activities-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 活动列表 -->
      <div v-else-if="displayActivities.length > 0" class="activities-grid">
        <ActivityCard
          v-for="activity in displayActivities"
          :key="activity.activityId"
          :activity="activity"
          @view="handleView"
          :signup-disabled="registering"
          @signup="handleSignup"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <p>暂无活动信息</p>
      </div>
      
      <!-- 分页器 -->
      <div v-if="filteredActivities.length > 0" class="pagination-wrapper">
        <Pagination 
          :total="totalCount" 
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          @change="handlePageChange"
          @sizeChange="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive } from 'vue';
import ActivityCard from '@/components/activities/ActivityCard.vue';
import Pagination from '@/components/common/Pagination.vue';
import { useRouter } from 'vue-router';
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
  status: number;
  createTime: string;
}

// 使用相对路径直接导入服务
import apiClient from '../services/api';

// 活动服务
const activityService = {
  // 获取活动列表
  getActivityList: async (params: {
    page?: number;
    size?: number;
    status?: number;
  }) => {
    try {
      const response = await apiClient.get('/api/activity/v1/list', { params });
      return response.data;
    } catch (error) {
      console.error('获取活动列表失败:', error);
      return {
        code: -1,
        msg: '获取活动列表失败',
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          size: params.size || 10
        }
      };
    }
  },
  
  // 活动报名
  registerActivity: async (activityId: number) => {
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
        return {
          code: -1,
          msg: '缺少必要的个人信息（姓名、学号或联系方式），请完善个人资料'
        };
      }
      
      // 调用API，提供所有必要的参数
      const response = await apiClient.post('/api/activity/v1/register', {
        activityId, // 后端需要的是activityId而不是activity_id
        name,
        studentId,
        contact
      });
      
      return response.data;
    } catch (error) {
      console.error('活动报名失败:', error);
      return {
        code: -1,
        msg: '活动报名失败，请稍后重试'
      };
    }
  }
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
const getActivityStatusText = (status: number): string => {
  switch (status) {
    case 0: return '未开始';
    case 1: return '进行中';
    case 2: return '已结束';
    default: return '未知状态';
  }
};

export default defineComponent({
  name: 'ActivitiesView',
  components: {
    ActivityCard,
    Pagination
  },
  setup() {
    const activities = ref<Activity[]>([]);
    const loading = ref(true);
    const totalCount = ref(0);
    const router = useRouter();
    const userStore = useUserStore();
    const registering = ref(false);
    
    // 筛选条件
    const filter = reactive({
      status: -1  // -1表示全部，0-未开始，1-进行中，2-已结束
    });
    
    // 分页相关
    const pagination = reactive({
      currentPage: 1,
      pageSize: 6  // 每页显示6个活动
    });

    // 根据筛选条件过滤后的活动列表
    const filteredActivities = computed(() => {
      if (filter.status === -1) {
        return activities.value;
      }
      return activities.value.filter((activity: Activity) => activity.status === filter.status);
    });
    
    // 当前页显示的活动
    const displayActivities = computed(() => {
      // 当使用服务器端分页时，直接返回当前页的数据
      return activities.value;
    });

    // 处理筛选条件变化
    const handleFilterChange = () => {
      pagination.currentPage = 1; // 重置为第一页
      fetchActivities();
    };
    
    // 处理页码变化
    const handlePageChange = (page: number) => {
      pagination.currentPage = page;
      fetchActivities();
    };
    
    // 处理每页条数变化
    const handleSizeChange = (size: number) => {
      pagination.pageSize = size;
      pagination.currentPage = 1; // 重置为第一页
      fetchActivities();
    };

    // 获取活动列表
    const fetchActivities = async () => {
      loading.value = true;
      try {
        // 构建API请求参数
        const params: {
          page: number;
          size: number;
          status?: number;
        } = {
          page: pagination.currentPage,
          size: pagination.pageSize
        };
        
        // 如果有状态筛选，添加到请求参数
        if (filter.status !== -1) {
          params.status = filter.status;
        }
        
        // 调用API获取活动列表
        const response = await activityService.getActivityList(params);
        
        if (response.code === 0) {
          activities.value = response.data.list;
          totalCount.value = response.data.total;
          
          // 更新分页信息，防止页码越界
          if (pagination.currentPage > Math.ceil(response.data.total / pagination.pageSize) && response.data.total > 0) {
            pagination.currentPage = 1;
            fetchActivities();
            return;
          }
        } else {
          console.error('获取活动列表失败:', response.msg);
          // 如果API调用失败，显示错误提示或使用模拟数据
          activities.value = getMockData();
          totalCount.value = activities.value.length;
        }
      } catch (error) {
        console.error('获取活动列表出错:', error);
        // 发生错误时，使用模拟数据
        activities.value = getMockData();
        totalCount.value = activities.value.length;
      } finally {
        loading.value = false;
      }
    };

    // 生成模拟数据，在API不可用时使用
    const getMockData = (): Activity[] => {
      return [
        {
          activityId: 1,
          title: '技术分享：前端框架发展',
          description: '本次分享将讲解现代前端框架的发展与演变，适合所有感兴趣的同学。',
          startTime: '2025-05-01T10:00:00',
          endTime: '2025-05-01T12:00:00',
          location: '教三-101',
          maxParticipants: 50,
          status: 0, // 0-未开始
          createTime: '2025-04-20T10:00:00',
        },
        {
          activityId: 2,
          title: '校园编程大赛',
          description: '欢迎所有编程爱好者参与，赢取丰厚奖品！',
          startTime: '2025-05-10T09:00:00',
          endTime: '2025-05-10T17:00:00',
          location: '综合楼-A区',
          maxParticipants: 50,
          status: 1, // 1-进行中
          createTime: '2025-04-15T14:30:00',
        },
        {
          activityId: 3,
          title: 'Web安全技术讲座',
          description: '本讲座将介绍常见的Web安全漏洞和防护措施，包括XSS、CSRF、SQL注入等。',
          startTime: '2025-04-20T14:30:00',
          endTime: '2025-04-20T16:30:00',
          location: '图书馆报告厅',
          maxParticipants: 100,
          status: 2, // 2-已结束
          createTime: '2025-04-01T10:00:00',
        },
      ];
    };

    const handleView = (activity: Activity) => {
      console.log('查看活动详情:', activity);
      // 跳转到活动详情页
      router.push(`/activity/detail?id=${activity.activityId}`);
    };

    const handleSignup = async (activity: Activity) => {
      console.log('报名活动:', activity);
      
      // 检查用户是否已登录
      if (!userStore.isLoggedIn) {
        alert('请先登录后再报名参加活动');
        router.push('/login');
        return;
      }
      
      // 检查活动状态
      if (activity.status !== 0) {
        if (activity.status === 1) {
          alert('该活动已经开始，无法报名');
        } else if (activity.status === 2) {
          alert('该活动已经结束，无法报名');
        }
        return;
      }
      
      // 弹窗确认报名信息
      if (confirm(`您确定要报名参加"${activity.title}"活动吗？\n活动时间：${formatDateTime(activity.startTime)}\n活动地点：${activity.location}`)) {
        
        registering.value = true;
        
        try {
          // 调用报名API
          const result = await activityService.registerActivity(activity.activityId);
          
          if (result.code === 0) {
            alert('报名成功！');
          } else {
            alert(`报名失败：${result.msg}`);
          }
        } catch (error) {
          console.error('报名出错:', error);
          alert('报名失败，请稍后重试');
        } finally {
          registering.value = false;
        }
      }
    };

    onMounted(() => {
      fetchActivities();
    });

    return {
      activities,
      filteredActivities,
      displayActivities,
      loading,
      totalCount,
      filter,
      pagination,
      handleFilterChange,
      handlePageChange,
      handleSizeChange,
      handleView,
      handleSignup,
      formatDateTime,
      getActivityStatusText,
      registering
    };
  }
});
</script>

<style scoped>
.activities-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.page-title {
  color: #1e40af;
  margin-bottom: 10px;
  font-size: 2rem;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 20px;
}

/* 筛选区域样式 */
.activities-filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 0 20px;
}

.filter-item {
  margin-left: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
  color: #606266;
  min-width: 120px;
  cursor: pointer;
  outline: none;
}

.activities-content {
  padding: 0 20px;
  min-height: 400px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 分页器样式 */
.pagination-wrapper {
  margin-top: 30px;
  margin-bottom: 20px;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 50px;
  color: #6b7280;
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

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  padding: 50px;
  border-radius: 8px;
  color: #4b5563;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .activities-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .activities-filters {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .activities-container {
    padding: 20px 15px;
  }
}
</style>