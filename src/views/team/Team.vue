<template>
  <PageUnderConstruction pageName="团队介绍" description="我们正在整理社团核心团队成员的信息和贡献，即将与大家见面！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'Team',
  components: {
    PageUnderConstruction
  }
});
</script> 