import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// 一个状态就存储一类要共享的数据（存一类常量）
// 定义状态的初始值
// 定义变量的计算逻辑 getter
// 定义怎么更改状态
// 返回
