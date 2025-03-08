<template>
  <div id="SpaceAnalyzePage">
    <h2>
      空间图库分析
      <span v-if="queryAll">全部空间</span>
      <span v-else-if="queryPublic">公共图库</span>
      <span v-else>
        <a :href="`/space/${spaceId}`" target="_blank">空间id：{{ spaceId }}</a>
      </span>
    </h2>
    <div style="margin-bottom: 16px"></div>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="12">
        <space-usage-analyze
          :space-id="spaceId"
          :query-all="queryAll"
          :query-public="queryPublic"
        />
      </a-col>
      <a-col :xs="24" :md="12">
        <space-category-analyze
          :space-id="spaceId"
          :query-all="queryAll"
          :query-public="queryPublic"
        />
      </a-col>
      <a-col :xs="24" :md="12">
        <space-tag-analyze :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
      <a-col :xs="24" :md="12">
        <space-size-analyze :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
      <a-col :xs="24" :md="12">
        <space-user-analyze :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
      <a-col :xs="24" :md="12" v-if="isAdmin">
        <space-rank-analyze :space-id="spaceId" :query-all="queryAll" :query-public="queryPublic" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const route = useRoute()

const spaceId = computed(() => {
  return route.query?.spaceId as string
})

const queryAll = computed(() => {
  return !!route.query?.queryAll
})

const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})
</script>

<style scoped>
#SpaceAnalyzePage {
  margin-bottom: 16px;
}
</style>
