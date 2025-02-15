<template>
  <div id="PictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!--      图片预览-->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image :src="picture.url" style="max-height: 600px; object-fit: contain"></a-image>
        </a-card>
      </a-col>
      <!--      图片信息-->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息" style="max-height: 600px">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.avatarUrl" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">{{ picture.name || '未命名' }}</a-descriptions-item>
            <a-descriptions-item label="简介">{{
              picture.introduction || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ picture.category || '默认' }}</a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-space wrap>
                <a-tag v-for="(item, index) in picture.tags" :key="index">
                  {{ item }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="格式">{{ picture.picFormat || '-' }}</a-descriptions-item>
            <a-descriptions-item label="宽度">{{ picture.picWidth || '-' }}</a-descriptions-item>
            <a-descriptions-item label="高度">{{ picture.picHeight || '-' }}</a-descriptions-item>
            <a-descriptions-item label="宽高比">{{ picture.picScale || '-' }}</a-descriptions-item>
            <a-descriptions-item label="大小">{{
              formatSize(picture.picSize)
            }}</a-descriptions-item>
          </a-descriptions>
          <a-space wrap>
            <a-button type="primary" @click="onDownload">
              <template #icon> <DownloadOutlined /> </template>免费下载</a-button
            >
            <a-button
              v-if="canEdit"
              :icon="h(EditOutlined)"
              type="default"
              @click="doEdit"
              target="_blank"
              >编辑</a-button
            >
            <a-button v-if="canEdit" :icon="h(DeleteOutlined)" danger @click="doDelete(picture.id)"
              >删除</a-button
            >
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, h, computed } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { formatSize, downloadImage } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
const router = useRouter()
interface Props {
  id: string | number
}
const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})

const loginUserStore = useLoginUserStore()

const canEdit = computed(() => {
  if (!loginUserStore.loginUser.id) {
    return false
  }
  return (
    loginUserStore.loginUser.id === picture.user?.id ||
    loginUserStore.loginUser.userRole === 'admin'
  )
})
const fetchPictureDetail = async () => {
  const res = await getPictureVoByIdUsingPost({
    id: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    picture.value = res.data.data
  } else {
    message.error('获取图片详情失败！' + res.data.message)
  }
}

const doEdit = () => {
  router.push('/add_picture?id=' + picture.value.id)
}

const onDownload = () => {
  downloadImage(picture.value.url, picture.value.name)
}

const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({
    id,
  })
  if (res.data.code === 0) {
    message.success('删除成功！')
    await fetchData()
  } else {
    message.error('删除失败！' + res.data.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#PictureDetailPage {
}
</style>
