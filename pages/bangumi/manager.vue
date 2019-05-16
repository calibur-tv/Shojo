<template>
  <div id="bangumi-manager">
    <header class="page-header">
      <el-row>
        <el-col :span="8">
          <bangumi-search
            placeholder="选择番剧查询"
            @search="searchBangumiManager"
          />
        </el-col>
        <el-col
          :offset="10"
          :span="6"
          style="text-align: right"
        >
          <el-button
            type="warning"
            icon="el-icon-plus"
            size="medium"
            @click="addManager"
          >
            添加版主
          </el-button>
        </el-col>
      </el-row>
    </header>
    <el-table
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="昵称">
        <a
          slot-scope="scope"
          :href="$alias.user(scope.row.user.zone)"
          target="_blank"
          v-text="scope.row.user.nickname"
        />
      </el-table-column>
      <el-table-column label="权限">
        <template slot-scope="scope">
          {{ scope.row.is_leader ? '版主' : '代行者' }}
        </template>
      </el-table-column>
      <el-table-column
        label="上任时间"
        prop="created_at"
      />
      <el-table-column
        label="操作"
        width="350px"
      >
        <template slot-scope="scope">
          <router-link :to="`/user/show/?zone=${scope.row.user.zone}`">
            <el-button
              size="mini"
              type="primary"
              style="margin-right: 10px"
            >查看用户</el-button>
          </router-link>
          <template>
            <el-button
              type="danger"
              size="mini"
              @click="removeManager(scope.row.user.id, scope.$index)"
            >移除权限</el-button>
            <el-button
              v-if="scope.row.is_leader"
              type="warning"
              size="mini"
              @click="downgradeManager(scope.row.user)"
            >降为小版主</el-button>
            <el-button
              v-else
              type="success"
              size="mini"
              @click="upgradeManager(scope.row.user)"
            >升为大版主</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bangumiId: 0,
      list: [],
      loading: false
    }
  },
  methods: {
    searchBangumiManager(id) {
      if (id === this.bangumiId) {
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      this.bangumiId = id
      this.searchManagers()
    },
    async searchManagers() {
      this.$axios
        .$get('toggle/users', {
          params: {
            type: 'contributors',
            model: 'bangumi',
            id: this.bangumiId
          }
        })
        .then(data => {
          this.list = data.list
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    addManager() {
      if (this.canNot('设置版主')) {
        return
      }
      if (!this.bangumiId) {
        this.$toast.error('请先选择番剧')
        return
      }
      this.$prompt('请输入用户id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '非法的id'
      })
        .then(({ value }) => {
          if (value < 1) {
            this.$toast.error('非法的id')
            return
          }
          this.$axios
            .$post('admin/bangumi/manager/set', {
              bangumi_id: this.bangumiId,
              user_id: value
            })
            .then(() => {
              window.location.reload()
            })
        })
        .catch(() => {})
    },
    removeManager(userId, index) {
      if (this.canNot('设置版主')) {
        return
      }
      this.$axios
        .$post('admin/bangumi/manager/remove', {
          bangumi_id: this.bangumiId,
          user_id: userId
        })
        .then(() => {
          this.list.splice(index, 1)
        })
    },
    upgradeManager(user) {
      if (this.canNot('设置版主')) {
        return
      }
      this.$axios
        .$post('admin/bangumi/manager/upgrade', {
          bangumi_id: this.bangumiId,
          user_id: user.id
        })
        .then(() => {
          user.is_leader = 1
        })
    },
    downgradeManager(user) {
      if (this.canNot('设置版主')) {
        return
      }
      this.$axios
        .$post('admin/bangumi/manager/downgrade', {
          bangumi_id: this.bangumiId,
          user_id: user.id
        })
        .then(() => {
          user.is_leader = 0
        })
    }
  }
}
</script>
