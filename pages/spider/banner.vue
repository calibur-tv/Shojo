<style lang="scss">
#spider-banner {
  .poster {
    width: 130px;
    height: 100px;
    object-fit: contain;
  }
}
</style>

<template>
  <div
    id="spider-banner"
    v-loading="pageLoading"
  >
    <header class="page-header">
      <ElButton type="primary" @click="showCreateBanner">
        添加轮播
      </ElButton>
    </header>
    <ElTable
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="索引"
        prop="id"
      />
      <el-table-column
        label="链接"
        prop="link"
      >
        <template slot-scope="scope">
          <a target="_blank" :href="scope.row.link" v-text="scope.row.title" />
        </template>
      </el-table-column>
      <el-table-column
        label="图片"
        prop="image"
        width="130px"
      >
        <template slot-scope="scope">
          <img class="poster" :src="scope.row.image">
        </template>
      </el-table-column>
      <el-table-column
        label="曝光"
        prop="visit_count"
      />
      <el-table-column
        label="点击"
        prop="click_count"
      />
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <ElButton
            :type="scope.row.online ? 'warning' : 'danger'"
            size="small"
            @click="handleToggleBanner(scope.row)"
          >
            {{ scope.row.online ? '去下线' : '去上线' }}
          </ElButton>
          <ElButton
            type="primary"
            size="small"
            @click="showUpdateBanner(scope.row)"
          >
            更新
          </ElButton>
        </template>
      </el-table-column>
    </ElTable>
    <VDialog
      v-model="showDialog"
      :loading="submitting"
      title="添加轮播"
      @submit="handleSubmitBanner"
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
      showDialog: false,
      submitting: false
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
    handleSubmitBanner() {
      if (!this.form.title) {
        return
      }
      if (!this.form.image) {
        return
      }
      if (!this.form.link || !/^https?:\/\//i.test(this.form.link)) {
        return
      }
      if (this.submitting) {
        return
      }
      const isUpdate = !!this.form.id
      this.submitting = true
      this.$axios.$post(`console/cm/${isUpdate ? 'update' : 'create'}_banner`, {
        ...this.form
      })
        .then((res) => {
          if (isUpdate) {
            this.list.forEach((item, index) => {
              if (item.id === this.form.id) {
                this.list.splice(index, 1, { ...this.form })
              }
            })
          } else {
            this.list.unshift(res)
          }
          this.submitting = false
          this.showDialog = false
        })
        .catch(() => {
          this.submitting = false
        })
    },
    showCreateBanner() {
      this.$set(this, 'form', {
        type: 0,
        link: '',
        image: '',
        title: ''
      })
      this.showDialog = true
    },
    showUpdateBanner(row) {
      this.$set(this, 'form', row)
      this.showDialog = true
    },
    handleToggleBanner(row) {
      this.$confirm('确定要执行该操作吗？')
        .then(() => {
          this.$axios.$post('console/cm/toggle_banner', {
            id: row.id,
            status: !row.online
          })
            .then(() => {
              row.online = !row.online
            })
        })
        .catch(() => {})
    }
  }
}
</script>
