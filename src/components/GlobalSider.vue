<template>
  <div class="globalSider">
    <a-layout-sider
      width="200"
      v-if="loginUserStore.loginUser?.id"
      breakpoint="lg"
      collapsed-width="0"
    >
      <a-menu
        v-model:selected-keys="current"
        mode="inline"
        @click="doMenuClick"
        :items="menuItems"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { h, ref, onBeforeMount } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['/'])
const menuItems = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
  },
])

const router = useRouter()

const doMenuClick = ({ key }: any) => {
  router.push({
    path: key,
  })
}

onBeforeMount(() => {
  router.afterEach((to, from, next) => {
    current.value = [to.path]
  })
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}
</style>
