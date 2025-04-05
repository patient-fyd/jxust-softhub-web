<template>
  <div class="moment-card">
    <div class="moment-header">
      <div class="user-info">
        <div class="avatar">
          <img :src="moment.userAvatar || '/default-avatar.png'" alt="用户头像">
        </div>
        <div class="user-meta">
          <div class="username">{{ moment.userName }}</div>
          <div class="post-time">{{ formatTime(moment.createTime) }}</div>
        </div>
      </div>
      
      <div v-if="isCurrentUser" class="moment-actions">
        <button @click="deleteMomentHandler" class="action-button delete-button">
          <span>删除</span>
        </button>
      </div>
    </div>
    
    <div class="moment-content">
      <p>{{ moment.content }}</p>
    </div>
    
    <div class="moment-footer">
      <button 
        @click="toggleLikeHandler" 
        class="action-button like-button"
        :class="{ 'liked': moment.isLiked }"
      >
        <span class="icon">{{ moment.isLiked ? '❤️' : '🤍' }}</span>
        <span>{{ moment.likesCount > 0 ? moment.likesCount : '点赞' }}</span>
      </button>
      
      <button @click="toggleComments" class="action-button comment-button">
        <span class="icon">💬</span>
        <span>{{ moment.commentsCount > 0 ? moment.commentsCount : '评论' }}</span>
      </button>
    </div>
    
    <!-- 评论区 -->
    <div v-if="showComments" class="comments-section">
      <div v-if="isLoadingComments" class="loading-comments">
        <div class="loading-spinner-small"></div>
        <span>加载评论中...</span>
      </div>
      
      <div v-else-if="commentsError" class="comments-error">
        <p>{{ commentsError }}</p>
        <button @click="fetchComments" class="btn-secondary-small">重试</button>
      </div>
      
      <div v-else-if="comments.length === 0" class="no-comments">
        <p>暂无评论，快来说点什么吧!</p>
      </div>
      
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">{{ comment.userName }}</div>
            <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
      
      <!-- 发表评论 -->
      <div v-if="isLoggedIn" class="comment-form">
        <textarea 
          v-model="commentContent" 
          placeholder="写下你的评论..." 
          class="comment-input"
          rows="2"
        ></textarea>
        <button 
          @click="submitComment" 
          :disabled="isSubmittingComment || !commentContent.trim()"
          class="btn-primary-small"
        >
          {{ isSubmittingComment ? '提交中...' : '提交' }}
        </button>
      </div>
      
      <div v-else class="login-to-comment">
        <p>请<router-link to="/login">登录</router-link>后发表评论</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { useUserStore } from '../../stores/userStore';
import { getMomentComments, createComment, deleteMoment } from '../../services/momentService';
import type { Moment, MomentComment } from '../../types/moment';

