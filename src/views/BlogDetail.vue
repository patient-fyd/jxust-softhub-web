// @ts-nocheck
<template>
  <div class="blog-detail-container">
    <!-- 添加阅读进度条 -->
    <div class="reading-progress-container" v-if="blog">
      <div class="reading-progress-bar" :style="{ width: readingProgress + '%' }"></div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadBlogDetail" class="retry-btn">重试</button>
      <router-link to="/blog" class="back-btn">返回博客列表</router-link>
    </div>
    
    <template v-else-if="blog">
      <div class="back-nav">
        <router-link to="/blog" class="back-link">
          <i class="fas fa-arrow-left"></i> 返回博客列表
        </router-link>
      </div>
      
      <!-- 内容和侧边栏容器 -->
      <div class="content-with-sidebar">
        <article class="blog-content">
          <header>
            <div class="blog-category">{{ blog.category || '技术分享' }}</div>
            <h1>{{ blog.title }}</h1>
            <div class="blog-meta">
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(blog.createTime) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-eye"></i>
                <span>浏览: {{ blog.viewCount }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-thumbs-up"></i>
                <span>点赞: {{ blog.likeCount }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-comment"></i>
                <span>评论: {{ blog.commentCount || 0 }}</span>
              </div>
              <div v-if="blog.authorName" class="meta-item author-item">
                <i class="fas fa-user"></i>
                <span>{{ blog.authorName }}</span>
              </div>
            </div>
            
            <div v-if="blog.tags" class="blog-tags">
              <span v-for="tag in getTags(blog.tags)" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </header>
          
          <div v-if="blog.coverImage" class="cover-image">
            <img :src="blog.coverImage" :alt="blog.title" loading="lazy" />
          </div>
          
          <div class="article-content" v-html="formatContent(blog.content)"></div>
          
          <div class="article-footer">
            <div class="update-info">
              最后更新: {{ formatDate(blog.updateTime) }}
            </div>
            
            <div class="action-buttons">
              <button 
                class="like-button" 
                :class="{ liked: isLiked }"
                @click="toggleLike"
              >
                <i class="fas" :class="isLiked ? 'fa-thumbs-up' : 'fa-thumbs-o-up'"></i>
                点赞 ({{ blog.likeCount }})
              </button>
              
              <div class="share-buttons">
                <button class="share-btn" title="分享到微信">
                  <i class="fab fa-weixin"></i>
                </button>
                <button class="share-btn" title="分享到微博">
                  <i class="fab fa-weibo"></i>
                </button>
                <button class="share-btn" title="分享到QQ">
                  <i class="fab fa-qq"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
        
        <div class="content-sidebar">
          <div class="sidebar-section catalog" v-if="tocItems.length > 0">
            <div class="sidebar-title-container">
              <h3 class="sidebar-title">目录</h3>
              <span class="catalog-tip">点击跳转</span>
            </div>
            <div class="catalog-list">
              <template v-for="(item, index) in tocItems" :key="index">
                <div class="toc-item" :class="{ 'active': activeHeading === item.id, 'level-1': item.level === 1, 'level-2': item.level === 2, 'level-3': item.level === 3 }">
                  <a 
                    :href="'#' + item.id" 
                    @click.prevent="scrollToHeading(item.id)"
                  >{{ item.text }}</a>
                </div>
                <template v-if="item.children && item.children.length > 0">
                  <div 
                    v-for="(child, childIndex) in item.children" 
                    :key="`${index}-${childIndex}`"
                    class="toc-item" 
                    :class="{ 'active': activeHeading === child.id, 'level-1': child.level === 1, 'level-2': child.level === 2, 'level-3': child.level === 3 }"
                  >
                    <a 
                      :href="'#' + child.id" 
                      @click.prevent="scrollToHeading(child.id)"
                    >{{ child.text }}</a>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section">
        <h2>评论 ({{ comments.length }})</h2>
        
        <div class="comment-form">
          <div v-if="!isUserLoggedIn" class="login-prompt">
            <p>请先<router-link to="/login" class="login-link">登录</router-link>后发表评论</p>
          </div>
          <div v-else>
            <div class="user-info">
              <span class="avatar">{{ userStore.currentUser?.userName?.charAt(0) || '用户' }}</span>
              <span class="username">{{ userStore.currentUser?.userName || '用户' }}</span>
            </div>
            <textarea 
              v-model="commentContent" 
              placeholder="发表您的评论..." 
              rows="4"
              :disabled="!isUserLoggedIn"
            ></textarea>
            <div class="form-footer">
              <div class="comment-tips">
                <span>平等表达，友善交流</span>
              </div>
              <button 
                @click="submitComment" 
                :disabled="!commentContent.trim() || submittingComment || !isUserLoggedIn"
                class="submit-button"
              >
                <span v-if="submittingComment" class="spinner spinner-xs"></span>
                <span>{{ submittingComment ? '提交中...' : '发送' }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="loadingComments" class="loading-comments">
          <div class="spinner"></div>
          <p>加载评论中...</p>
        </div>
        
        <div v-else-if="commentsError" class="comments-error">
          <p>{{ commentsError }}</p>
          <button @click="loadComments" class="retry-btn">重试</button>
        </div>
        
        <div v-else-if="comments.length === 0" class="no-comments">
          <div class="empty-comments-icon">💬</div>
          <p>暂无评论，来发表第一条评论吧！</p>
        </div>
        
        <div v-else class="comments-list">
          <div class="comments-sort">
            <span 
              class="sort-label" 
              :class="{ active: sortMode === 'hot' }"
              @click="changeSortMode('hot')"
            >最热</span>
            <span 
              class="sort-label" 
              :class="{ active: sortMode === 'new' }"
              @click="changeSortMode('new')"
            >最新</span>
          </div>
          
          <transition-group name="comment-fade" tag="div" class="comments-container">
            <div v-for="comment in sortedComments" :key="comment.commentId" class="comment-item">
              <div class="comment-header">
                <div class="comment-author-info">
                  <span class="comment-avatar">{{ (comment.userName || comment.authorName)?.charAt(0) || '用户' }}</span>
                  <span class="comment-author">{{ comment.userName || comment.authorName }}</span>
                </div>
                <span class="comment-date">{{ formatDate(comment.createTime) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <button @click="replyToComment(comment)" class="action-button reply-button">
                  <i class="reply-icon fas fa-reply"></i> 回复
                </button>
                <button 
                  @click="likeComment(comment)" 
                  class="action-button like-button" 
                  :class="{ 'liked': (comment as any).isLiked }"
                >
                  <i class="like-icon fas" :class="(comment as any).isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
                  <span>{{ (comment as any).likes || 0 }}</span>
                </button>
              </div>
              
              <!-- 回复输入框 -->
              <div v-if="replyingToComment && replyingToComment.commentId === comment.commentId" class="reply-form">
                <textarea 
                  v-model="replyContent" 
                  placeholder="回复评论..." 
                  rows="2"
                ></textarea>
                <div class="reply-form-actions">
                  <button @click="cancelReply" class="cancel-reply-button">取消</button>
                  <button 
                    @click="submitReply(comment)" 
                    :disabled="!replyContent.trim() || submittingReply"
                    class="submit-reply-button"
                  >
                    <span v-if="submittingReply" class="spinner spinner-xs"></span>
                    <span>{{ submittingReply ? '提交中...' : '回复' }}</span>
                  </button>
                </div>
              </div>
              
              <!-- 嵌套回复 -->
              <div v-if="comment.children && comment.children.length > 0" class="comment-replies">
                <div v-for="reply in comment.children" :key="reply.commentId" class="reply-item">
                  <div class="comment-header">
                    <div class="comment-author-info">
                      <span class="comment-avatar">{{ (reply.userName || reply.authorName)?.charAt(0) || '用户' }}</span>
                      <span class="comment-author">{{ reply.userName || reply.authorName }}</span>
                    </div>
                    <span class="comment-date">{{ formatDate(reply.createTime) }}</span>
                  </div>
                  <div class="comment-content">{{ reply.content }}</div>
                  <div class="comment-actions">
                    <button 
                      @click="likeComment(reply)" 
                      class="action-button like-button" 
                      :class="{ 'liked': (reply as any).isLiked }"
                    >
                      <i class="like-icon fas" :class="(reply as any).isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
                      <span>{{ (reply as any).likes || 0 }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
          
          <div v-if="commentsHasMore" class="load-more-comments">
            <button 
              @click="loadMoreComments" 
              :disabled="loadingMoreComments" 
              class="load-more-button"
            >
              <span v-if="loadingMoreComments" class="spinner spinner-xs"></span>
              <span>{{ loadingMoreComments ? '加载中...' : `查看更多评论 (${totalCommentsCount})` }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="not-found">
      <h2>未找到博客</h2>
      <p>抱歉，没有找到该博客或已被删除</p>
      <router-link to="/blog" class="back-btn">返回博客列表</router-link>
    </div>
    
    <!-- 回到顶部按钮 -->
    <div v-if="showBackToTop" @click="scrollToTop" class="back-to-top">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="back-to-top-icon">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
      </svg>
    </div>
  </div>
</template> 

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { blogService, type Blog, type BlogComment } from '../services/blogService';
import { useUserStore } from '../stores/userStore';

// 导入Markdown-it和插件
import MarkdownIt from 'markdown-it';
import MarkdownItPrism from 'markdown-it-prism';

// 导入Prism样式
import 'prismjs/themes/prism.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/toolbar/prism-toolbar.css';

// 扩展评论类型
interface ExtendedComment extends BlogComment {
  isLiked?: boolean;
  likes?: number;
}

export default defineComponent({
  name: 'BlogDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    
    // 状态管理
    const blog = ref<Blog | null>(null);
    const comments = ref<BlogComment[]>([]);
    const loading = ref(true);
    const error = ref('');
    const loadingComments = ref(false);
    const commentsError = ref('');
    const commentContent = ref('');
    const submittingComment = ref(false);
    const isLiked = ref(false);
    const replyingToComment = ref<BlogComment | null>(null);
    const replyContent = ref('');
    const submittingReply = ref(false);
    const commentsPage = ref(1);
    const commentsHasMore = ref(false);
    const loadingMoreComments = ref(false);
    
    // 目录相关状态
    const tocItems = ref<any[]>([]); // 使用空数组初始化tocItems
    const activeHeading = ref('');
    
    // 阅读进度相关状态
    const readingProgress = ref(0);
    
    // 获取blogId从URL查询参数
    const blogId = computed(() => route.query.blogId?.toString() || '');
    
    // 判断用户是否登录的计算属性
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    
    // 初始化 Markdown-it 实例
    const md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    });
    
    // 使用markdown-it-prism插件
    md.use(MarkdownItPrism);
    
    // 格式化内容
    const formatContent = (content: string): string => {
      if (!content) return '';
      
      // 处理标题添加ID以支持目录导航
      let processedContent = content.replace(/^(#{1,6})\s+(.+?)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        const text = title.trim();
        const id = generateHeadingId(text);
        return `<h${level} id="${id}" class="blog-heading">${text}</h${level}>`;
      });
      
      // 添加行号标记到代码块
      processedContent = processedContent.replace(/```(\w+)/g, '```$1 class=line-numbers');
      
      // 使用markdown-it渲染内容
      let html = md.render(processedContent);
      
      // 后处理HTML，添加代码块容器和复制按钮
      html = html.replace(/<pre class="language-(\w+).*?"><code.*?>/g, 
        (match, lang) => {
          return `<div class="code-block">
            <div class="code-header">
              <span>${lang}</span>
              <button class="copy-btn" onclick="
                const el = this.parentNode.parentNode.querySelector('code');
                navigator.clipboard.writeText(el.textContent);
                this.textContent = '已复制';
                this.classList.add('copied');
                setTimeout(() => {
                  this.textContent = '复制';
                  this.classList.remove('copied');
                }, 1500);
              ">复制</button>
            </div>
            ${match}`;
        })
        .replace(/<\/code><\/pre>/g, '</code></pre></div>');
      
      return html;
    };
    
    // HTML转义函数
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // 防抖函数
    const debounce = (fn: Function, wait = 100) => {
      let timeout: number | null = null;
      return (...args: any[]) => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
          fn(...args);
          timeout = null;
        }, wait);
      };
    };
    
    // 加载博客详情
    const loadBlogDetail = async () => {
      if (blogId.value === null) {
        error.value = '博客ID不能为空或无效';
        loading.value = false;
        console.error('博客加载失败：blogId无效', route.query);
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      console.log('开始加载博客详情，blogId:', blogId.value);
      
      try {
        const response = await blogService.getBlogDetail(Number(blogId.value));
        console.log('博客详情API响应:', response);
        
        if (response.code === 0 && response.data && response.data.blogId) {
          blog.value = response.data;
          document.title = `${blog.value.title} - 软件技术博客`;
          // 获取相关内容
          loadComments();
          generateToc();
        } else {
          error.value = response.msg || '未找到博客详情';
          console.error('博客详情API返回错误:', response);
        }
      } catch (err) {
        console.error('加载博客详情失败:', err);
        error.value = '加载博客详情失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    };
    
    // 加载评论列表
    const loadComments = async () => {
      if (!blogId.value) {
        console.warn('无法加载评论：博客ID无效');
        return;
      }
      
      loadingComments.value = true;
      commentsError.value = '';
      
      try {
        console.log('开始加载评论，blogId:', blogId.value);
        const response = await blogService.getBlogComments({
          blogId: Number(blogId.value),
          page: 1, 
          size: 10
        });
        
        if (response.code === 0) {
          comments.value = response.data.list || [];
          totalCommentsCount.value = response.data.total || 0;
          commentsHasMore.value = comments.value.length < totalCommentsCount.value;
          console.log(`成功加载${comments.value.length}条评论，共${totalCommentsCount.value}条`);
        } else {
          commentsError.value = response.msg || '加载评论失败';
          console.warn('获取评论失败:', response.msg);
        }
      } catch (err) {
        console.error('加载评论出错:', err);
        commentsError.value = '加载评论失败，请稍后重试';
      } finally {
        loadingComments.value = false;
      }
    };
    
    // 加载更多评论
    const loadMoreComments = async () => {
      if (!blogId.value || loadingMoreComments.value) return;
      
      loadingMoreComments.value = true;
      
      try {
        commentsPage.value++;
        const response = await blogService.getBlogComments({
          blogId: Number(blogId.value),
          page: commentsPage.value, 
          size: 10
        });
        
        if (response.code === 0) {
          const newComments = response.data.list || [];
          comments.value = [...comments.value, ...newComments];
          commentsHasMore.value = newComments.length === 10;
          console.log(`成功加载${newComments.length}条新评论`);
        } else {
          console.warn('获取更多评论失败:', response.msg);
        }
      } catch (err) {
        console.error('加载更多评论出错:', err);
        commentsPage.value--; // 恢复页码
      } finally {
        loadingMoreComments.value = false;
      }
    };
    
    // 设置监听，确保函数已声明
    // 在blogId变化时重新加载内容
    watch(blogId, (newId) => {
      if (newId !== null) {
        loadBlogDetail();
      } else {
        error.value = '博客ID无效或未提供';
        loading.value = false;
      }
    });
    
    // 监听路由查询参数变化，如果无效则重定向
    watch(
      () => route.query.blogId,
      (newId) => {
        console.log('博客ID变更:', newId);
        if (!newId || newId === 'undefined' || newId === 'null' || newId === 'NaN') {
          console.warn('检测到无效的博客ID，重定向到博客列表:', newId);
          router.replace('/blog');
        }
      }
    );
    
    // 组件挂载时加载数据
    onMounted(() => {
      console.log('BlogDetail组件已挂载，路由参数:', route.query);
      console.log('计算出的blogId:', blogId.value);
      
      if (blogId.value) {
        loadBlogDetail();
      } else {
        console.error('无法获取有效的blogId:', route.query.blogId);
        error.value = '博客ID无效或未提供';
        loading.value = false;
      }
      
      // 使用passive: true优化滚动事件
      window.addEventListener('scroll', handleWindowScroll, { passive: true });
      window.addEventListener('scroll', debounce(updateReadingProgress, 10), { passive: true });
      
      // 初始化进度
      updateReadingProgress();
    });
    
    // 回复评论
    const replyToComment = (comment: BlogComment) => {
      if (!isUserLoggedIn.value) {
        router.push('/login');
        return;
      }
      
      replyingToComment.value = comment;
      replyContent.value = '';
    };
    
    // 取消回复
    const cancelReply = () => {
      replyingToComment.value = null;
      replyContent.value = '';
    };
    
    // 提交评论
    const submitComment = async () => {
      if (!blogId.value || !commentContent.value.trim() || submittingComment.value) {
        return;
      }
      
      if (!isUserLoggedIn.value) {
        router.push('/login');
        return;
      }
      
      submittingComment.value = true;
      
      try {
        const response = await blogService.addBlogComment({
          blogId: Number(blogId.value),
          content: commentContent.value.trim(),
          parentId: undefined
        });
        
        if (response.code === 0) {
          console.log('评论提交成功');
          // 将新评论添加到列表顶部
          const newComment: ExtendedComment = {
            commentId: typeof response.data.commentId === 'string' ? 
              parseInt(response.data.commentId) : response.data.commentId || Date.now(),
            blogId: Number(blogId.value),
            content: commentContent.value.trim(),
            userName: userStore.currentUser?.userName || '匿名用户',
            userId: userStore.currentUser?.userId || 0,
            userAvatar: '',
            parentId: 0,
            createTime: new Date().toISOString(),
            children: [],
            likes: 0,
            isLiked: false
          };
          comments.value = [newComment as BlogComment, ...comments.value];
          commentContent.value = ''; // 清空输入框
        } else {
          alert(response.msg || '评论提交失败');
          console.error('评论提交API返回错误:', response);
        }
      } catch (err) {
        console.error('评论提交失败:', err);
        alert('评论提交失败，请稍后重试');
      } finally {
        submittingComment.value = false;
      }
    };
    
    // 提交回复
    const submitReply = async (parentComment: BlogComment) => {
      if (
        !blogId.value || 
        !replyContent.value.trim() || 
        submittingReply.value || 
        !parentComment.commentId
      ) {
        return;
      }
      
      submittingReply.value = true;
      
      try {
        const response = await blogService.addBlogComment({
          blogId: Number(blogId.value),
          content: replyContent.value.trim(),
          parentId: parentComment.commentId
        });
        
        if (response.code === 0) {
          console.log('回复提交成功');
          
          // 将新回复添加到父评论的children中
          const newReply: ExtendedComment = {
            commentId: typeof response.data.commentId === 'string' ? 
              parseInt(response.data.commentId) : response.data.commentId || Date.now(),
            blogId: Number(blogId.value),
            content: replyContent.value.trim(),
            userName: userStore.currentUser?.userName || '匿名用户',
            userId: userStore.currentUser?.userId || 0,
            userAvatar: '',
            parentId: parentComment.commentId,
            createTime: new Date().toISOString(),
            children: [],
            likes: 0,
            isLiked: false
          };
          
          // 确保父评论有children数组
          if (!parentComment.children) {
            parentComment.children = [];
          }
          
          parentComment.children.push(newReply as BlogComment);
          replyingToComment.value = null;
          replyContent.value = '';
        } else {
          alert(response.msg || '回复提交失败');
          console.error('回复提交API返回错误:', response);
        }
      } catch (err) {
        console.error('回复提交失败:', err);
        alert('回复提交失败，请稍后重试');
      } finally {
        submittingReply.value = false;
      }
    };
    
    // 点赞评论
    const likeComment = async (comment: BlogComment) => {
      if (!isUserLoggedIn.value) {
        router.push('/login');
        return;
      }
      
      // 使用类型断言
      const extComment = comment as ExtendedComment;
      
      // 乐观更新UI
      extComment.isLiked = !extComment.isLiked;
      extComment.likes = (extComment.likes || 0) + (extComment.isLiked ? 1 : -1);
      
      try {
        // 这里应该有一个API调用来点赞/取消点赞评论
        // 目前处于演示目的，暂时不实现实际API调用
        console.log(`${extComment.isLiked ? '点赞' : '取消点赞'}评论:`, comment.commentId);
      } catch (err) {
        // 如果失败，恢复UI状态
        console.error('点赞操作失败:', err);
        extComment.isLiked = !extComment.isLiked;
        extComment.likes = (extComment.likes || 0) + (extComment.isLiked ? 1 : -1);
      }
    };
    
    // 博客点赞与取消
    const toggleLike = async () => {
      if (!isUserLoggedIn.value) {
        alert('请先登录再点赞');
        return;
      }
      
      if (!blogId.value || !blog.value) {
        console.error('无法点赞：博客ID无效或博客为空');
        return;
      }
      
      try {
        if (isLiked.value) {
          console.log('取消点赞，blogId:', blogId.value);
          const response = await blogService.unlikeBlog(Number(blogId.value));
          
          if (response.code === 0) {
            isLiked.value = false;
            if (blog.value.likeCount > 0) {
              blog.value.likeCount--;
            }
            console.log('成功取消点赞');
          } else {
            console.warn('取消点赞失败:', response.msg);
            if (response.msg) {
              // 显示接口返回的错误信息
              alert(`操作失败: ${response.msg}`);
            }
          }
        } else {
          console.log('添加点赞，blogId:', blogId.value);
          
          // 先乐观更新UI
          const originalLikeStatus = isLiked.value;
          const originalLikeCount = blog.value.likeCount;
          
          // 先更新UI
          isLiked.value = true;
          blog.value.likeCount++;
          
          try {
            // 然后发送请求
            const response = await blogService.likeBlog(Number(blogId.value));
            
            if (response.code === 0) {
              console.log('成功添加点赞');
            } else {
              // 如果请求失败，恢复原始状态
              console.warn('点赞失败:', response.msg);
              isLiked.value = originalLikeStatus;
              blog.value.likeCount = originalLikeCount;
              
              if (response.msg) {
                // 显示接口返回的错误信息
                alert(`操作失败: ${response.msg}`);
              }
            }
          } catch (err) {
            // 如果请求失败，恢复原始状态
            console.error('点赞请求出错:', err);
            isLiked.value = originalLikeStatus;
            blog.value.likeCount = originalLikeCount;
            throw err; // 将错误向上抛出，由外层catch处理
          }
        }
      } catch (err) {
        console.error('点赞操作失败:', err);
        // 不弹窗提示错误，因为模拟数据会处理
      }
    };
    
    // 格式化日期
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch (err) {
        console.warn('日期格式化错误:', err);
        return dateStr;
      }
    };
    
    // 处理标签
    const getTags = (tags: string | string[]) => {
      if (!tags) return [];
      
      if (typeof tags === 'string') {
        // 如果是字符串，尝试解析JSON
        try {
          return JSON.parse(tags);
        } catch {
          // 如果解析失败，则按逗号分隔
          return tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        return tags;
      }
      
      return [];
    };
    
    // 生成目录
    const generateToc = () => {
      if (!blog.value || !blog.value.content) {
        tocItems.value = [];
        return;
      }
      
      const content = blog.value.content;
      const headings: any[] = [];
      const headingRegex = /^(#{1,6})\s+(.+?)(?:\s*)?$/gm;
      let match;
      
      // 提取所有标题
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = generateHeadingId(text);
        
        headings.push({
          id,
          text,
          level
        });
      }
      
      // 如果没有找到标题，返回空数组
      if (headings.length === 0) {
        tocItems.value = [];
        return;
      }
      
      // 如果已经找到标题，确保所有标题都有正确的ID设置
      console.log("找到标题数：", headings.length);
      
      // 直接使用提取的标题，简化处理
      tocItems.value = headings;
      
      // 在目录生成后设置观察器
      nextTick(() => {
        setupTocObserver();
        
        // 检查目录样式初始状态
        const tocItemsList = document.querySelectorAll('.toc-item');
        console.log("目录项数量：", tocItemsList.length);
        
        if (tocItemsList.length > 0 && activeHeading.value) {
          const activeTocItem = document.querySelector(`.toc-item.active`);
          console.log("当前活动目录项：", activeTocItem);
        }
      });
    };
    
    // 生成唯一的标题ID
    const generateHeadingId = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5-]/g, '') // 支持中文字符
        .replace(/--+/g, '-')
        .substring(0, 50);
    };
    
    // 设置目录观察器
    const setupTocObserver = () => {
      if (!tocItems.value.length) return;
      
      // 清理旧观察器
      if (headingObserver) {
        headingObserver.disconnect();
      }
      
      // 等待 DOM 更新完成
      nextTick(() => {
        const headingElements = document.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        if (!headingElements.length) return;
        
        // 初始化找到最接近视口顶部的标题
        const findInitialActiveHeading = () => {
          let closestHeading: HTMLElement | null = null;
          let minDistance = Infinity;
          
          headingElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const distance = Math.abs(rect.top);
            if (distance < minDistance) {
              minDistance = distance;
              closestHeading = el as HTMLElement;
            }
          });
          
          // @ts-ignore 强制忽略类型检查错误
          if (closestHeading && closestHeading.id) {
            // @ts-ignore
            activeHeading.value = closestHeading.id;
          }
        };
        
        // 先设置初始活动标题
        findInitialActiveHeading();
        
        // 创建IntersectionObserver以监听标题元素
        const observer = new IntersectionObserver(
          (entries) => {
            // 找到最靠近顶部的可见标题
            const visibleHeadings = entries
              .filter(entry => entry.isIntersecting)
              .sort((a, b) => {
                const rectA = a.boundingClientRect;
                const rectB = b.boundingClientRect;
                return Math.abs(rectA.top) - Math.abs(rectB.top);
              });
              
            if (visibleHeadings.length > 0 && visibleHeadings[0].target instanceof HTMLElement) {
              activeHeading.value = (visibleHeadings[0].target as HTMLElement).id;
            }
          },
          {
            rootMargin: '-80px 0px -80% 0px',
            threshold: 0
          }
        );
        
        // 保存观察器引用
        headingObserver = observer;
        
        // 开始观察所有标题元素
        headingElements.forEach(el => observer.observe(el));
      });
    };
    
    // 处理滚动事件
    const handleWindowScroll = () => {
      showBackToTop.value = window.scrollY > 300;
      // 同时更新阅读进度
      updateReadingProgress();
    };

    // 计算阅读进度
    const updateReadingProgress = () => {
      if (!blog.value) return;
      
      // 使用requestAnimationFrame提高性能
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // 计算阅读百分比 (0-100)
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        readingProgress.value = Math.min(Math.max(scrollPercentage, 0), 100);
      });
    };
    
    // 处理目录点击
    const scrollToHeading = (id: string) => {
      activeHeading.value = id;
      
      // 添加点击反馈动画
      nextTick(() => {
        const tocItem = document.querySelector(`.toc-item.active`);
        if (tocItem) {
          tocItem.classList.add('clicked');
          setTimeout(() => {
            tocItem.classList.remove('clicked');
          }, 300);
        }
        
        const element = document.getElementById(id);
        if (element) {
          // 平滑滚动并调整偏移
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // 添加高亮动画
          element.classList.add('heading-highlight');
          setTimeout(() => {
            element.classList.remove('heading-highlight');
          }, 1500);
        }
      });
    };
    
    // 组件销毁时的清理函数
    onBeforeUnmount(() => {
      if (headingObserver) {
        headingObserver.disconnect();
      }
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('scroll', debounce(updateReadingProgress, 10));
    });
    
    const showBackToTop = ref(false);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // 初始化滚动按钮状态
    onMounted(() => {
      handleWindowScroll();
    });

    // 添加的状态和函数
    const sortMode = ref<'hot' | 'new'>('new'); // 默认最新排序
    const totalCommentsCount = ref(0);
    
    // 排序后的评论列表
    const sortedComments = computed(() => {
      if (sortMode.value === 'hot') {
        // 按点赞数排序 - 使用类型断言
        return [...comments.value].sort((a, b) => 
          ((b as ExtendedComment).likes || 0) - ((a as ExtendedComment).likes || 0)
        );
      } else {
        // 按时间排序（最新的在前）
        return [...comments.value].sort((a, b) => 
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        );
      }
    });
    
    // 切换排序模式
    const changeSortMode = (mode: 'hot' | 'new') => {
      sortMode.value = mode;
    };

    // 声明观察器变量
    let headingObserver: IntersectionObserver | null = null;

    return {
      blog,
      comments,
      loading,
      error,
      loadingComments,
      commentsError,
      commentContent,
      submittingComment,
      isLiked,
      replyingToComment,
      replyContent,
      submittingReply,
      commentsPage,
      commentsHasMore,
      loadingMoreComments,
      formatDate,
      getTags,
      formatContent,
      submitComment,
      toggleLike,
      replyToComment,
      cancelReply,
      submitReply,
      likeComment,
      loadMoreComments,
      userStore,
      tocItems,
      activeHeading,
      scrollToHeading,
      isUserLoggedIn,
      showBackToTop,
      scrollToTop,
      readingProgress,
      sortMode,
      changeSortMode,
      sortedComments,
      totalCommentsCount,
      loadBlogDetail,
      loadComments
    };
  }
});
</script>

