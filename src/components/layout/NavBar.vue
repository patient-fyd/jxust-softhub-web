<template>
  <div class="navbar-page">
    <div class="navbar-content">
      <div class="navbar-left">
        <div class="navbar-logo-container">
          <img
            src="../../assets/协会logo.jpg"
            class="navbar-logo-icon"
            alt="协会Logo"
            @click="$router.push('/')"
            style="cursor: pointer;"
          />
          <div
            class="navbar-image"
            @click="$router.push('/')"
            style="cursor: pointer;"
          >
            <div class="logo-text-primary">JXUST SoftHub</div>
            <div class="logo-text-secondary">软件协会</div>
          </div>
        </div>
        <div class="navbar-wrap">
          <div class="navbar-container">
            <router-link to="/" class="navbar-nav-item">首页</router-link>
            <router-link to="/blog" class="navbar-nav-item">技术博客</router-link>
            <router-link to="/moments" class="navbar-nav-item">日常动态</router-link>
            <router-link to="/practice" class="navbar-nav-item">在线刷题</router-link>
            <router-link to="/resources" class="navbar-nav-item">资源中心</router-link>
          </div>
        </div>
      </div>
      <div class="navbar-actions">
        <div class="navbar-search-group">
          <input
            type="text"
            class="navbar-search-input"
            placeholder="搜索内容..."
            v-model="searchKeyword"
            :class="{ 'navbar-expanded': isSearchFocused }"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
          />
          <button class="navbar-search-button" @click="handleSearch">
            <Icon icon="mdi:search" width="20" height="20" />
          </button>
        </div>
        <div class="navbar-create-dropdown" v-if="isLoggedIn" ref="createDropdownRef">
          <button class="navbar-post-button" @click="toggleCreateMenu">创作中心 ▾</button>
          
          <teleport to="body">
            <div v-if="showCreateMenu" class="navbar-dropdown-menu" :style="menuPosition">
              <!-- 所有登录用户都可以发布沸点(动态) -->
              <div class="navbar-dropdown-item" @click="navigateTo('/moments')">
                <Icon icon="mdi:comment-text-outline" width="18" height="18" />
                <span>发布动态</span>
              </div>
              
              <!-- 会员和更高权限可以写技术博客 -->
              <div class="navbar-dropdown-item" v-if="canWriteBlog" @click="navigateTo('/blog/editor')">
                <Icon icon="mdi:file-document-outline" width="18" height="18" />
                <span>写技术博客</span>
              </div>
              
              <!-- 管理员和高权限用户可以分享资源和发布公告 -->
              <div class="navbar-dropdown-item" v-if="canShareResource" @click="navigateTo('/resources')">
                <Icon icon="mdi:folder-outline" width="18" height="18" />
                <span>分享资源</span>
              </div>
              
              <!-- 管理员可以发布公告（新闻） -->
              <div class="navbar-dropdown-item" v-if="canPublishNews" @click="navigateTo('/news/editor')">
                <Icon icon="mdi:newspaper" width="18" height="18" />
                <span>发布公告</span>
              </div>
            </div>
          </teleport>
        </div>
        <!-- 根据登录状态显示不同的按钮 -->
        <div v-if="!isLoggedIn" class="navbar-auth-buttons navbar-combined-auth">
          <span class="navbar-auth-part" @click="$router.push('/login')">登录</span>
          <span class="navbar-divider">|</span>
          <span class="navbar-auth-part" @click="$router.push('/register')">注册</span>
        </div>
        <div v-else class="navbar-user-profile">
          <button class="navbar-profile-button" @click="$router.push('/profile')">
            <Icon icon="mdi:account-circle" width="20" height="20" />
            <span>{{ currentUser?.name || '个人主页' }}</span>
          </button>
          <button class="navbar-logout-button" @click="handleLogout">
            <Icon icon="mdi:logout" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useUserStore } from '../../stores/userStore';

// 角色ID常量
const ROLE = {
  ADMIN: 1,       // 管理员
  MODERATOR: 2,   // 版主/高级会员
  MEMBER: 3,      // 会员
  USER: 4         // 普通用户
};

