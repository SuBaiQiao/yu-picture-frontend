<template>
  <div id="AddPicturePage">
    <!--    标题-->
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改' : '创建' }}图片</h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
    <a-tabs v-model:active-key="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <!--    图片上传-->
        <PictureUpload
          :on-success="onSuccess"
          :spaceId="spaceId"
          :picture="picture"
        ></PictureUpload>
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传">
        <!--    URL 图片上传-->
        <UrlPictureUpload
          :on-success="onSuccess"
          :spaceId="spaceId"
          :picture="picture"
        ></UrlPictureUpload>
      </a-tab-pane>
    </a-tabs>
    <!--    图片编辑-->
    <div v-if="picture && picture.url" class="edit-bar">
      <a-space>
        <a-button type="primary" ghost :icon="h(EditOutlined)" @click="doEditPicture"
          >编辑图片</a-button
        >
        <a-button type="primary" :icon="h(FullscreenOutlined)" @click="doAiOutPainting"
          >Ai 扩图</a-button
        >
      </a-space>
    </div>
    <ImageCropper
      ref="imageCropperRef"
      :image-url="picture.url"
      :space-id="spaceId"
      :picture="picture"
      :on-success="onCropperSuccess"
    />
    <ImageOutPainting
      ref="imageOutPaintingRef"
      :picture="picture"
      :on-success="onOutPaintingSuccess"
    />
    <!--    图片信息表单-->
    <a-form
      v-if="picture.id"
      :model="pictureForm"
      layout="vertical"
      name="pictureForm"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
      </a-form-item>

      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          :autoSize="{ minRows: 2, maxRows: 5 }"
          placeholder="请输入简介"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          :options="categoryList"
          placeholder="请输入分类"
          allow-clear
        ></a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">{{
          route.query?.id ? '修改' : '创建'
        }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, onMounted, reactive, ref, h } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'

const router = useRouter()
const route = useRoute()
const picture = ref<API.PictureVO>({})
const pictureForm = reactive<API.PictureEditRequest>({
  category: '',
  id: '',
  introduction: '',
  name: '',
  tags: [],
  url: '',
})
const uploadType = ref<'file' | 'url'>('file')
const spaceId = computed(() => {
  return route.query?.spaceId
})
/**
 * 图片上传成功回调
 * @param newPicture 图片上传成功信息返回
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const handleSubmit = async (values: API.PictureEditRequest) => {
  const pictureId = picture.value.id
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败！' + res.data.message)
  }
}

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

const getOldPicture = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getPictureVoByIdUsingPost({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

const imageCropperRef = ref()
const imageOutPaintingRef = ref()
const doEditPicture = () => {
  imageCropperRef.value?.showModal()
}

const doAiOutPainting = () => {
  imageOutPaintingRef.value?.showModal()
}

const onOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  imageOutPaintingRef.value?.closeModal()
}

const onCropperSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
  imageCropperRef.value?.closeModal()
}

onMounted(() => {
  getCategoryAndTagOptions()
  getOldPicture()
})
</script>

<style scoped>
#AddPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

#AddPicturePage :deep(.edit-bar) {
  text-align: center;
  margin: 16px 0;
}
</style>
