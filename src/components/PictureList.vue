<template>
  <div class="picture-list">
    <!--    图片列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl || picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">{{ picture.category || '默认' }}</a-tag>
                  <a-tag v-for="item in picture.tags" :key="item">
                    {{ item }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template #actions>
              <ShareAltOutlined key="share" @click="(e: any) => doShare(picture, e)" />
              <SearchOutlined key="search" @click="(e: any) => doSearch(picture, e)" />
              <EditOutlined key="edit" v-if="showOp" @click="(e: any) => doEdit(picture, e)" />
              <DeleteOutlined key="edit" v-if="showOp" @click="(e: any) => doDelete(picture, e)" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'
const router = useRouter()

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload: () => void
}
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
})

const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

const doEdit = (picture: API.PictureVO, e: any) => {
  // 阻止冒泡
  e.stopPropagation()
  // 跳转时携带spaceId
  router.push({
    path: `/add_picture`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

const doSearch = (picture: API.PictureVO, e: any) => {
  // 阻止冒泡
  e.stopPropagation()
  window.open('/search_picture?pictureId=' + picture.id)
}

const doDelete = async (picture: API.PictureVO, e: any) => {
  // 阻止冒泡
  e.stopPropagation()
  const res = await deletePictureUsingPost({
    id: picture.id,
  })
  if (res.data.code === 0) {
    message.success('删除成功！')
    props.onReload?.()
  } else {
    message.error('删除失败！' + res.data.message)
  }
}

const shareModalRef = ref()
const shareLink = ref<string>('')
const doShare = (picture: API.PictureVO, e: any) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.showModal()
  }
}
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