<style scoped>
.blog-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content-with-sidebar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: start;
}

@media (max-width: 992px) {
  .content-with-sidebar {
    grid-template-columns: 1fr;
  }
  
  .content-sidebar {
    position: relative;
    top: 0;
    margin-top: 2rem;
    max-height: none;
    overflow-y: visible;
  }
}

.loading-state, .error-state, .not-found {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.back-nav {
  margin-bottom: 1.5rem;
}

.blog-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  margin-bottom: 2rem;
  overflow: hidden;
  will-change: transform;
  transition: box-shadow 0.3s ease;
}

.blog-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.blog-content header {
  margin-bottom: 2rem;
}

.blog-category {
  display: inline-block;
  background-color: #eef2ff;
  color: #4f46e5;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.blog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 1.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.tag {
  padding: 0.35rem 0.85rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.cover-image {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-image img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-image:hover img {
  transform: scale(1.01);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.update-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  border: none;
  color: #4b5563;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.like-button:hover {
  background-color: #e5e7eb;
}

.like-button.liked {
  background-color: #fee2e2;
  color: #ef4444;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
}

.share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: none;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-btn:hover {
  background-color: #e5e7eb;
  color: #1d4ed8;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .blog-content {
    padding: 1.5rem;
  }
  
  .blog-content h1 {
    font-size: 1.5rem;
  }
  
  .blog-meta {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}

.content-sidebar {
  position: sticky;
  top: 2rem;
  height: max-content;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-right: 0.5rem;
  border-radius: 12px;
}

.comments-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-top: 1rem;
  width: 100%;
  overflow: hidden;
}

.content-sidebar::-webkit-scrollbar {
  width: 6px;
}

.content-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.content-sidebar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.3s ease;
  margin-bottom: 0;
  height: fit-content;
}

