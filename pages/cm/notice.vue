<template>
  <div id="cm-notice">
    <header class="page-header">
      <el-row>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="createNotice('create')"
          >
            <i class="el-icon-plus"/>
            发布通知
          </el-button>
        </el-col>
      </el-row>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="索引"
        prop="id"
      />
      <el-table-column
        label="标题"
        prop="title"
      />
      <el-table-column label="封面">
        <template slot-scope="scope">
          <img
            :src="$resize(scope.row.banner, { width: 300 })"
            height="150"
            style="width: 150px !important;"
          >
        </template>
      </el-table-column>
      <el-table-column label="链接">
        <template slot-scope="scope">
          <span>https://m.calibur.tv/app/notice/{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="210px"
      >
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="updateNotice(scope.row)"
          >更新</el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteNotice(scope.$index, scope.row)"
          >删除</el-button>
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
  name: 'CmNotice',
  mixins: [pageMixin],
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('user/notice/list')
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
    createNotice() {
      this.$prompt('请输入文章的id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value) {
            return
          }
          this.$axios
            .$post('admin/cm/notice/create', { id: value })
            .then(() => {
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            })
        })
        .catch(() => {})
    },
    updateNotice(notice) {
      this.$prompt('请输入文章的id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value) {
            return
          }
          this.$axios
            .$post('admin/cm/notice/update', {
              score_id: value,
              notice_id: notice.id
            })
            .then(() => {
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            })
        })
        .catch(() => {})
    },
    deleteNotice(index, notice) {
      this.$confirm('确认要执行该操作吗?', '提示')
        .then(() => {
          this.$axios
            .$post('admin/cm/notice/delete', {
              id: notice.id
            })
            .then(() => {
              this.pageList.splice(
                (this.pageState.cur - 1) * this.pageState.size + index,
                1
              )
              this.pageState.total--
            })
            .catch(() => {
              this.$toast.error('操作失败')
            })
        })
        .catch(() => {})
    }
  }
}
</script>
