<template>
  <div id="pictureManagePage">
    <!--    操作按钮-->
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-space>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
          >+ 批量创建图片</a-button
        >
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!--    搜索表单-->
    <a-form layout="inline" :model="searchParam" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParam.searchText"
          placeholder="从名称或简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParam.category" placeholder="请输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="searchParam.tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParam.reviewStatus"
          placeholder="请输入标签"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          allow-clear
          style="min-width: 180px"
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px"></div>
    <!--    表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" />
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="item in JSON.parse(record.tags || '[]')" :key="item">
              {{ item }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }} KB</div>
        </template>
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>
            <span>审核状态：</span>
            <!--            {{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}-->
            <a-badge v-if="record.reviewStatus === 0" color="blue" text="审核中" />
            <a-badge v-if="record.reviewStatus === 1" color="green" text="通过" />
            <a-badge v-if="record.reviewStatus === 2" color="red" text="拒绝" />
          </div>
          <div v-if="record.reviewMessage">审核信息：{{ record.reviewMessage }}</div>
          <div v-if="record.reviewerId">审核人：{{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              type="link"
              size="small"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >通过</a-button
            >
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link"
              size="small"
              danger
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >拒绝</a-button
            >
            <a-button
              type="link"
              size="small"
              :href="`/add_picture?id=${record.id}`"
              target="_blank"
              >编辑</a-button
            >
            <a-button danger size="small" @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doReviewPictureUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constant/picture.ts'
const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '图片', dataIndex: 'url', width: 140 },
  { title: '名称', dataIndex: 'name' },
  { title: '简介', dataIndex: 'introduction', ellipsis: true },
  { title: '类型', dataIndex: 'category' },
  { title: '标签', dataIndex: 'tags' },
  { title: '图片信息', dataIndex: 'picInfo' },
  { title: '用户ID', dataIndex: 'userId', width: 80 },
  { title: '审核信息', dataIndex: 'reviewMessage' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '编辑时间', dataIndex: 'editTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const searchParam = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
})

const pagination = computed(() => {
  return {
    current: searchParam.current,
    pageSize: searchParam.pageSize,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      searchParam.current = page
      searchParam.pageSize = pageSize
      fetchData()
    },
  }
})

const doTableChange = (page: any) => {
  searchParam.current = page.current
  searchParam.pageSize = page.pageSize
  fetchData()
}

const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParam,
    nullSpaceId: true,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败！' + res.data.message)
  }
}

const doSearch = () => {
  searchParam.current = 1
  fetchData()
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

const handleReview = async (record: API.PictureVO, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doReviewPictureUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功！')
    await fetchData()
  } else {
    message.error('审核操作失败！' + res.data.message)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#pictureManagePage {
  margin-bottom: 16px;
}
</style>