export default defineComponent({
  name: 'MomentCard',
  props: {
    moment: {
      type: Object as PropType<Moment>,
      required: true
    }
  },
  emits: ['like-toggled', 'moment-deleted'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const showComments = ref(false);
    const comments = ref<MomentComment[]>([]);
    const isLoadingComments = ref(false);
    const commentsError = ref('');
    const commentContent = ref('');
    const isSubmittingComment = ref(false);
    
    const isLoggedIn = computed(() => !!userStore.currentUser);
    const isCurrentUser = computed(() => 
      userStore.currentUser && userStore.currentUser.userId === props.moment.userId
    );
    
    const formatTime = (timeString: string) => {
      const date = new Date(timeString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 1分钟内
      if (diff < 60 * 1000) {
        return '刚刚';
      }
      
      // 1小时内
      if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      }
      
      // 24小时内
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      }
      
      // 30天内
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
      
      // 超过30天
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const toggleLikeHandler = () => {
      if (!isLoggedIn.value) {
        alert('请先登录再进行点赞');
        return;
      }
      
      emit('like-toggled', props.moment.momentId, props.moment.isLiked);
    };
    
    const toggleComments = async () => {
      showComments.value = !showComments.value;
      
      if (showComments.value && comments.value.length === 0) {
        await fetchComments();
      }
    };
    
    const fetchComments = async () => {
      isLoadingComments.value = true;
      commentsError.value = '';
      
      try {
        const response = await getMomentComments({
          momentId: props.moment.momentId,
          pageSize: 50  // 获取最多50条评论
        });
        
        if (response.code === 0) {
          comments.value = response.data.list;
        } else {
          commentsError.value = response.msg || '获取评论失败';
        }
      } catch (error) {
        console.error('获取评论失败:', error);
        commentsError.value = '获取评论失败，请稍后重试';
      } finally {
        isLoadingComments.value = false;
      }
    };
    
    const submitComment = async () => {
      if (!commentContent.value.trim() || isSubmittingComment.value) return;
      
      isSubmittingComment.value = true;
      
      try {
        const response = await createComment({
          momentId: props.moment.momentId,
          content: commentContent.value.trim()
        });
        
        if (response.code === 0) {
          // 清空评论内容
          commentContent.value = '';
          // 重新获取评论列表
          await fetchComments();
          // 更新评论数
          props.moment.commentsCount = (props.moment.commentsCount || 0) + 1;
        } else {
          alert(`评论失败：${response.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('提交评论失败:', error);
        alert('评论失败，请稍后重试');
      } finally {
        isSubmittingComment.value = false;
      }
    };
    
    const deleteMomentHandler = async () => {
      if (!confirm('确定要删除这条动态吗？')) {
        return;
      }
      
      try {
        const response = await deleteMoment(props.moment.momentId);
        
        if (response.code === 0) {
          emit('moment-deleted');
        } else {
          alert(`删除失败：${response.msg || '未知错误'}`);
        }
      } catch (error) {
        console.error('删除动态失败:', error);
        alert('删除失败，请稍后重试');
      }
    };
    
    return {
      isLoggedIn,
      isCurrentUser,
      showComments,
      comments,
      isLoadingComments,
      commentsError,
      commentContent,
      isSubmittingComment,
      formatTime,
      toggleLikeHandler,
      toggleComments,
      fetchComments,
      submitComment,
      deleteMomentHandler
    };
  }
});
</script>

<style scoped>
.moment-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.moment-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.moment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #1f2937;
}

.post-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.moment-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #f3f4f6;
}

.delete-button:hover {
  color: #ef4444;
}

.moment-content {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-line;
}

.moment-footer {
  display: flex;
  gap: 20px;
  border-top: 1px solid #f3f4f6;
  padding-top: 15px;
}

.like-button.liked {
  color: #ef4444;
}

.comments-section {
  margin-top: 20px;
  border-top: 1px solid #f3f4f6;
  padding-top: 15px;
}

.loading-comments, .comments-error, .no-comments {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 15px;
  color: #6b7280;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1e40af;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comments-list {
  margin-bottom: 15px;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-user {
  font-weight: 600;
  color: #111827;
}

.comment-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-content {
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.5;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.95rem;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.btn-primary-small, .btn-secondary-small {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  align-self: flex-end;
}

.btn-primary-small {
  background-color: #1e40af;
  color: white;
}

.btn-primary-small:hover:not(:disabled) {
  background-color: #1e3a8a;
}

.btn-primary-small:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary-small {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-secondary-small:hover {
  background-color: #d1d5db;
}

.login-to-comment {
  text-align: center;
  padding: 15px;
  color: #6b7280;
}

.login-to-comment a {
  color: #1e40af;
  text-decoration: none;
  font-weight: 500;
}

.login-to-comment a:hover {
  text-decoration: underline;
}
</style> 
.comment-input::placeholder {
  color: #9ca3af;
}

.action-button .icon {
  transition: transform 0.2s ease;
}

.action-button:hover .icon {
  transform: scale(1.1);
}