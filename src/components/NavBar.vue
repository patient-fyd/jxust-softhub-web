<template>
  <div class="page">
    <img
      src="../assets/logo.svg"
      class="image"
      alt="协会Logo"
      @click="$router.push('/')"
      style="cursor: pointer;"
    />
    <div class="wrap">
      <div class="container">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/news" class="nav-item">新闻动态</router-link>
        <router-link to="/activities" class="nav-item">活动展示</router-link>
        <router-link to="/members" class="nav-item">成员展示</router-link>
        <router-link to="/resources" class="nav-item">资源中心</router-link>
      </div>
    </div>
    <div class="actions">
      <div class="search-group">
        <input
          type="text"
          class="search-input"
          placeholder="搜索内容..."
          v-model="searchKeyword"
          :class="{ expanded: isSearchFocused }"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        />
        <button class="search-button" @click="handleSearch">
          <Icon icon="mdi:search" width="20" height="20" />
        </button>
      </div>
      <button class="post-button">创作中心 ▾</button>
      <!-- 根据登录状态显示不同的按钮 -->
      <div v-if="!isLoggedIn" class="auth-buttons combined-auth">
        <span class="auth-part" @click="$router.push('/login')">登录</span>
        <span class="divider">|</span>
        <span class="auth-part" @click="$router.push('/register')">注册</span>
      </div>
      <div v-else class="user-profile">
        <button class="profile-button" @click="$router.push('/profile')">
          <Icon icon="mdi:account-circle" width="20" height="20" />
          <span>{{ currentUser?.name || '个人主页' }}</span>
        </button>
        <button class="logout-button" @click="handleLogout">
          <Icon icon="mdi:logout" width="16" height="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useUserStore } from '../stores/userStore';

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

    // 计算属性：判断用户是否已登录
    const isLoggedIn = computed(() => !!userStore.currentUser);

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

    return {
      searchKeyword,
      handleSearch,
      isSearchFocused,
      isLoggedIn,
      currentUser: computed(() => userStore.currentUser),
      handleLogout
    };
  },
});
</script>

<style scoped>
.page {
	width: 100%;
	height: 70px;
	overflow: hidden;
	box-sizing: border-box;
	background: rgba(240,245,255,1);
	display: flex;
	justify-content: space-between;
	padding: 0 24px;
	align-items: center;
}

/* Added combined auth button styles */
.combined-auth {
  display: flex;
  align-items: center;
  border: 2px solid rgba(71,133,255,1);
  border-radius: 8px;
  padding: 4px 12px;
  color: rgba(71,133,255,1);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  background-color: rgba(240,245,255,0.3);
  transition: background-color 0.3s ease;
}

.combined-auth:hover {
  background-color: rgba(71,133,255,0.1);
}

.auth-part {
  font-size: 14px;
  padding: 0 6px;
  transition: color 0.3s ease;
}

.divider {
  padding: 0 2px;
  color: rgba(71,133,255,0.6);
}

.auth-part:hover {
  color: #1e40af;
}
.image {
	width: 168px;
	height: 36px;
	box-sizing: border-box;
	margin-left: 24px;
}
.wrap {
	width: 531px;
	height: 16px;
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	justify-content: center;
	align-items: center;
	margin-left: 276.50px;
}
.container {
	width: 531px;
	height: 16px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
}
.nav-item {
  position: relative;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding: 10px 14px;
  background: rgba(240, 245, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 70px;
  border-radius: 0;
  margin: 0 4px;
}

.nav-item:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.nav-item:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.nav-item::after {
  content: '';
  position: absolute;
  left: 20%;
  bottom: 6px;
  width: 60%;
  height: 2px;
  background-color: transparent;
  transition: background-color 0.3s ease, transform 0.3s ease;
  transform: scaleX(0);
  transform-origin: center;
}

.nav-item:hover::after {
  background-color: #1e40af;
  transform: scaleX(1);
}

.router-link-active.nav-item {
  font-weight: 600;
  color: #1e40af;
  background: rgba(184, 207, 255, 1);
  box-shadow: 0 2px 8px rgba(71, 133, 255, 0.15);
}

.router-link-active.nav-item::after {
  background-color: #1e40af;
  transform: scaleX(1);
}
.auth-buttons {
    display: flex;
}
.auth-button {
    font-size: 14px;
    font-weight: 500;
    color: rgba(71,133,255,1);
    padding: 8px 16px;
    border: 2px solid rgba(71,133,255,1);
    border-radius: 24px;
    text-decoration: none;
    transition: all 0.3s ease;
}
.auth-button:hover {
    background: rgba(71,133,255,0.1);
}
.actions {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 0;
    gap: 8px;
}

.search-group {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  height: 36px;
}

.search-input {
  border: none;
  outline: none;
  padding: 0 12px;
  width: 170px;
  height: 100%;
  transition: width 0.3s ease;
}

 .search-input.expanded {
   width: 260px;
 }

.search-button {
  border: none;
  background: #f0f5ff;
  cursor: pointer;
  padding: 0 12px;
  font-size: 16px;
  color: #333;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.search-button:focus {
  outline: none;
  box-shadow: none;
}

.search-button:hover {
  background-color: #dbeafe;
}

.post-button {
    height: 36px;
    padding: 0 16px;
    background-color: #3b82f6;
    color: white;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.post-button:hover {
    background-color: #1e40af;
}

/* 个人主页按钮样式 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background-color: rgba(71,133,255,1);
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.profile-button:hover {
  background-color: #1e40af;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #e5e7eb;
}

/* 响应式布局 */
@media (max-width: 1440px) {
  .page {
    justify-content: space-between;
    padding: 0 20px;
  }
  .wrap {
    margin-left: 0;
  }
}

@media (max-width: 960px) {
  .page {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  .image {
    margin-left: 0;
    margin-bottom: 15px;
  }
  .wrap {
    width: 100%;
    margin-bottom: 15px;
  }
  .container {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .auth-buttons {
    justify-content: center;
    margin: 10px 0;
  }
  .actions {
    flex-direction: column;
    gap: 8px;
    margin: 10px 0;
  }

  .search-input {
    width: 100%;
  }

  .post-button {
    width: 100%;
  }
  
  .user-profile {
    width: 100%;
    justify-content: space-between;
    margin: 10px 0;
  }
  
  .profile-button {
    flex: 1;
  }
  
  .logout-button {
    margin-left: 8px;
  }
}
</style>