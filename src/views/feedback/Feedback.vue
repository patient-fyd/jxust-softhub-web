<template>
  <PageUnderConstruction pageName="意见反馈" description="我们正在开发用户反馈系统，很快就能听取您的宝贵意见！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'Feedback',
  components: {
    PageUnderConstruction
  }
});
</script> 