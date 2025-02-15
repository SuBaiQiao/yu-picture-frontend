<template>
  <div id="userManagePage">
    <!--    搜索表单-->
    <a-form layout="inline" :model="searchParam" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParam.userAccount" placeholder="请输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParam.userName" placeholder="请输入用户名" allow-clear />
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
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="120" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <a-tag :color="record.userRole === 'admin' ? 'green' : 'blue'">
            {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button danger size="small" @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserByPageUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '账号', dataIndex: 'userAccount' },
  { title: '用户名', dataIndex: 'userName' },
  { title: '头像', dataIndex: 'userAvatar' },
  { title: '简介', dataIndex: 'userProfile' },
  { title: '用户角色', dataIndex: 'userRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const searchParam = reactive<API.UserQueryRequest>({
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
  const res = await listUserByPageUsingPost({
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
  const res = await deleteUserUsingPost({
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
#userManagePage {
}
</style>
