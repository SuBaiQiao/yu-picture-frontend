<template>
  <div>
    <a-modal v-model:open="visible" :title="title" :footer="false" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copycle>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px"></div>
      <h4>手机扫码查看</h4>
      <a-qrcode :value="link"></a-qrcode>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: '分享图片'
  link: string
}

const props = withDefaults(defineProps<Props>(), {
  link: '',
  title: '分享图片',
})

const visible = ref(false)

const showModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

defineExpose({
  showModal,
})
</script>

<style scoped></style>
