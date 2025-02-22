<template>
  <a-modal
    class="image-cropper"
    v-model:open="visible"
    :title="'编辑图片'"
    :footer="false"
    @cancel="closeModal"
  >
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      :output-type="'png'"
      :info="true"
      :can-move-box="true"
      :fixed-box="false"
      :auto-crop="true"
      :center-box="true"
    />
    <div style="margin-bottom: 16px"></div>
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft">向左旋转</a-button>
        <a-button @click="rotateRight">向右旋转</a-button>
        <a-button @click="changeScale(1)">放大</a-button>
        <a-button @click="changeScale(-1)">缩小</a-button>
        <a-button type="primary" @click="handleConfirm">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
  spaceId: string | number
}

const props = defineProps<Props>()
const cropperRef = ref()

const changeScale = (num: number) => {
  num = num || 1
  if (cropperRef.value) {
    cropperRef.value.changeScale(num)
  }
}
const rotateLeft = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateLeft()
  }
}
const rotateRight = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateRight()
  }
}

const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const filename = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], filename, { type: blob.type })
    handleUpload({ file })
  })
}

const visible = ref(false)
const loading = ref(false)

const showModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

/**
 * 上传图片
 */
const handleUpload = async (data) => {
  loading.value = true
  const { file } = data
  const params: API.uploadPictureUsingPOSTParams = props.picture ? { id: props.picture.id } : {}
  params.spaceId = props.spaceId
  const res = await uploadPictureUsingPost(params, {}, file)
  if (res.data.code === 0 && res.data.data) {
    message.success('图片上传成功')
    // 将上传成功的信息传递给父组件
    props.onSuccess?.(res.data.data)
  } else {
    message.error('图片上传失败！' + res.data.message)
  }
  loading.value = false
}

defineExpose({
  showModal,
  closeModal,
})
</script>

<style scoped>
.vue-cropper {
  text-align: center;
}
.image-cropper .vue-cropper {
  height: 400px;
}
</style>
