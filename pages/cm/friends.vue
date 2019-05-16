<template>
  <div id="cm-friends">
    <header class="page-header">
      <el-row>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="showCreateModal = true"
          >
            <i class="el-icon-plus"/>
            添加友链
          </el-button>
        </el-col>
      </el-row>
      <v-dialog
        v-model="showCreateModal"
        title="添加友链"
        @submit="createFriendLink"
      >
        <el-form>
          <el-form-item label="站名">
            <el-input v-model.trim="name"/>
          </el-form-item>
          <el-form-item label="链接">
            <el-input v-model.trim="link"/>
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
        label="站名"
        prop="name"
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
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="danger"
            @click="removeFriendLink(scope.$index, scope.row)"
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
  name: 'CmFriends',
  mixins: [pageMixin],
  data() {
    return {
      showCreateModal: false,
      name: '',
      link: ''
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/web/friend_link/list')
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
    async createFriendLink() {
      if (this.canNot('修改友情链接')) {
        return
      }
      this.$axios
        .$post('admin/web/friend_link/append', {
          link: this.link.split('?')[0],
          name: this.name
        })
        .then(() => {
          this.pageList.unshift({
            link: this.link.split('?')[0],
            name: this.name
          })
          this.pageState.total++
          this.showCreateModal = false
          this.name = ''
          this.link = ''
        })
    },
    async removeFriendLink(index, row) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$axios
            .$post('admin/web/friend_link/remove', {
              link: row.link
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
    }
  }
}
</script>
