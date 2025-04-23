<template>
  <PageUnderConstruction pageName="关于我们" description="我们正在精心准备关于软件社团的详细介绍，即将呈现给大家！" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PageUnderConstruction from '../../components/common/PageUnderConstruction.vue';

export default defineComponent({
  name: 'About',
  components: {
    PageUnderConstruction
  }
});
</script> 