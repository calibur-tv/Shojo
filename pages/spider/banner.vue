<style lang="scss">
</style>

<template>
  <div
    id="spider-banner"
    v-loading="pageLoading"
  >
    <header class="page-header">
      <ElButton type="primary" @click="showDialog = true">
        添加轮播
      </ElButton>
    </header>
    <VDialog
      v-model="showDialog"
      title="添加轮播"
      @submit="handleCreateBanner"
    >
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" :maxlength="20" placeholder="最多20个字" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.link" placeholder="跳转的页面链接" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.type">
            <el-option
              v-for="item in type"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图片">
          <VUploader
            ref="uploader"
            v-model="form.image"
            :cookie="false"
            required
            :url="imageUploadAction"
            :accept="imageUploadAccept"
            :transform-request="imageUploadRequest"
            :transform-response="imageUploadResponse"
          />
        </el-form-item>
      </el-form>
    </VDialog>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'
import uploadMixin from '~/mixins/upload'

export default {
  mixins: [pageMixin, uploadMixin],
  props: {},
  data() {
    return {
      list: [],
      form: {
        type: 0,
        link: '',
        image: '',
        title: ''
      },
      showDialog: false
    }
  },
  computed: {
    type() {
      return [
        {
          id: 0,
          name: '未归类'
        }
      ]
    }
  },
  watch: {},
  created() {
    this.getBanners()
  },
  mounted() {},
  methods: {
    getBanners() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios.$get('console/cm/show_all_banner')
        .then((res) => {
          this.list = res
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    handleCreateBanner() {

    }
  }
}
</script>
