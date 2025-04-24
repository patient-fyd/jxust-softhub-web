<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h1 class="gallery-title">活动图片库</h1>
      <p class="gallery-subtitle">记录社团精彩瞬间，展示我们的成长历程与活力</p>
    </div>
    
    <div class="gallery-filter">
      <div class="filter-group">
        <label>类别：</label>
        <select v-model="selectedCategory">
          <option value="">全部类别</option>
          <option value="activity">日常活动</option>
          <option value="competition">技术比赛</option>
          <option value="workshop">技术工坊</option>
          <option value="meetup">交流会议</option>
          <option value="trip">社团旅行</option>
        </select>
      </div>
      <div class="filter-group">
        <label>年份：</label>
        <select v-model="selectedYear">
          <option value="">全部年份</option>
          <option value="2023">2023年</option>
          <option value="2022">2022年</option>
          <option value="2021">2021年</option>
          <option value="2020">2020年</option>
        </select>
      </div>
      <div class="search-group">
        <Icon icon="mdi:magnify" class="search-icon" />
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="搜索图片描述" 
          class="search-input" 
        />
      </div>
    </div>
    
    <div class="album-container" v-if="!showLightbox">
      <div v-for="album in filteredAlbums" :key="album.id" class="album-card">
        <div class="album-cover" @click="viewAlbumDetails(album)">
          <img :src="album.coverUrl" :alt="album.title" class="album-img" />
          <div class="album-info">
            <h3 class="album-title">{{ album.title }}</h3>
            <div class="album-meta">
              <span class="album-date">{{ album.date }}</span>
              <span class="album-count">{{ album.images.length }}张照片</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="filteredAlbums.length === 0 && !showLightbox" class="no-albums">
      <Icon icon="mdi:image-off" class="no-albums-icon" />
      <p>暂无符合条件的相册</p>
    </div>
    
    <!-- 相册详情视图 -->
    <div class="album-details" v-if="currentAlbum && !showLightbox">
      <div class="details-header">
        <button class="back-button" @click="currentAlbum = null">
          <Icon icon="mdi:arrow-left" />
          返回相册列表
        </button>
        <h2 class="details-title">{{ currentAlbum.title }}</h2>
        <p class="details-description">{{ currentAlbum.description }}</p>
        <div class="details-meta">
          <span class="details-date">{{ currentAlbum.date }}</span>
          <span class="details-category">{{ getCategoryName(currentAlbum.category) }}</span>
          <span class="details-count">{{ currentAlbum.images.length }}张照片</span>
        </div>
      </div>
      
      <div class="images-grid">
        <div 
          v-for="(image, index) in currentAlbum.images" 
          :key="index" 
          class="image-item"
          @click="openLightbox(currentAlbum.images, index)"
        >
          <img :src="image.url" :alt="image.description" class="gallery-image" />
          <div class="image-overlay">
            <Icon icon="mdi:magnify-plus" class="overlay-icon" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 灯箱组件 -->
    <div class="lightbox" v-if="showLightbox" @click.self="closeLightbox">
      <div class="lightbox-container">
        <button class="lightbox-close" @click="closeLightbox">
          <Icon icon="mdi:close" />
        </button>
        <button class="lightbox-prev" @click="prevImage" v-if="lightboxImages.length > 1">
          <Icon icon="mdi:chevron-left" />
        </button>
        <div class="lightbox-content">
          <img :src="currentLightboxImage.url" :alt="currentLightboxImage.description" class="lightbox-image" />
          <div class="lightbox-caption">
            <p class="lightbox-description">{{ currentLightboxImage.description }}</p>
            <p class="lightbox-counter">{{ currentImageIndex + 1 }} / {{ lightboxImages.length }}</p>
          </div>
        </div>
        <button class="lightbox-next" @click="nextImage" v-if="lightboxImages.length > 1">
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

interface GalleryImage {
  url: string;
  description: string;
  tags?: string[];
}

