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
    <!--    协同编辑操作-->
    <div class="image-edit-actions" v-if="isTeamSpace">
      <a-space>
        <span v-if="editingUser">{{ editingUser?.userName }} 正在编辑</span>
        <a-button v-if="canEnterEdit" type="primary" @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div style="margin-bottom: 16px"></div>
    <!--    图片操作区域-->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" @click="handleConfirm" :disabled="!canEdit">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constant/picture.ts'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
  spaceId: string | number
  space?: API.SpaceVO
}

const props = defineProps<Props>()
const cropperRef = ref()

// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

const changeScale = (num: number) => {
  num = num || 1
  if (cropperRef.value) {
    cropperRef.value.changeScale(num)
  }
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}
const rotateLeft = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateLeft()
  }
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}
const rotateRight = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateRight()
  }
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
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
  // 断开WebSocket连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
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

// -------------实时编辑--------------
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

// 当前正在编辑的用户
const editingUser = ref<API.UserVO>()
// 当前用户是否可以进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 正在编辑的用户是本人，可以退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})
// 可以点击编辑图片的操作按钮
const canEdit = computed(() => {
  if (!isTeamSpace.value) {
    return true
  }
  // 团队空间，只有编辑者才能编辑
  return editingUser.value?.id === loginUser.id
})

// WebSocket逻辑
let websocket: PictureEditWebSocket | null
// 初始化WebSocket连接，绑定监听事件
const initWebSocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !visible.value) {
    return
  }
  // 防止之前的连接未释放
  if (websocket) {
    websocket.disconnect()
  }
  websocket = new PictureEditWebSocket(pictureId)
  // 建立连接
  websocket.connect()

  // 监听事件
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误通知：', msg)
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态的消息：', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作的消息：', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1)
        break
    }
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态的消息：', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })
}

// 监听属性和visible的变化，初始化WebSocket连接
watchEffect(() => {
  // 只有团队空间才会初始化
  if (isTeamSpace.value) {
    initWebSocket()
  }
})

onUnmounted(() => {
  // 断开WebSocket连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})
// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}
// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 图片编辑操作
const editAction = (action: string) => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
</script>

<style scoped>
.vue-cropper {
  text-align: center;
}
.image-cropper .vue-cropper {
  height: 400px;
}
</style>
