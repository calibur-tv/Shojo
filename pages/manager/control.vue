<template>
  <div
    v-loading="loading"
    id="manager-control"
  >
    <header
      v-if="isKing"
      class="page-header"
    >
      <el-button
        type="primary"
        @click="addAdmin"
      >
        <i class="el-icon-plus"/>
        添加管理员
      </el-button>
    </header>
    <el-table
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="id"
        prop="id"
      />
      <el-table-column label="昵称">
        <a
          slot-scope="scope"
          :href="$alias.user(scope.row.zone)"
          target="_blank"
          v-text="scope.row.nickname"
        />
      </el-table-column>
      <el-table-column
        v-if="isKing"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="checkUserRole(scope.row)"
          >查看权限</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="removeFromAdmin(scope.$index, scope.row.id)"
          >删除权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-dialog
      v-model="showFocusDialog"
      :footer="false"
      title="权限列表"
    >
      <el-table
        :data="roles"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="权限"
        >
          <template slot-scope="scope">
            {{ scope.row }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              v-if="isKing"
              type="danger"
              size="mini"
              @click="removeUserRole(scope.row)"
            >移除权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      loading: true,
      showFocusDialog: false,
      focusUser: {},
      roles: []
    }
  },
  computed: {
    isKing() {
      return this.$store.state.user.id === 1
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios
        .$get('admin/console/list')
        .then(data => {
          this.list = data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    removeFromAdmin(index, id) {
      if (this.id === 1) {
        return
      }
      this.$axios.$post('admin/console/remove', { id }).then(() => {
        this.list.splice(index, 1)
      })
    },
    addAdmin() {
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
          this.$axios.$post('admin/console/add', { id: value }).then(() => {
            window.location.reload()
          })
        })
        .catch(() => {})
    },
    checkUserRole(user) {
      this.focusUser = user
      this.roles = []
      this.showFocusDialog = true
      this.$axios
        .$get('admin/role/user_roles', {
          params: {
            user_id: user.id
          }
        })
        .then(roles => {
          this.roles = roles
        })
    },
    removeUserRole(roleName) {
      this.$axios
        .$post('admin/role/delete_role', {
          role_name: roleName,
          user_id: this.focusUser.id
        })
        .then(() => {
          this.roles.forEach((item, index) => {
            if (item === roleName) {
              this.roles.splice(index, 1)
            }
          })
        })
    }
  }
}
</script>
