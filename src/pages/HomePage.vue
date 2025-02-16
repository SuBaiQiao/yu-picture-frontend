<template>
  <div id="homePage">
    <!--    搜索框-->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParam.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      ></a-input-search>
    </div>
    <!--    分类和标签筛选-->
    <a-tabs v-model:active-key="selectCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部"></a-tab-pane>
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category"></a-tab-pane>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!--    图片列表-->
    <PictureList :data-list="dataList" :loading="loading"></PictureList>
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
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageCacheMultiUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'

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
    tags: [] as string[],
  }
  if (selectCategory.value !== 'all') {
    params.category = selectCategory.value
  }
  selectTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags?.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageCacheMultiUsingPost(params)
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

const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref<string>('all')
const selectTagList = ref<boolean[]>([])

/**
 * 获取标签和分类选项
 */
const getCategoryAndTagOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('获取标签分类列表失败！' + res.data.message)
  }
}

onMounted(() => {
  doSearch()
  getCategoryAndTagOptions()
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}
#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .tag-bar {
  margin-bottom: 16px;
}
</style>
