<template>
  <PageUnderConstruction pageName="图片库" description="我们正在精心筹备社团活动照片集，敬请期待精彩瞬间的展示！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'Gallery',
  components: {
    PageUnderConstruction
  }
});
</script> 