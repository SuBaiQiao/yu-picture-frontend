<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析">
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
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
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
const dataList = ref<API.SpaceSizeAnalyzeResponse[]>([])

const options = computed(() => {
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
      },
    ],
  }
})

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceSizeAnalyzeUsingPost({
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