.sidebar-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.sidebar-title {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 0.75rem;
}

.sidebar-title::before {
  content: '';
  position: absolute;
  left: 0;
  width: 4px;
  height: 1.2rem;
  background-color: #3b82f6;
  border-radius: 1px;
}

.comment-item {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.comment-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-author-info {
  display: flex;
  align-items: center;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
  font-size: 0.875rem;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
}

.comment-date {
  color: #9ca3af;
  font-size: 0.75rem;
}

.comment-content {
  margin-bottom: 1rem;
  color: #4b5563;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-button {
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-button:hover {
  background-color: #f3f4f6;
  color: #4b5563;
  border-color: #e5e7eb;
}

.action-button.liked {
  color: #ef4444;
  background-color: #fee2e2;
  border-color: #fecaca;
}

.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.reply-form textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
  margin-bottom: 1rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-reply-button {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: #4b5563;
  transition: all 0.2s;
}

.cancel-reply-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.submit-reply-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-reply-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-reply-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.comment-replies {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid #e5e7eb;
}

.reply-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #f3f4f6;
}

.reply-item:last-child {
  margin-bottom: 0;
}

/* 评论动画 */
.comment-fade-enter-active, 
.comment-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.comment-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.comment-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 阅读进度条样式 */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: rgba(243, 244, 246, 0.6);
  z-index: 1000;
}

