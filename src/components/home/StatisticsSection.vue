<template>
  <div class="statistics-section">
    <h2 class="section-title">数据统计</h2>
    <div class="statistics-grid">
      <div class="statistic-card">
        <div class="statistic-icon">
          <i class="icon-user"></i>
        </div>
        <div class="statistic-info">
          <div class="statistic-value">{{ formatNumber(memberCount) }}</div>
          <div class="statistic-label">成员人数</div>
        </div>
      </div>
      
      <div class="statistic-card">
        <div class="statistic-icon">
          <i class="icon-code"></i>
        </div>
        <div class="statistic-info">
          <div class="statistic-value">{{ formatNumber(projectCount) }}</div>
          <div class="statistic-label">进行中项目</div>
        </div>
      </div>
      
      <div class="statistic-card">
        <div class="statistic-icon">
          <i class="icon-check"></i>
        </div>
        <div class="statistic-info">
          <div class="statistic-value">{{ formatNumber(completedProjects) }}</div>
          <div class="statistic-label">已完成项目</div>
        </div>
      </div>
      
      <div class="statistic-card">
        <div class="statistic-icon">
          <i class="icon-certificate"></i>
        </div>
        <div class="statistic-info">
          <div class="statistic-value">{{ formatNumber(certifications) }}</div>
          <div class="statistic-label">获得证书</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'StatisticsSection',
  setup() {
    const memberCount = ref(120);
    const projectCount = ref(25);
    const completedProjects = ref(38);
    const certifications = ref(64);

    // 数字格式化函数，添加千位分隔符
    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 模拟从API获取统计数据
    const fetchStatistics = async () => {
      try {
        // 在实际应用中，这里应该调用API获取真实数据
        // const response = await api.getStatistics();
        // memberCount.value = response.data.memberCount;
        // projectCount.value = response.data.projectCount;
        // completedProjects.value = response.data.completedProjects;
        // certifications.value = response.data.certifications;
        
        // 目前使用模拟数据
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    onMounted(() => {
      fetchStatistics();
    });

    return {
      memberCount,
      projectCount,
      completedProjects,
      certifications,
      formatNumber
    };
  }
});
</script>

<style scoped>
.statistics-section {
  margin: 40px 0;
  padding: 30px;
  background-color: #f9fafb;
  border-radius: 12px;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  color: #1e40af;
  margin-bottom: 30px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 60px;
  height: 3px;
  background-color: #1e40af;
  transform: translateX(-50%);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.statistic-card {
  background-color: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.statistic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.statistic-icon {
  background-color: #e0e7ff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #1e40af;
  font-size: 24px;
}

.statistic-info {
  flex: 1;
}

.statistic-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e40af;
  line-height: 1.2;
}

.statistic-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Icon classes - these would be replaced with your icon library */
.icon-user:before { content: "👥"; }
.icon-code:before { content: "💻"; }
.icon-check:before { content: "✅"; }
.icon-certificate:before { content: "🏆"; }

/* Responsive styles */
@media (max-width: 1024px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
  
  .statistic-card {
    padding: 20px;
  }
  
  .statistic-value {
    font-size: 1.5rem;
  }
}
</style> 