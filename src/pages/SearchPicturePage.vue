<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin-bottom: 16px">原图</h3>
    <a-card hoverable style="width: 240px">
      <template #cover>
        <img
          :alt="picture.name"
          :src="picture.thumbnailUrl || picture.url"
          style="height: 180px; object-fit: cover"
        />
      </template>
    </a-card>
    <h3 style="margin: 16px 0">识图结果</h3>
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a :href="picture.fromUrl" target="_blank">
            <a-card hoverable>
              <template #cover>
                <img
                  :alt="picture.fromUrl"
                  :src="picture.thumbUrl || picture.fromUrl"
                  style="height: 180px; object-fit: cover"
                />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  getPictureVoByIdUsingPost,
  searchPictureByPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const pictureId = computed(() => {
  return route.query?.pictureId
})
const picture = ref<API.PictureVO>({})
const loading = ref<boolean>(false)
const fetchPictureDetail = async () => {
  const res = await getPictureVoByIdUsingPost({
    id: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    picture.value = res.data.data
  } else {
    message.error('获取图片详情失败！' + res.data.message)
  }
}

const dataList = ref<API.ImageSearchResult[]>([])

const fetchResultData = async () => {
  loading.value = true
  const res = await searchPictureByPictureUsingPost({
    pictureId: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data
  } else {
    message.error('获取图片失败！' + res.data.message)
  }
  loading.value = false
}

onMounted(() => {
  fetchPictureDetail()
  fetchResultData()
})
</script>

<style scoped>
#PictureDetailPage {
}
</style>
