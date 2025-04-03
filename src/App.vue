<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout></BasicLayout>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

// import { healthUsingGet } from '@/api/mainController.ts'
// import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
//
// const loginUserStore = useLoginUserStore()
// loginUserStore.fetchLoginUser()
// healthUsingGet().then((response) => {
//   console.log(response)
// })
</script>

<style scoped></style>