export default defineComponent({
  name: 'NavBar',
  components: {
    Icon
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const searchKeyword = ref('');
    const isSearchFocused = ref(false);
    const showCreateMenu = ref(false);
    const createDropdownRef = ref<HTMLElement | null>(null);
    const menuPosition = ref({
      top: '0px',
      left: '0px'
    });

    // 计算属性：判断用户是否已登录
    const isLoggedIn = computed(() => !!userStore.currentUser);
    
    // 用户角色权限判断
    const userRoleId = computed(() => userStore.currentUser?.roleId || 0);
    
    // 是否可以写技术博客（会员及以上权限）
    const canWriteBlog = computed(() => {
      return isLoggedIn.value && userRoleId.value <= ROLE.MEMBER;
    });
    
    // 是否可以分享资源（版主及以上权限）
    const canShareResource = computed(() => {
      return isLoggedIn.value && userRoleId.value <= ROLE.MODERATOR;
    });
    
    // 是否可以发布公告（管理员权限）
    const canPublishNews = computed(() => {
      return isLoggedIn.value && userRoleId.value === ROLE.ADMIN;
    });

    const handleSearch = () => {
      if (searchKeyword.value.trim()) {
        router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`);
      }
    };

    // 处理登出
    const handleLogout = () => {
      userStore.logout();
      router.push('/');
    };
    
    // 更新下拉菜单位置
    const updateMenuPosition = () => {
      if (createDropdownRef.value) {
        const rect = createDropdownRef.value.getBoundingClientRect();
        menuPosition.value = {
          top: `${rect.bottom + 5}px`,
          left: `${rect.right - 160}px`
        };
      }
    };
    
    // 切换创作中心菜单
    const toggleCreateMenu = () => {
      showCreateMenu.value = !showCreateMenu.value;
      
      if (showCreateMenu.value) {
        // 更新菜单位置
        updateMenuPosition();
        
        // 当页面滚动或调整大小时，更新菜单位置
        window.addEventListener('scroll', updateMenuPosition);
        window.addEventListener('resize', updateMenuPosition);
      } else {
        // 移除事件监听器
        window.removeEventListener('scroll', updateMenuPosition);
        window.removeEventListener('resize', updateMenuPosition);
      }
    };
    
    // 导航到指定路径
    const navigateTo = (path: string) => {
      router.push(path);
      showCreateMenu.value = false;
    };
    
    // 点击外部区域关闭下拉菜单
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 检查点击是否在下拉菜单或按钮之外
      const isOutside = !(
        createDropdownRef.value?.contains(target) || 
        target.closest('.navbar-dropdown-menu')
      );
      
      if (isOutside && showCreateMenu.value) {
        showCreateMenu.value = false;
        window.removeEventListener('scroll', updateMenuPosition);
        window.removeEventListener('resize', updateMenuPosition);
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', updateMenuPosition);
      window.removeEventListener('resize', updateMenuPosition);
    });

    return {
      searchKeyword,
      handleSearch,
      isSearchFocused,
      isLoggedIn,
      currentUser: computed(() => userStore.currentUser),
      handleLogout,
      showCreateMenu,
      toggleCreateMenu,
      navigateTo,
      canWriteBlog,
      canShareResource,
      canPublishNews,
      createDropdownRef,
      menuPosition
    };
  },
});
</script>

<style scoped>
.navbar-page {
	width: 100%;
	height: 70px;
	overflow: hidden;
	box-sizing: border-box;
	background: rgba(240,245,255,1);
	display: flex;
	justify-content: center;
	align-items: center;
}

.navbar-content {
	width: 100%;
	max-width: 1400px;
	padding: 0 40px 0 30px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.navbar-left {
	display: flex;
	align-items: center;
}

.navbar-logo-container {
	display: flex;
	align-items: center;
	margin-right: 25px;
	margin-left: 35px;
}

.navbar-logo-icon {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	margin-right: 10px;
}

.navbar-image {
	width: 120px;
	height: 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.logo-text-primary {
	font-size: 16px;
	font-weight: 900;
	color: #1e3a8a;
	line-height: 1.2;
}

.logo-text-secondary {
	font-size: 12px;
	color: #4a5568;
	line-height: 1.2;
}

.navbar-wrap {
	height: 70px;
	overflow: hidden;
	background: rgba(240,245,255,1);
	display: flex;
	align-items: center;
	margin-left: 0;
}

.navbar-container {
	display: flex;
	width: auto;
	margin: 0;
	height: 100%;
	position: relative;
	left: 0;
	transform: none;
}

.navbar-nav-item {
	text-align: center;
	font-size: 16px;
	font-weight: 400;
	color: #1e3a8a;
	text-decoration: none;
	margin: 0 12px;
	padding: 0 6px;
	height: 70px;
	display: flex;
	align-items: center;
	position: relative;
	transition: color 0.3s;
}

.navbar-nav-item:first-child {
	margin-left: 0;
}

.navbar-nav-item:hover {
	color: #1d4ed8;
}

.navbar-nav-item::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 3px;
	background-color: transparent;
	transition: background-color 0.3s;
}

.navbar-nav-item:hover::after,
.navbar-nav-item.router-link-active::after {
	background-color: #1d4ed8;
}

.navbar-page .router-link-active {
	color: #1d4ed8;
	font-weight: 500;
}

.navbar-actions {
	display: flex;
	align-items: center;
	gap: 16px;
}

/* 搜索框样式 */
.navbar-search-group {
	position: relative;
	display: flex;
	align-items: center;
}

.navbar-search-input {
	width: 200px;
	height: 36px;
	border-radius: 18px;
	padding: 0 16px;
	padding-right: 40px;
	border: 1px solid rgba(210,215,235,1);
	background: rgba(255,255,255,1);
	color: #333;
	outline: none;
	transition: all 0.3s;
}

.navbar-search-input.navbar-expanded {
	width: 240px;
	box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
	border-color: #3182ce;
}

.navbar-search-button {
	position: absolute;
	right: 5px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	color: #4a5568;
	border-radius: 50%;
	transition: background-color 0.3s;
  padding: 0;
}

.navbar-search-button:hover {
	background-color: rgba(226, 232, 240, 0.7);
	color: #1a202c;
  border-color: transparent;
}

/* 创作中心按钮和下拉菜单 */
.navbar-post-button {
	background: linear-gradient(135deg, #2563eb, #1d4ed8);
	color: white;
	border: none;
	border-radius: 18px;
	padding: 0 16px;
	height: 36px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	gap: 5px;
}

.navbar-post-button:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	background: linear-gradient(135deg, #1e40af, #1e3a8a);
  border-color: transparent;
}

.navbar-dropdown-menu {
	position: absolute;
	background: white;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	border-radius: 8px;
	width: 160px;
	overflow: hidden;
	z-index: 100;
}

.navbar-dropdown-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	color: #4a5568;
	cursor: pointer;
	transition: all 0.2s;
}

.navbar-dropdown-item:hover {
	background-color: #f7fafc;
	color: #2563eb;
}

/* 认证按钮 */
.navbar-auth-buttons {
	display: flex;
	gap: 12px;
}

.navbar-auth-button {
	background-color: white;
	color: #1e3a8a;
	border: 1px solid #1e3a8a;
	border-radius: 18px;
	padding: 0 16px;
	height: 36px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.3s;
}

.navbar-auth-button:hover {
	background-color: #edf2f7;
}

.navbar-combined-auth {
	border-radius: 18px;
	padding: 0 16px;
	height: 36px;
	background-color: #fff;
	border: 1px solid #1e3a8a;
	display: flex;
	align-items: center;
	font-weight: 500;
	cursor: pointer;
}

.navbar-auth-part {
	color: #1e3a8a;
	padding: 0 8px;
	cursor: pointer;
	transition: color 0.3s;
}

.navbar-auth-part:hover {
	color: #1d4ed8;
}

.navbar-divider {
	color: #a0aec0;
}

/* 用户信息 */
.navbar-user-profile {
	display: flex;
	align-items: center;
	gap: 8px;
}

.navbar-profile-button {
	display: flex;
	align-items: center;
	gap: 6px;
	background-color: white;
	color: #2d3748;
	border: 1px solid #e2e8f0;
	border-radius: 18px;
	padding: 0 16px;
	height: 36px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.3s;
}

.navbar-profile-button:hover {
	background-color: #f7fafc;
	border-color: #cbd5e0;
}

.navbar-logout-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background-color: #f7fafc;
	color: #4a5568;
	border: 1px solid #e2e8f0;
	cursor: pointer;
	transition: all 0.3s;
  padding: 0;
}

.navbar-logout-button:hover {
	background-color: #edf2f7;
	color: #e53e3e;
	border-color: #e53e3e;
}

/* 响应式设计 */
@media (max-width: 1024px) {
	.navbar-container {
		position: static;
		transform: none;
		margin: 0 auto;
	}
	
	.navbar-nav-item {
		margin: 0 12px;
	}
}

@media (max-width: 900px) {
	.navbar-search-input {
		width: 150px;
	}
	
	.navbar-search-input.navbar-expanded {
		width: 180px;
	}
}

@media (max-width: 768px) {
	.navbar-page {
		height: auto;
		padding: 12px 16px;
		flex-direction: column;
		gap: 12px;
	}
	
	.navbar-wrap {
		height: 50px;
		width: 100%;
	}
	
	.navbar-container {
		overflow-x: auto;
		width: 100%;
		justify-content: flex-start;
	}
	
	.navbar-actions {
		width: 100%;
		justify-content: space-between;
		padding: 0 8px;
	}
	
	.navbar-logo-container {
		justify-content: center;
	}
}

@media (max-width: 480px) {
	.navbar-search-input {
		width: 120px;
	}
	
	.navbar-search-input.navbar-expanded {
		width: 140px;
	}
	
	.navbar-post-button {
		padding: 0 12px;
		font-size: 14px;
	}
	
	.navbar-combined-auth {
		padding: 0 12px;
		font-size: 14px;
	}
	
	.navbar-profile-button {
		padding: 0 10px;
		font-size: 14px;
	}
	
	.navbar-profile-button span {
		display: none;
	}
}
</style> 