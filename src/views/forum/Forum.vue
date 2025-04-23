<template>
  <PageUnderConstruction pageName="社团论坛" description="我们正在开发交流讨论平台，即将为大家提供一个分享知识和经验的空间！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'Forum',
  components: {
    PageUnderConstruction
  }
});
</script> 