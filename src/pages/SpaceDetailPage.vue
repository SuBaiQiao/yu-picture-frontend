<template>
  <div id="SpaceDetailPage">
    <!--    空间信息-->
    <a-flex justify="space-between">
      <h2 style="line-height: 42px">{{ space.spaceName }}（私有空间）</h2>
      <a-space size="middle" align="center">
        <a-button type="primary" :href="`/add_picture?spaceId=${props.id}`" target="_blank"
          >+ 创建图片</a-button
        >
        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!--    图片列表-->
    <PictureList
      :data-list="dataList"
      :loading="loading"
      :showOp="true"
      :onReload="fetchData"
    ></PictureList>
    <!--    分页-->
    <a-pagination
      style="text-align: center"
      v-model:current="searchParam.current"
      v-model:page-size="searchParam.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, reactive } from 'vue'
import { getSpaceVoByIdUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  listPictureVoByPageCacheMultiUsingPost,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
const router = useRouter()
interface Props {
  id: string | number
}
const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})

const fetchSpaceDetail = async () => {
  const res = await getSpaceVoByIdUsingPost({
    id: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    space.value = res.data.data
  } else {
    message.error('获取空间详情失败！' + res.data.message)
  }
}

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const searchParam = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
})

const onPageChange = (page: number, pageSize: number) => {
  searchParam.current = page
  searchParam.pageSize = pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParam,
    spaceId: props.id,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败！' + res.data.message)
  }
  loading.value = false
}

const doSearch = () => {
  searchParam.current = 1
  fetchData()
}

onMounted(() => {
  doSearch()
  fetchSpaceDetail()
})
</script>

<style scoped>
#SpaceDetailPage {
}
</style>
