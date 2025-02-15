<template>
  <div id="AddPicturePage">
    <!--    标题-->
    <h2 style="margin-bottom: 16px">创建图片</h2>
    <!--    图片上传-->
    <PictureUpload :on-success="onSuccess" :picture="picture"></PictureUpload>
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
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { editPictureUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
const router = useRouter()
const picture = ref<API.PictureVO>({})
const pictureForm = reactive<API.PictureEditRequest>({
  category: '',
  id: '',
  introduction: '',
  name: '',
  tags: [],
  url: '',
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

const categoryList = ref<string[]>([])
const tagOptions = ref<string[]>([])

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
    message.error('分类失败！' + res.data.message)
  }
}

onMounted(() => {
  getCategoryAndTagOptions()
})
</script>

<style scoped>
#AddPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
