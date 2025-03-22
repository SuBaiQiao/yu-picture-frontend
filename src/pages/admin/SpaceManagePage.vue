<template>
  <div id="spaceManagePage">
    <!--    操作按钮-->
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
        <a-button
          :icon="h(BarChartOutlined)"
          type="primary"
          ghost
          :href="`/space_analyze?queryAll=1`"
          target="_blank"
          >全空间分析</a-button
        >
        <a-button
          :icon="h(BarChartOutlined)"
          type="primary"
          ghost
          :href="`/space_analyze?queryPublic=1`"
          target="_blank"
          >公共图库分析</a-button
        >
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!--    搜索表单-->
    <a-form layout="inline" :model="searchParam" @finish="doSearch">
      <a-form-item label="空间名称">
        <a-input v-model:value="searchParam.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="searchParam.spaceLevel"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
          style="min-width: 180px"
        ></a-select>
      </a-form-item>
      <a-form-item label="空间类别" name="spaceType">
        <a-select
          v-model:value="searchParam.spaceType"
          placeholder="请选择空间类别"
          :options="SPACE_TYPE_OPTIONS"
          allow-clear
          style="min-width: 180px"
        ></a-select>
      </a-form-item>
      <a-form-item label="用户ID">
        <a-input v-model:value="searchParam.userId" placeholder="请输入用户ID" allow-clear />
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
        <template v-if="column.dataIndex === 'spaceType'">
          {{ SPACE_TYPE_MAP[record.spaceType] }}
        </template>
        <template v-if="column.dataIndex === 'spaceLevel'">
          {{ SPACE_LEVEL_MAP[record.spaceLevel] }}
        </template>
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>容量：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              :icon="h(BarChartOutlined)"
              type="link"
              :href="`/space_analyze?spaceId=${record.id}`"
              target="_blank"
              >分析</a-button
            >
            <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank"
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
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constant/space.ts'
import { formatSize } from '../../utils'
import { BarChartOutlined } from '@ant-design/icons-vue'
const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '空间名称', dataIndex: 'spaceName' },
  { title: '空间类别', dataIndex: 'spaceType' },
  { title: '空间级别', dataIndex: 'spaceLevel' },
  { title: '使用情况', dataIndex: 'spaceUseInfo' },
  { title: '用户ID', dataIndex: 'userId', width: 80 },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '编辑时间', dataIndex: 'editTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.SpaceVO[]>([])
const total = ref(0)
const searchParam = reactive<API.SpaceQueryRequest>({
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
  const res = await listSpaceByPageUsingPost({
    ...searchParam,
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
  const res = await deleteSpaceUsingPost({
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
  fetchData()
})
</script>

<style scoped>
#spaceManagePage {
  margin-bottom: 16px;
}
</style>
