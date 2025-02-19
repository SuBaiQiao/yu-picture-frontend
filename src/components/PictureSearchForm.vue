<template>
  <div class="picture-search-form">
    <!--    搜索表单-->
    <a-form layout="inline" :model="searchParam" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParam.searchText"
          placeholder="从名称或简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="searchParam.category"
          :options="categoryList"
          style="min-width: 180px"
          placeholder="请输入分类"
          allow-clear
        ></a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParam.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          style="min-width: 180px"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item label="日期" name="dataRange">
        <a-range-picker
          style="width: 400px"
          show-time
          v-model:value="dataRange"
          format="YYYY/MM/DD HH:mm:ss"
          :presets="rangePresets"
          @change="onRangeChange"
          :placeholder="['编辑开始时间', '编辑结束时间']"
        />
      </a-form-item>
      <a-form-item label="名称" name="name">
        <a-input v-model:value="searchParam.name" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-input v-model:value="searchParam.introduction" placeholder="请输入简介" allow-clear />
      </a-form-item>
      <a-form-item label="宽度" name="picWidth">
        <a-input-number v-model:value="searchParam.picWidth" placeholder="请输入宽度" allow-clear />
      </a-form-item>
      <a-form-item label="高度" name="picHeight">
        <a-input-number
          v-model:value="searchParam.picHeight"
          placeholder="请输入高度"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="格式" name="picFormat">
        <a-input v-model:value="searchParam.picFormat" placeholder="请输入格式" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" style="width: 96px">搜索</a-button>
          <a-button html-type="reset" @click="doClear">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { onMounted, reactive, ref } from 'vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
interface Props {
  onSearch?: (searchParam: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()
const searchParam = reactive<API.PictureQueryRequest>({})
const dataRange = ref<[]>()

const categoryList = ref<{ label: string; value: string }[]>([])
const tagOptions = ref<{ label: string; value: string }[]>([])

/**
 * 获取标签和分类选项
 */
const getCategoryAndTagOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = (res.data.data.categoryList ?? []).map((data) => {
      return {
        value: data,
        label: data,
      }
    })
    tagOptions.value = (res.data.data.tagList ?? []).map((data) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类列表失败！' + res.data.message)
  }
}

/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: Date[], dateStrings: string[]) => {
  searchParam.startEditTime = undefined
  searchParam.endEditTime = undefined
  if (dates && dates.length === 2) {
    searchParam.startEditTime = dates[0].toDate()
    searchParam.endEditTime = dates[1].toDate()
  }
}

// 时间范围选择
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

const doSearch = () => {
  props.onSearch?.(searchParam)
}

const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParam).forEach((key) => {
    searchParam[key] = undefined
  })
  dataRange.value = []
  doSearch()
}

onMounted(() => {
  getCategoryAndTagOptions()
})
</script>

<style scoped>
.picture-search-form {
  margin-top: 16px;
}
</style>
