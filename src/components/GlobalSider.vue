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
import { h, ref, onBeforeMount, computed, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'
const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['/'])
const fixedMenuItems = [
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
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    icon: () => h(TeamOutlined),
    label: '创建团队',
  },
]
const teamSpaceList = ref<API.SpaceUserVO[]>([])

const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    return {
      key: '/space/' + spaceUser.spaceId,
      label: spaceUser.space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '团队空间',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

const router = useRouter()

const doMenuClick = ({ key }: any) => {
  router.push(key)
}

watchEffect(() => {
  if (loginUserStore.loginUser?.id) {
    fetchTeamSpaceList()
  }
})

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
