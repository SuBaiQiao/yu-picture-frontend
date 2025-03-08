<template>
  <div class="space-user-analyze">
    <a-flex gap="middle">
      <a-card title="存储空间" style="width: 50%">
        <div style="height: 320px; text-align: center">
          <h3>
            {{ formatSize(data.usedSize) }} / {{ data.maxSize ? formatSize(data.maxSize) : '无限' }}
          </h3>
          <a-progress type="dashboard" :percent="data.sizeUsageRatio ?? 0" />
        </div>
      </a-card>
      <a-card title="图片数量" style="width: 50%">
        <div style="height: 320px; text-align: center">
          <h3>{{ data.usedCount }} / {{ data.maxCount ?? '无限' }}</h3>
          <a-progress type="dashboard" :percent="data.countUsageRatio ?? 0" />
        </div>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import { formatSize } from '@/utils'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId: string | number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})
const data = ref<API.SpaceUsageAnalyzeResponse>({})

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  const res = await getSpaceUsageAnalyzeUsingPost({
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
  })
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data
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
