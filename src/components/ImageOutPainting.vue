<template>
  <a-modal
    class="image-out-painting"
    v-model:open="visible"
    :title="'AI 扩图'"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" alt="原始图片" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img v-if="resultImageUrl" :src="resultImageUrl" alt="扩图结果" style="max-width: 100%" />
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px"></div>
    <a-flex justify="center" gap="16">
      <a-button type="primary" :loading="!!taskId" ghost @click="createTask">生成图片</a-button>
      <a-button v-if="resultImageUrl" type="primary" :loading="uploadLoading" @click="handleUpload"
        >应用结果</a-button
      >
    </a-flex>
  </a-modal>
</template>
<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingPost,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
}

const props = defineProps<Props>()

const visible = ref(false)
const loading = ref(false)
const uploadLoading = ref(false)
const resultImageUrl = ref<string>('')
const taskId = ref<string>()

const showModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

const pollingTimer = ref<NodeJS.Timeout>()

/**
 * 开始轮询
 */
const startPolling = () => {
  if (!taskId.value) return
  pollingTimer.value = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingPost({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          // 任务完成
          message.success('扩图任务完成！')
          resultImageUrl.value = taskResult.outputImageUrl
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          message.error('扩图任务失败！')
          clearPolling()
        }
      } else {
        message.error('扩图任务查询失败！' + res.data.message)
        clearPolling()
      }
    } catch (error) {
      message.error('轮询失败！' + error)
      clearPolling()
    }
  }, 3000)
}

const clearPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
    taskId.value = null
  }
}

const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  loading.value = true
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    console.log(res.data.data.output.taskId)
    taskId.value = res.data.data.output.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('创建任务失败！' + res.data.message)
  }
  loading.value = false
}

/**
 * 上传图片
 */
const handleUpload = async () => {
  uploadLoading.value = true
  const params: API.PictureUpdateRequest = {
    fileUrl: resultImageUrl.value,
    spaceId: props.picture?.spaceId,
  }
  if (props.picture) {
    params.id = props.picture.id
  }
  const res = await uploadPictureByUrlUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    message.success('图片上传成功')
    // 将上传成功的信息传递给父组件
    props.onSuccess?.(res.data.data)
  } else {
    message.error('图片上传失败！' + res.data.message)
  }
  uploadLoading.value = false
}

defineExpose({
  showModal,
  closeModal,
})

onUnmounted(() => {
  clearPolling()
})
</script>

<style scoped>
.image-out-painting {
  text-align: center;
}
</style>
