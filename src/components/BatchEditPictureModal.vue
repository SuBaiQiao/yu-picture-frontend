<template>
  <div class="batch-edit-picture-modal">
    <a-modal v-model:open="visible" :title="'批量编辑图片'" :footer="false" @cancel="closeModal">
      <a-typography-paragraph type="secondary">* 只对当前页面的图片生效</a-typography-paragraph>
      <!--    批量修改图片信息表单-->
      <a-form
        :model="fromData"
        layout="vertical"
        name="fromData"
        autocomplete="off"
        @finish="handleSubmit"
      >
        <a-form-item label="分类" name="category">
          <a-auto-complete
            v-model:value="fromData.category"
            :options="categoryList"
            placeholder="请输入分类"
            allow-clear
          ></a-auto-complete>
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="fromData.tags"
            mode="tags"
            placeholder="请输入标签"
            :options="tagOptions"
            allow-clear
          ></a-select>
        </a-form-item>
        <a-form-item label="命名规则" name="nameRule">
          <a-input
            v-model:value="fromData.nameRule"
            placeholder="请输入命名规则，输入{序号}可动态生成"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%">批量修改</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureByBatchUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  pictureList: API.PictureVO[]
  onSuccess: () => void
}

const props = withDefaults(defineProps<Props>(), {})

const visible = ref(false)
const fromData = reactive<API.PictureEditByBatchRequest>({
  category: '',
  nameRule: '',
  tags: [],
})
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

const showModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

const handleSubmit = async (values: API.PictureEditByBatchRequest) => {
  const pictureIdList = props.pictureList.map((picture) => picture.id)
  if (!pictureIdList || pictureIdList.length === 0) {
    message.error('请选择图片')
    return
  }
  const res = await editPictureByBatchUsingPost({
    pictureIdList,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    closeModal()
    props.onSuccess?.()
  } else {
    message.error('操作失败！' + res.data.message)
  }
}

defineExpose({
  showModal,
})

onMounted(() => {
  getCategoryAndTagOptions()
})
</script>

<style scoped></style>
