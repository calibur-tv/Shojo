<template>
  <div id="cm-loop">
    <header class="page-header">
      <el-row>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="createProcess"
          >
            <i class="el-icon-plus"/>
            添加轮播
          </el-button>
        </el-col>
      </el-row>
      <v-dialog
        v-if="form"
        v-model="showCreateModal"
        :footer="false"
      >
        <el-form
          ref="form"
          :model="form"
          label-width="80px"
        >
          <el-form-item label="标题">
            <el-input v-model.trim="form.title"/>
          </el-form-item>
          <el-form-item label="链接">
            <el-input v-model.trim="form.link"/>
          </el-form-item>
          <el-form-item label="封面">
            <el-upload
              :data="uploadHeaders"
              :action="imageUploadAction"
              :accept="imageUploadAccept"
              :limit="1"
              :before-upload="beforeImageUpload"
              :on-success="handleImageUploadSuccess"
              :on-error="handleImageUploadError"
              list-type="picture"
            >
              <el-button
                size="small"
                type="primary"
              >点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker
              v-model="form.time_range"
              :picker-options="pickerOptions"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
            />
          </el-form-item>
          <el-form-item label="详情">
            <el-input
              v-model.trim="form.desc"
              type="textarea"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="submitting"
              type="primary"
              @click="onSubmit"
            >提交</el-button>
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
      <el-table-column
        label="标题"
        prop="title"
      />
      <el-table-column label="链接">
        <template slot-scope="scope">
          <a
            :href="scope.row.link"
            target="_blank"
            v-text="scope.row.link"
          />
        </template>
      </el-table-column>
      <el-table-column label="封面">
        <template slot-scope="scope">
          <a
            :href="scope.row.poster"
            target="_blank"
          >
            <img :src="$resize(scope.row.poster, { width: 200, mode: 2 })">
          </a>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        prop="desc"
      />
      <el-table-column label="开始时间">
        <template slot-scope="scope">
          {{ scope.row.begin_at }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间">
        <template slot-scope="scope">
          {{ scope.row.end_at }}
        </template>
      </el-table-column>
      <el-table-column
        label="查看量"
        prop="view_count"
      />
      <el-table-column
        label="点击量"
        prop="click_count"
      />
      <el-table-column
        label="操作"
        width="210px"
      >
        <template slot-scope="scope">
          <template v-if="scope.row.deleted_at">
            <el-button size="small">
              已下架
            </el-button>
          </template>
          <template v-else>
            <el-button
              size="small"
              type="primary"
              @click="updateProcess(scope.$index, scope.row)"
            >更新</el-button>
            <el-button
              size="small"
              type="danger"
              @click="remove(scope.$index, scope.row)"
            >下架</el-button>
            <el-button
              v-if="scope.$index"
              size="small"
              type="warning"
              @click="sort(scope.$index, scope.row)"
            >置顶</el-button>
          </template>
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
import uploadMixin from '~/mixins/upload'

const defaultForm = {
  title: '',
  desc: '',
  poster: '',
  link: '',
  begin_at: '',
  end_at: '',
  time_range: ''
}

export default {
  name: 'CmLoop',
  mixins: [pageMixin, uploadMixin],
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '一天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '一月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      showCreateModal: false,
      form: null,
      submitting: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/cm/loop/list')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 15
          this.pageState.total = data.length
          this.pageList = data
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    createProcess() {
      this.form = _.merge({}, defaultForm)
      this.showCreateModal = true
    },
    updateProcess(index, row) {
      this.form = _.merge(
        {
          time_range: [row.begin_at, row.end_at]
        },
        row
      )
      this.showCreateModal = true
    },
    handleImageUploadSuccess(res) {
      this.form.poster = `${this.imagePrefix}${res.data.url}`
    },
    async onSubmit() {
      if (this.canNot('更改首页轮播')) {
        return
      }
      if (!this.form.title) {
        this.$toast.error('标题不能为空！')
        return
      }
      if (!this.form.time_range) {
        this.$toast.error('时间点不能为空')
        return
      }
      if (!this.form.link || !/^https?:\/\//i.test(this.form.link)) {
        this.$toast.error('请输入合法链接')
        return
      }
      if (this.submitting) {
        return
      }
      this.submitting = true
      this.form.begin_at = parseInt(
        new Date(this.form.time_range[0]).getTime() / 1000
      )
      this.form.end_at = parseInt(
        new Date(this.form.time_range[1]).getTime() / 1000
      )
      if (this.form.id) {
        this.$axios.$post('admin/cm/loop/update', this.form).then(() => {
          window.location.reload()
        })
      } else {
        this.$axios.$post('admin/cm/loop/add', this.form).then(() => {
          window.location.reload()
        })
      }
    },
    async remove(index, row) {
      if (this.canNot('更改首页轮播')) {
        return
      }
      this.$confirm('确定要下架吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/cm/loop/delete', {
              id: row.id
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
    async sort(index, row) {
      if (this.canNot('更改首页轮播')) {
        return
      }
      this.$confirm('确定要置顶吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/cm/loop/sort', {
              id: row.id
            })
            .then(() => {
              window.location.reload()
            })
        })
        .catch(() => {})
    }
  }
}
</script>
