import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { checkUserApplicationStatus } from '../services/joinService';
import { useUserStore } from './userStore';

export const useJoinStore = defineStore('join', () => {
  const userStore = useUserStore();
  
  // 申请状态
  const applicationStatus = ref<{
    hasApplied: boolean;
    applicationId?: number;
    status?: number;
    statusText?: string;
    error?: string;
  } | null>(null);
  
  const loading = ref(false);
  
  // 计算属性：用户是否已是会员
  const isMember = computed(() => {
    return userStore.currentUser && userStore.currentUser.roleId >= 5; // roleId >= 5 表示已是会员
  });
  
  // 计算属性：用户是否已提交申请
  const hasApplied = computed(() => {
    return applicationStatus.value && applicationStatus.value.hasApplied;
  });
  
  // 计算属性：申请是否已通过
  const isApproved = computed(() => {
    return applicationStatus.value && applicationStatus.value.status === 1;
  });
  
  // 计算属性：申请是否被拒绝
  const isRejected = computed(() => {
    return applicationStatus.value && applicationStatus.value.status === 2;
  });
  
  // 计算属性：申请是否待审核
  const isPending = computed(() => {
    return applicationStatus.value && applicationStatus.value.status === 0;
  });
  
  // 检查用户的申请状态
  const fetchApplicationStatus = async () => {
    // 用户未登录，直接返回
    if (!userStore.currentUser) {
      applicationStatus.value = null;
      return;
    }
    
    loading.value = true;
    try {
      const result = await checkUserApplicationStatus();
      applicationStatus.value = result;
    } catch (error) {
      console.error('获取申请状态失败:', error);
      applicationStatus.value = {
        hasApplied: false,
        error: '获取申请状态失败'
      };
    } finally {
      loading.value = false;
    }
  };
  
  // 重置状态
  const reset = () => {
    applicationStatus.value = null;
  };
  
  return {
    applicationStatus,
    loading,
    isMember,
    hasApplied,
    isApproved,
    isRejected,
    isPending,
    fetchApplicationStatus,
    reset
  };
}); 