<template>
  <div class="space-category-analyze">
    <a-card title="空间图片分类分析">
      <v-chart
        :option="options"
        style="height: 320px; max-width: 100%"
        :loading="loading"
      ></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { formatSize } from '@/utils'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})
const dataList = ref<API.SpaceCategoryAnalyzeResponse[]>([])

const options = computed(() => {
  const categories = dataList.value.map((item) => item.category)
  const countData = dataList.value.map((item) => item.count)
  const sizeData = dataList.value.map((item) => (item.totalSize / (1024 * 1024)).toFixed(2)) // 转为 MB

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['图片数量', '图片总大小'], top: 'bottom' },
    xAxis: { type: 'category', data: categories },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        axisLine: { show: true, lineStyle: { color: '#5470C6' } }, // 左轴颜色
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#91CC75' } }, // 右轴颜色
        splitLine: {
          lineStyle: {
            color: '#91CC75', // 调整网格线颜色
            type: 'dashed', // 线条样式：可选 'solid', 'dashed', 'dotted'
          },
        },
      },
    ],
    series: [
      { name: '图片数量', type: 'bar', data: countData, yAxisIndex: 0 },
      { name: '图片总大小', type: 'bar', data: sizeData, yAxisIndex: 1 },
    ],
  }
})

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceCategoryAnalyzeUsingPost({
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data
  } else {
    message.error('数据获取失败！' + res.data.message)
  }
  loading.value = false
}

watchEffect(() => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped></style>
