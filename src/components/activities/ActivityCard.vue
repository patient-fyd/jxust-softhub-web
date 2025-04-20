<template>
  <div class="activity-card" @click="handleCardClick">
    <div class="card-cover">
      <img :src="coverUrl" :alt="activity.title" class="cover-img" />
      <div class="card-status" :class="statusClass">{{ statusText }}</div>
    </div>
    <div class="card-content">
      <h3 class="card-title" :title="activity.title">{{ activity.title }}</h3>
      <p class="card-description" :title="activity.description">
        {{ shortDescription }}
      </p>
      <div class="card-meta">
        <div class="meta-item">
          <Icon icon="mdi:calendar" class="meta-icon" />
          <span>{{ formatDate(activity.startTime) }}</span>
        </div>
        <div class="meta-item">
          <Icon icon="mdi:map-marker" class="meta-icon" />
          <span>{{ activity.location }}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="meta-item">
          <Icon icon="mdi:account-group" class="meta-icon" />
          <span>{{ participantsCount }}/{{ activity.maxParticipants }}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-icon" @click.stop="handleView">
            <Icon icon="mdi:eye-outline" />
          </button>
          <button class="btn btn-primary" @click.stop="handleSignup" v-if="canSignup" :disabled="signupDisabled">
            {{ signupDisabled ? '处理中...' : '报名' }}
          </button>
          <button class="btn btn-disabled" disabled v-else>
            {{ signupButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import { Icon } from '@iconify/vue';

// 定义活动接口
export interface Activity {
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
  name: 'ActivityCard',
  
  components: {
    Icon
  },
  
  props: {
    activity: {
      type: Object as PropType<Activity>,
      required: true
    },
    signupDisabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['view', 'signup'],
  
  setup(props, { emit }) {
    // 描述截取
    const shortDescription = computed(() => {
      if (props.activity.description.length > 100) {
        return props.activity.description.substring(0, 100) + '...';
      }
      return props.activity.description;
    });
    
    // 随机生成参与人数（实际应用中应从接口获取）
    const participantsCount = computed(() => {
      // 根据活动ID生成一个固定的随机数
      const seed = props.activity.activityId * 13 % 30 + 5;
      return Math.min(seed, props.activity.maxParticipants);
    });
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 获取封面URL
    const coverUrl = computed(() => {
      // 生成封面图片
      return `https://picsum.photos/id/${props.activity.activityId + 100}/400/200`;
    });
    
    // 活动状态文本
    const statusText = computed(() => {
      switch (props.activity.status) {
        case 0:
          return '即将开始';
        case 1:
          return '进行中';
        case 2:
          return '已结束';
        default:
          return '未知状态';
      }
    });
    
    // 活动状态样式
    const statusClass = computed(() => {
      const statusMap: Record<number, string> = {
        0: 'status-upcoming',
        1: 'status-ongoing',
        2: 'status-finished'
      };
      return statusMap[props.activity.status] || 'status-unknown';
    });
    
    // 是否可以报名
    const canSignup = computed(() => {
      return props.activity.status === 0 && 
             participantsCount.value < props.activity.maxParticipants;
    });
    
    // 报名按钮文本
    const signupButtonText = computed(() => {
      if (props.activity.status === 2) {
        return '已结束';
      } else if (participantsCount.value >= props.activity.maxParticipants) {
        return '已满';
      } else {
        return '报名';
      }
    });
    
    // 查看活动详情
    const handleView = () => {
      emit('view', props.activity);
    };
    
    // 报名活动
    const handleSignup = () => {
      if (canSignup.value) {
        emit('signup', props.activity);
      }
    };
    
    // 卡片点击
    const handleCardClick = () => {
      handleView();
    };
    
    return {
      shortDescription,
      participantsCount,
      formatDate,
      coverUrl,
      statusText,
      statusClass,
      canSignup,
      signupButtonText,
      handleView,
      handleSignup,
      handleCardClick
    };
  }
});
</script>

<style scoped>
.activity-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card-cover {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.activity-card:hover .cover-img {
  transform: scale(1.05);
}

.card-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-upcoming {
  background-color: #409eff;
}

.status-ongoing {
  background-color: #67c23a;
}

.status-finished {
  background-color: #909399;
}

.status-unknown {
  background-color: #f56c6c;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 180px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-icon {
  margin-right: 4px;
  font-size: 14px;
  vertical-align: middle;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.btn-icon {
  background: none;
  border: none;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-icon:hover {
  color: #409eff;
  background-color: #f0f7ff;
}

.card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn {
  display: inline-block;
  line-height: 1;
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
  padding: 6px 10px;
  font-size: 12px;
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

.btn-disabled {
  color: #c0c4cc;
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  cursor: not-allowed;
}
</style> 