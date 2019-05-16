<template>
  <div id="app-version">
    <header class="page-header">
      <el-row>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="showCreateModal = true"
          >
            <i class="el-icon-plus" />
            添加版本
          </el-button>
        </el-col>
      </el-row>
      <v-dialog
        v-model="showCreateModal"
        title="添加版本"
        @submit="createAppVersion"
      >
        <el-form>
          <el-form-item label="App类型">
            <el-select
              v-model="appType"
              placeholder="选择App"
            >
              <el-option
                v-for="item in types"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="版本类型">
            <el-radio-group v-model="versionType">
              <el-radio :label="1">
                大版本
              </el-radio>
              <el-radio :label="2">
                小版本
              </el-radio>
              <el-radio :label="3">
                修复版
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="appType && versionType"
            label="下载链接"
          >
            <template v-if="appType === '1'">
              <el-col
                v-if="downloadUrl"
                :span="18"
              >
                <el-input
                  v-model="downloadUrl"
                  :disabled="true"
                />
              </el-col>
              <el-upload
                v-else
                :data="uploadHeaders"
                :before-upload="beforeUploadApp"
                :on-success="handleAppUploaded"
                :on-error="handleApkUploadError"
                action="https://upload.qiniup.com"
              >
                <el-button
                  size="small"
                  type="primary"
                >
                  上传安装包
                </el-button>
              </el-upload>
            </template>
            <el-col
              v-else
              :span="18"
              placehloder="填写安装包的下载链接，或跳转链接"
            >
              <el-input v-model="downloadUrl" />
            </el-col>
          </el-form-item>
          <el-form-item
            v-if="appVersion"
            label="预览结果"
          >
            {{ appVersion }}
          </el-form-item>
        </el-form>
      </v-dialog>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="App类型">
        <template slot-scope="scope">
          {{ computeType(scope.row.app_type) }}
        </template>
      </el-table-column>
      <el-table-column
        label="版本号"
        prop="app_version"
      />
      <el-table-column label="下载链接">
        <template slot-scope="scope">
          <a
            :href="scope.row.download_url"
            target="_blank"
            v-text="scope.row.download_url"
          />
        </template>
      </el-table-column>
      <el-table-column label="强制更新">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.force_update"
            disabled
          />
        </template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="created_at"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="isKing"
            size="small"
            type="danger"
            @click="remove(scope.$index, scope.row)"
          >
            删除
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="toggleForce(scope.row)"
          >
            {{ scope.row.force_update ? '取消强制更新' : '开启强制更新' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :state="pageState"
      :change="handlePageChange"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'AppVersion',
  mixins: [pageMixin],
  data() {
    return {
      showCreateModal: false,
      imageUploadAccept: '',
      appType: '',
      versionType: 0,
      downloadUrl: '',
      types: [
        {
          label: 'Android',
          value: '1'
        },
        {
          label: 'iOS',
          value: '2'
        }
      ],
      uploadHeaders: {
        token: '',
        key: ''
      }
    }
  },
  computed: {
    isKing() {
      return this.$store.state.user.id === 1
    },
    appVersion() {
      if (this.appType === '' || this.versionType === 0) {
        return ''
      }
      const list = this.pageList.filter(_ => _.app_type === this.appType)
      if (!list.length) {
        return '0.0.1'
      }
      const nowBiggestVersion = list[0].app_version
        .split('.')
        .map(_ => parseInt(_))
      if (this.versionType === 1) {
        return `${nowBiggestVersion[0] + 1}.0.0`
      } else if (this.versionType === 2) {
        return `${nowBiggestVersion[0]}.${nowBiggestVersion[1] + 1}.0`
      }
      return `${nowBiggestVersion[0]}.${
        nowBiggestVersion[1]
      }.${nowBiggestVersion[2] + 1}`
    }
  },
  created() {
    this.getData()
    this.getUploadAppUpToken()
  },
  methods: {
    getUploadAppUpToken() {
      this.$axios.$get('admin/app/version/uptoken').then(data => {
        this.uploadHeaders.token = data
      })
    },
    getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/app/version/list')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 15
          this.pageState.total = data.length
          this.pageList = data.map(_ => {
            return Object.assign(_, {
              force_update: _.force_update === '1'
            })
          })
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    createAppVersion() {
      if (this.canNot('控制APP版本')) {
        return
      }
      if (!this.appType || !this.appVersion || !this.downloadUrl) {
        return
      }
      this.$axios
        .$post('admin/app/version/create', {
          type: this.appType,
          version: this.appVersion,
          url: this.downloadUrl
        })
        .then(data => {
          this.pageList.unshift(data)
          this.pageState.total++
          this.showCreateModal = false
          this.appType = ''
          this.versionType = 0
        })
    },
    remove(index, row) {
      if (this.canNot('控制APP版本')) {
        return
      }
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/app/version/delete', {
              type: row.app_type,
              version: row.app_version
            })
            .then(() => {
              this.pageList.splice(
                (this.pageState.cur - 1) * this.pageState.size + index,
                1
              )
              this.pageState.total--
            })
        })
        .catch(() => {})
    },
    toggleForce(row) {
      if (this.canNot('控制APP版本')) {
        return
      }
      this.$confirm('确定要执行该操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/app/version/toggleForce', {
              type: row.app_type,
              version: row.app_version,
              force: !row.force_update
            })
            .then(() => {
              row.force_update = !row.force_update
            })
        })
        .catch(() => {})
    },
    computeType(type) {
      let result = ''
      this.types.forEach(item => {
        if (item.value === type) {
          result = item.label
        }
      })
      return result
    },
    beforeUploadApp(file) {
      if (file.type !== 'application/vnd.android.package-archive') {
        this.$toast.error('文件类型不正确！')
        return false
      }
      this.uploadHeaders.mime = 'application/vnd.android.package-archive'
      this.uploadHeaders.key = `app/android/${Date.now()}/calibur-tv-${this.appVersion.replace(
        /\./g,
        '-'
      )}.apk`
      return true
    },
    handleAppUploaded(res) {
      this.downloadUrl = `https://static.calibur.tv/${res.key}`
    },
    handleApkUploadError(err, file) {
      console.log(err)
      this.$toast.error(`安装包：${file.name} 上传失败`)
    }
  }
}
</script>
