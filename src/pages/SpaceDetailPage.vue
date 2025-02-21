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
    <!--    搜索表单-->
    <PictureSearchForm :on-search="onSearch"></PictureSearchForm>
    <div style="margin-bottom: 16px"></div>
    <a-form-item label="按颜色搜索">
      <ColorPicker format="hex" @pureColorChange="onColorChange"></ColorPicker>
    </a-form-item>
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
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

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
const searchParam = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const onPageChange = (page: number, pageSize: number) => {
  searchParam.value.current = page
  searchParam.value.pageSize = pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParam.value,
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

const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    spaceId: props.id,
    picColor: color,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
    total.value = res.data.data.length ?? 0
  } else {
    message.error('获取数据失败！' + res.data.message)
  }
  loading.value = false
}

const onSearch = (newSearchParam: API.PictureQueryRequest) => {
  searchParam.value = {
    ...searchParam.value,
    ...newSearchParam,
    current: 1,
  }
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchSpaceDetail()
})
</script>

<style scoped>
#SpaceDetailPage {
}
</style>
