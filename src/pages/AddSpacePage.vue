<template>
  <div id="AddSpacePage">
    <!--    标题-->
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
    </h2>
    <!--    空间信息表单-->
    <a-form
      :model="spaceForm"
      layout="vertical"
      name="spaceForm"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="spaceName">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
          style="min-width: 180px"
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">{{
          route.query?.id ? '修改' : '创建'
        }}</a-button>
      </a-form-item>
    </a-form>
    <!--    空间级别介绍-->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="/" target="_blank">苏佰侨</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}：大小 {{ formatSize(spaceLevel.maxSize) }}，数量
        {{ spaceLevel.maxCount }}张
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  updateSpaceUsingPost,
  getSpaceVoByIdUsingPost,
  listSpaceLevelUsingGet,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constant/space.ts'
import { formatSize } from '../utils'
const router = useRouter()
const route = useRoute()
const space = ref<API.SpaceVO>({})
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({})
const loading = ref(false)

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 空间类别 默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query?.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const handleSubmit = async (values: API.SpaceAddRequest | API.SpaceUpdateRequest) => {
  loading.value = true
  const spaceId = space.value?.id
  let res
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...values,
    })
  } else {
    res = await addSpaceUsingPost({
      ...values,
      spaceType: spaceType.value,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败！' + res.data.message)
  }
  loading.value = false
}

const getOldSpace = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingPost({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
      spaceForm.spaceName = space.value.spaceName
      spaceForm.spaceLevel = space.value.spaceLevel
    }
  }
}

const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('空间级别介绍获取失败！' + res.data.message)
  }
}

onMounted(() => {
  getOldSpace()
  fetchSpaceLevelList()
})
</script>

<style scoped>
#AddSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