interface Album {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  year: string;
  coverUrl: string;
  images: GalleryImage[];
}

export default defineComponent({
  name: 'Gallery',
  components: {
    Icon
  },
  setup() {
    const searchText = ref('');
    const selectedCategory = ref('');
    const selectedYear = ref('');
    const currentAlbum = ref<Album | null>(null);
    const showLightbox = ref(false);
    const lightboxImages = ref<GalleryImage[]>([]);
    const currentImageIndex = ref(0);
    
    // 分类名称映射
    const categoryNames: Record<string, string> = {
      'activity': '日常活动',
      'competition': '技术比赛',
      'workshop': '技术工坊',
      'meetup': '交流会议',
      'trip': '社团旅行'
    };
    
    // 获取分类名称
    const getCategoryName = (category: string) => {
      return categoryNames[category] || '其他';
    };
    
    // 模拟相册数据
    const albums = ref<Album[]>([
      {
        id: 1,
        title: '2023年技术开放日',
        description: '软件协会举办的年度技术开放日活动，展示了各类技术项目和创新成果',
        date: '2023-05-20',
        category: 'activity',
        year: '2023',
        coverUrl: 'https://picsum.photos/id/20/600/400',
        images: [
          { url: 'https://picsum.photos/id/26/1200/800', description: '技术项目展示区全景' },
          { url: 'https://picsum.photos/id/27/1200/800', description: '学生正在向参观者介绍项目' },
          { url: 'https://picsum.photos/id/28/1200/800', description: '老师们参观VR项目演示' },
          { url: 'https://picsum.photos/id/29/1200/800', description: '项目海报展示区' },
          { url: 'https://picsum.photos/id/30/1200/800', description: '小组讨论环节' },
          { url: 'https://picsum.photos/id/31/1200/800', description: '参与者互动交流' }
        ]
      },
      {
        id: 2,
        title: '编程马拉松大赛',
        description: '为期48小时的编程马拉松挑战赛，团队协作开发创新应用',
        date: '2023-11-10',
        category: 'competition',
        year: '2023',
        coverUrl: 'https://picsum.photos/id/42/600/400',
        images: [
          { url: 'https://picsum.photos/id/43/1200/800', description: '比赛开幕式' },
          { url: 'https://picsum.photos/id/44/1200/800', description: '团队协作编程中' },
          { url: 'https://picsum.photos/id/45/1200/800', description: '熬夜攻坚阶段' },
          { url: 'https://picsum.photos/id/46/1200/800', description: '项目展示与评审' },
          { url: 'https://picsum.photos/id/47/1200/800', description: '获奖团队合影' }
        ]
      },
      {
        id: 3,
        title: 'Web前端技术工坊',
        description: '针对新成员的前端技术培训工坊，从HTML/CSS基础到Vue框架实战',
        date: '2022-09-15',
        category: 'workshop',
        year: '2022',
        coverUrl: 'https://picsum.photos/id/60/600/400',
        images: [
          { url: 'https://picsum.photos/id/61/1200/800', description: '讲师介绍Vue.js基础概念' },
          { url: 'https://picsum.photos/id/62/1200/800', description: '学员们认真学习中' },
          { url: 'https://picsum.photos/id/63/1200/800', description: '小组实践环节' },
          { url: 'https://picsum.photos/id/64/1200/800', description: '讲师解答学员问题' },
          { url: 'https://picsum.photos/id/65/1200/800', description: '工坊结束合影留念' }
        ]
      },
      {
        id: 4,
        title: '校企合作交流会',
        description: '邀请IT行业企业代表与协会成员交流，分享行业趋势与就业机会',
        date: '2022-11-25',
        category: 'meetup',
        year: '2022',
        coverUrl: 'https://picsum.photos/id/80/600/400',
        images: [
          { url: 'https://picsum.photos/id/81/1200/800', description: '企业代表演讲' },
          { url: 'https://picsum.photos/id/82/1200/800', description: '学生提问互动环节' },
          { url: 'https://picsum.photos/id/83/1200/800', description: '企业招聘宣讲' },
          { url: 'https://picsum.photos/id/84/1200/800', description: '简历指导与面试技巧分享' }
        ]
      },
      {
        id: 5,
        title: '新成员见面会',
        description: '欢迎新学期加入协会的成员，介绍协会文化与各项活动',
        date: '2022-03-05',
        category: 'activity',
        year: '2022',
        coverUrl: 'https://picsum.photos/id/100/600/400',
        images: [
          { url: 'https://picsum.photos/id/101/1200/800', description: '协会主席致欢迎词' },
          { url: 'https://picsum.photos/id/102/1200/800', description: '各部门介绍' },
          { url: 'https://picsum.photos/id/103/1200/800', description: '破冰游戏环节' },
          { url: 'https://picsum.photos/id/104/1200/800', description: '新老成员交流' },
          { url: 'https://picsum.photos/id/105/1200/800', description: '茶话会自由交流' }
        ]
      },
      {
        id: 6,
        title: '南山徒步之旅',
        description: '协会组织的团建活动，加强成员间的交流与合作',
        date: '2021-10-15',
        category: 'trip',
        year: '2021',
        coverUrl: 'https://picsum.photos/id/120/600/400',
        images: [
          { url: 'https://picsum.photos/id/121/1200/800', description: '出发前合影' },
          { url: 'https://picsum.photos/id/122/1200/800', description: '山路徒步中' },
          { url: 'https://picsum.photos/id/123/1200/800', description: '山顶野餐' },
          { url: 'https://picsum.photos/id/124/1200/800', description: '小组互动游戏' },
          { url: 'https://picsum.photos/id/125/1200/800', description: '夕阳美景' }
        ]
      },
      {
        id: 7,
        title: '人工智能讲座',
        description: '邀请AI领域专家分享最新技术趋势与应用案例',
        date: '2021-05-20',
        category: 'workshop',
        year: '2021',
        coverUrl: 'https://picsum.photos/id/140/600/400',
        images: [
          { url: 'https://picsum.photos/id/141/1200/800', description: '专家演讲' },
          { url: 'https://picsum.photos/id/142/1200/800', description: 'AI项目案例展示' },
          { url: 'https://picsum.photos/id/143/1200/800', description: '学生提问环节' },
          { url: 'https://picsum.photos/id/144/1200/800', description: '会后交流' }
        ]
      },
      {
        id: 8,
        title: '毕业季欢送会',
        description: '为毕业班协会成员举办的欢送活动，分享四年成长与收获',
        date: '2021-06-15',
        category: 'activity',
        year: '2021',
        coverUrl: 'https://picsum.photos/id/160/600/400',
        images: [
          { url: 'https://picsum.photos/id/161/1200/800', description: '毕业生分享感言' },
          { url: 'https://picsum.photos/id/162/1200/800', description: '老师们的祝福' },
          { url: 'https://picsum.photos/id/163/1200/800', description: '协会纪念品赠送' },
          { url: 'https://picsum.photos/id/164/1200/800', description: '欢送晚会表演' },
          { url: 'https://picsum.photos/id/165/1200/800', description: '全体合影留念' }
        ]
      }
    ]);
    
    // 筛选相册
    const filteredAlbums = computed(() => {
      return albums.value.filter(album => {
        // 分类筛选
        if (selectedCategory.value && album.category !== selectedCategory.value) {
          return false;
        }
        
        // 年份筛选
        if (selectedYear.value && album.year !== selectedYear.value) {
          return false;
        }
        
        // 搜索文本
        if (searchText.value) {
          const searchLower = searchText.value.toLowerCase();
          return album.title.toLowerCase().includes(searchLower) || 
                 album.description.toLowerCase().includes(searchLower) ||
                 album.images.some(img => img.description.toLowerCase().includes(searchLower));
        }
        
        return true;
      });
    });
    
    // 当前灯箱显示的图片
    const currentLightboxImage = computed(() => {
      return lightboxImages.value[currentImageIndex.value] || { url: '', description: '' };
    });
    
    // 查看相册详情
    const viewAlbumDetails = (album: Album) => {
      currentAlbum.value = album;
      window.scrollTo(0, 0); // 滚动到页面顶部
    };
    
    // 打开灯箱
    const openLightbox = (images: GalleryImage[], index: number) => {
      lightboxImages.value = images;
      currentImageIndex.value = index;
      showLightbox.value = true;
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    };
    
    // 关闭灯箱
    const closeLightbox = () => {
      showLightbox.value = false;
      document.body.style.overflow = ''; // 恢复背景滚动
    };
    
    // 下一张图片
    const nextImage = () => {
      if (currentImageIndex.value < lightboxImages.value.length - 1) {
        currentImageIndex.value++;
      } else {
        currentImageIndex.value = 0; // 循环到第一张
      }
    };
    
    // 上一张图片
    const prevImage = () => {
      if (currentImageIndex.value > 0) {
        currentImageIndex.value--;
      } else {
        currentImageIndex.value = lightboxImages.value.length - 1; // 循环到最后一张
      }
    };
    
    // 键盘导航
    const handleKeydown = (e: KeyboardEvent) => {
      if (!showLightbox.value) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    
    // 添加键盘事件监听
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
    
    return {
      searchText,
      selectedCategory,
      selectedYear,
      albums,
      filteredAlbums,
      currentAlbum,
      showLightbox,
      lightboxImages,
      currentImageIndex,
      currentLightboxImage,
      getCategoryName,
      viewAlbumDetails,
      openLightbox,
      closeLightbox,
      nextImage,
      prevImage
    };
  }
});
</script>

<style scoped>
.gallery-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-header {
  text-align: center;
  margin-bottom: 40px;
}

.gallery-title {
  color: #1e40af;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.gallery-subtitle {
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.1rem;
}

/* 筛选区域 */
.gallery-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 8px;
  color: #4b5563;
}

