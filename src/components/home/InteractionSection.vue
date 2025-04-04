<template>
  <div class="interaction-section">
    <div v-for="item in interactionItems" :key="item.title" class="interaction-card">
      <div class="interaction-icon">{{ item.icon }}</div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <router-link :to="item.link" class="interaction-btn">{{ item.buttonText }}</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { InteractionItem } from '../../types/home';

export default defineComponent({
  name: 'InteractionSection',
  props: {
    interactionItems: {
      type: Array as PropType<InteractionItem[]>,
      default: () => [
        {
          icon: '💬',
          title: '留言板',
          description: '有问题？有建议？在这里留言与我们交流',
          link: '/forum',
          buttonText: '去留言'
        },
        {
          icon: '❓',
          title: '常见问题',
          description: '查看关于协会的常见问题解答',
          link: '/faq',
          buttonText: '查看FAQ'
        }
      ]
    }
  }
});
</script>

<style scoped>
.interaction-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.interaction-card {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  text-align: center;
}

.interaction-card:hover {
  transform: translateY(-5px);
}

.interaction-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.interaction-card h3 {
  color: #1e40af;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.interaction-card p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
}

.interaction-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #1e40af;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.interaction-btn:hover {
  background-color: #1e3a8a;
}

@media (max-width: 768px) {
  .interaction-section {
    grid-template-columns: 1fr;
  }
}
</style>