.reading-progress-bar {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.1s ease;
  border-radius: 0 2px 2px 0;
  will-change: width;
}

.toc-item.clicked {
  transform: translateX(4px);
  transition: transform 0.2s ease;
}

/* 目录列表样式 */
.catalog-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 15rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  padding: 0 0.5rem 0.5rem 0;
}

.catalog-list::-webkit-scrollbar {
  width: 4px;
}

.catalog-list::-webkit-scrollbar-track {
  background: transparent;
}

.catalog-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 2px;
}

/* 目录项样式 */
.toc-item {
  margin-bottom: 0.3rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toc-item a {
  display: block;
  padding: 0.4rem 0.75rem;
  color: #4b5563;
  text-decoration: none;
  font-size: 0.95rem;
  line-height: 1.4;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.toc-item a:hover {
  color: #1d4ed8;
  background-color: rgba(243, 244, 246, 0.8);
  transform: translateX(2px);
}

.toc-item.active a {
  color: #1d4ed8;
  background-color: #eef2ff;
  font-weight: 500;
  border-left: 3px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 目录层级样式 */
.toc-item.level-1 a {
  padding-left: 0.75rem;
  font-weight: 500;
}

.toc-item.level-2 a {
  padding-left: 1.5rem;
  font-size: 0.9rem;
}

.toc-item.level-3 a {
  padding-left: 2.25rem;
  font-size: 0.85rem;
  color: #6b7280;
}

/* 选中状态时需要调整缩进，避免与左侧标记重叠 */
.toc-item.active.level-1 a {
  padding-left: 1rem;
}

.toc-item.active.level-2 a {
  padding-left: 1.75rem;
}

.toc-item.active.level-3 a {
  padding-left: 2.5rem;
}

/* 新增目录标题区域样式 */
.sidebar-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.catalog-tip {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
  background-color: #f3f4f6;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.sidebar-section.catalog:hover .catalog-tip {
  background-color: #e5e7eb;
  color: #4b5563;
}

@media (max-width: 992px) {
  /* 在小屏幕设备上调整间距 */
  .sidebar-section {
    margin-top: 0; /* 移除顶部间距，使用父元素的gap控制 */
  }
}

</style>

<style>
/* 全局样式，用于v-html渲染的内容 */
.article-content h1, 
.article-content h2, 
.article-content h3, 
.article-content h4, 
.article-content h5, 
.article-content h6 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #111827;
  font-weight: 600;
  scroll-margin-top: 4rem;
  position: relative;
  line-height: 1.4;
}

.article-content h1 { 
  font-size: 2rem; 
  margin-top: 1.5rem;
}

.article-content h2 { 
  font-size: 1.5rem; 
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.article-content h3 { font-size: 1.25rem; }
.article-content h4 { font-size: 1.125rem; }
.article-content h5 { font-size: 1rem; }
.article-content h6 { font-size: 0.875rem; }

.article-content p {
  margin: 1.25rem 0;
  line-height: 1.8;
  color: #374151;
}

.article-content img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 1.5rem auto;
  display: block;
}

.article-content a {
  color: #3b82f6;
  text-decoration: none;
  border-bottom: 1px solid #bfdbfe;
  transition: all 0.2s;
  font-weight: 500;
}

.article-content a:hover {
  border-color: #3b82f6;
  background-color: #f0f7ff;
}

.article-content blockquote {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #3b82f6;
  background-color: #f9fafb;
  color: #4b5563;
  font-style: italic;
  border-radius: 0 4px 4px 0;
}

.article-content blockquote p {
  margin: 0;
}

.article-content ul, .article-content ol {
  margin: 1.25rem 0;
  padding-left: 2rem;
}

.article-content li {
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.article-content pre {
  margin: 1.5rem 0;
  padding: 0;
  background-color: transparent;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.article-content pre code {
  padding: 1rem 1.5rem;
  display: block;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  tab-size: 2;
}

.article-content code {
  background-color: #f1f5f9;
  color: #3b82f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9em;
}

.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.article-content table th,
.article-content table td {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.article-content table th {
  background-color: #f9fafb;
  font-weight: 600;
}

.article-content table tr:nth-child(even) {
  background-color: #f9fafb;
}

.article-content table tr:hover {
  background-color: #f3f4f6;
}

.article-content hr {
  margin: 2rem 0;
  border: 0;
  height: 1px;
  background-color: #e5e7eb;
}



.inline-code {
  padding: 0.15rem 0.4rem;
  background-color: #f1f5f9;
  border-radius: 4px;
  color: #ef4444;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9em;
  white-space: nowrap;
}

/* 移动设备样式适配 */
@media (max-width: 768px) {
  .article-content h1 { font-size: 1.75rem; }
  .article-content h2 { font-size: 1.35rem; }
  .article-content h3 { font-size: 1.15rem; }
  .article-content h4, .article-content h5, .article-content h6 { font-size: 1rem; }
  
  .article-content p {
    font-size: 0.95rem;
    line-height: 1.7;
  }
  
  .article-content pre code {
    font-size: 0.85rem;
    padding: 0.75rem 1rem;
  }
  
  .code-header {
    padding: 0.5rem 0.75rem;
  }
  
  .article-content table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* 添加标题高亮动画 */
@keyframes heading-highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

.blog-heading {
  position: relative;
  padding-left: 0.1rem;
}

.blog-heading::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: transparent;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.blog-heading:hover::before {
  background-color: #3b82f6;
}

.heading-highlight {
  animation: heading-highlight 1.5s ease-out;
  border-radius: 4px;
}

.article-content p {
  margin: 1.25rem 0;
  line-height: 1.8;
  color: #374151;
}


  pre[class*="language-"] {
    background: #f8fafc;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    tab-size: 2;
  }
  
  code[class*="language-"] {
    background: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
  }

/* 代码块样式增强 */
.code-block {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
  color: #4b5563;
}

.copy-btn {
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #334155;
}

.copy-btn:hover {
  background: #cbd5e1;
}

.copy-btn:active {
  transform: scale(0.95);
}

.copy-btn.copied {
  background: #dcfce7;
  color: #16a34a;
}

.code-block pre[class*="language-"] {
  margin: 0;
  border-radius: 0;
}

/* 行号样式增强 */
.line-numbers .line-numbers-rows {
  position: absolute;
  pointer-events: none;
  top: 0;
  font-size: 100%;
  left: -3.8em;
  width: 3em;
  letter-spacing: -1px;
  border-right: 1px solid #d1d5db;
  user-select: none;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

/* 高亮的行 */
.line-highlight {
  position: absolute;
  left: 0;
  right: 0;
  padding: inherit 0;
  margin-top: 1em;
  background: rgba(59, 130, 246, 0.08);
  pointer-events: none;
  line-height: inherit;
  white-space: pre;
}

/* 使pre标签始终有一个滚动条容器来支持行号和代码内容的精确对齐 */
pre[class*="language-"].line-numbers {
  position: relative;
  padding-left: 3.8em;
  counter-reset: linenumber;
  white-space: pre;
}

/* 修复移动端样式 */
@media (max-width: 768px) {
  .code-block {
    margin: 1rem 0;
  }
  
  pre[class*="language-"].line-numbers {
    padding-left: 3.5em;
  }
  
  .line-numbers .line-numbers-rows {
    left: -3.5em;
    width: 2.5em;
  }
}
</style>