.filter-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  min-width: 120px;
}

.search-group {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

/* 相册容器 */
.album-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.album-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.album-cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3/2;
}

.album-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.album-card:hover .album-img {
  transform: scale(1.05);
}

.album-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.album-title {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.album-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 相册详情页 */
.album-details {
  margin-bottom: 40px;
}

.details-header {
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: transparent;
  color: #1e40af;
  border: 1px solid #1e40af;
  padding: 8px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #1e40af;
  color: white;
}

.details-title {
  color: #1e3a8a;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.details-description {
  color: #4b5563;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.details-meta {
  display: flex;
  gap: 15px;
  color: #6b7280;
  font-size: 0.9rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  cursor: pointer;
  aspect-ratio: 1;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay-icon {
  color: white;
  font-size: 2rem;
}

.image-item:hover .gallery-image {
  transform: scale(1.05);
}

.image-item:hover .image-overlay {
  opacity: 1;
}

/* 灯箱样式 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lightbox-container {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lightbox-content {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.lightbox-caption {
  margin-top: 15px;
  color: white;
  text-align: center;
}

.lightbox-description {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.lightbox-counter {
  font-size: 0.9rem;
  opacity: 0.7;
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  background: transparent;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  top: -50px;
  right: 0;
}

.lightbox-prev {
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-next {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

/* 无相册提示 */
.no-albums {
  text-align: center;
  padding: 50px 0;
  color: #6b7280;
}

.no-albums-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .album-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .gallery-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group, .search-group {
    width: 100%;
  }
  
  .lightbox-prev {
    left: 10px;
  }
  
  .lightbox-next {
    right: 10px;
  }
}
</style>