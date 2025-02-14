import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('counter', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  /**
   * 获取登录用户信息
   */
  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
  }

  /**
   * 设置登录用户
   * @param user
   */
  function setLoginUser(user: API.LoginUserVO) {
    loginUser.value = user
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})

// 一个状态就存储一类要共享的数据（存一类常量）
// 定义状态的初始值
// 定义变量的计算逻辑 getter
// 定义怎么更改状态
// 返回
