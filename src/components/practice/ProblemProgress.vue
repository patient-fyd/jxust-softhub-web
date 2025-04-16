<template>
  <div class="problem-progress">
    <div class="progress-title">刷题进度</div>
    <div class="progress-circle">
      <div class="total-count">{{ total }}</div>
      <div class="progress-label">总题数</div>
    </div>
    
    <div class="progress-stats">
      <div class="stat-item">
        <div class="stat-value">{{ easy }}</div>
        <div class="stat-tag easy">简单</div>
        <div class="stat-percent">{{ calculatePercent(easy, total) }}%</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-value">{{ medium }}</div>
        <div class="stat-tag medium">中等</div>
        <div class="stat-percent">{{ calculatePercent(medium, total) }}%</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-value">{{ hard }}</div>
        <div class="stat-tag hard">困难</div>
        <div class="stat-percent">{{ calculatePercent(hard, total) }}%</div>
      </div>
    </div>
    
    <div class="progress-bars">
      <div class="progress-bar-container">
        <div class="label">已解决 ({{ solvedCount }})</div>
        <div class="progress-bar">
          <div class="progress-bar-inner" :style="{width: `${calculatePercent(solvedCount, total)}%`}"></div>
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="label">尝试中 ({{ attemptedCount }})</div>
        <div class="progress-bar">
          <div class="progress-bar-inner attempted" :style="{width: `${calculatePercent(attemptedCount, total)}%`}"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { Problem } from '../../services/ProblemService';

export default defineComponent({
  name: 'ProblemProgress',
  props: {
    problems: {
      type: Array as () => Problem[],
      required: true
    }
  },
  setup(props) {
    // 计算总题数
    const total = computed(() => props.problems.length);
    
    // 计算已解决题目数量
    const solvedCount = computed(() => 
      props.problems.filter(p => p.status === 'solved').length
    );
    
    // 计算尝试中题目数量
    const attemptedCount = computed(() => 
      props.problems.filter(p => p.status === 'attempted').length
    );
    
    // 计算各难度题目数量
    const easy = computed(() => 
      props.problems.filter(p => p.difficulty === 'easy').length
    );
    
    const medium = computed(() => 
      props.problems.filter(p => p.difficulty === 'medium').length
    );
    
    const hard = computed(() => 
      props.problems.filter(p => p.difficulty === 'hard').length
    );
    
    // 计算百分比
    const calculatePercent = (part: number, whole: number) => {
      if (whole === 0) return 0;
      return Math.round((part / whole) * 100);
    };
    
    return {
      total,
      solvedCount,
      attemptedCount,
      easy,
      medium,
      hard,
      calculatePercent
    };
  }
});
</script>

<style scoped>
.problem-progress {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.progress-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4785ff, #6c5ce7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 4px 10px rgba(71, 133, 255, 0.3);
}

.total-count {
  font-size: 26px;
  font-weight: 700;
}

.progress-label {
  font-size: 14px;
  opacity: 0.9;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 5px 0;
  color: white;
}

.stat-tag.easy {
  background-color: #4caf50;
}

.stat-tag.medium {
  background-color: #ff9800;
}

.stat-tag.hard {
  background-color: #f44336;
}

.stat-percent {
  font-size: 12px;
  color: #666;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar-container {
  width: 100%;
}

.label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.progress-bar {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(to right, #4785ff, #6c5ce7);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-bar-inner.attempted {
  background: linear-gradient(to right, #ffa726, #fb8c00);
}
</style> 