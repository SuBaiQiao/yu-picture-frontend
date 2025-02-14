import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('counter', () => {
  const loginUser = ref<any>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    // 由于后端目前没有提供接口
    // const res = await getCurrentUser()
    // if (res.data.code === 0 && res.data.data) {
    //   loginUser.value = res.data.data
    // }
    setTimeout(() => {
      loginUser.value = { userName: '测试用户', id: 1 }
    }, 3000)
  }

  /**
   * 设置登录用户
   * @param user
   */
  function setLoginUser(user: any) {
    loginUser.value = user
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})

// 一个状态就存储一类要共享的数据（存一类常量）
// 定义状态的初始值
// 定义变量的计算逻辑 getter
// 定义怎么更改状态
// 返回
