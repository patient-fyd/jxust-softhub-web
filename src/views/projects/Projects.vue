<template>
  <PageUnderConstruction pageName="项目展示" description="我们正在整理社团历年项目成果，将很快展示给大家！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'Projects',
  components: {
    PageUnderConstruction
  }
});
</script> 