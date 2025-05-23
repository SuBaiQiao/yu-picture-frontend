<template>
  <div class="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="@/assets/logo.png" alt="logo" />
            <div class="title">云图库</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          @click="doMenuClick"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
        />
      </a-col>

      <!--      用户信息展示栏-->
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar"></a-avatar>
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="/my_space"> <UserOutlined /> 我的空间 </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/user_exchange_vip"> <CrownOutlined /> 兑换会员 </router-link>
                  </a-menu-item>
                  <a-menu-item @click="doLogout"> <LoginOutlined /> 退出登录 </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { h, ref, onBeforeMount, computed } from 'vue'
import { HomeOutlined, LoginOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['/'])
const originItems = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://www.baidu.com', target: '_blank' }, '百度'),
    title: '百度',
  },
])

/**
 * 菜单过滤器
 * @param menus
 */
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}
/**
 * 展示的菜单
 */
const items = computed(() => {
  return filterMenus(originItems.value)
})

const router = useRouter()

const doMenuClick = ({ key }: any) => {
  router.push({
    path: key,
  })
}

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登陆成功！')
    await router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('退出登陆失败！' + res.data.message)
  }
}

onBeforeMount(() => {
  router.afterEach((to, from, next) => {
    current.value = [to.path]
  })
})
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px !important;
}
</style>
