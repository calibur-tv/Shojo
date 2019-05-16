<template>
  <div
    id="manager-setting"
    v-loading="loading"
  >
    <header
      v-if="isKing"
      class="page-header"
    >
      <el-button
        type="primary"
        @click="createRole"
      >
        <i class="el-icon-plus" />
        创建权限
      </el-button>
    </header>
    <el-table
      :data="roles"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="名称"
        prop="name"
      />
      <el-table-column
        label="简介"
        prop="desc"
      />
      <el-table-column
        label="人数"
        width="100px"
      >
        <template slot-scope="scope">
          {{ computeRoleCount(scope.row.id) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="400px"
      >
        <template slot-scope="scope">
          <el-button
            v-if="isKing"
            type="success"
            size="mini"
            @click="setRole(scope.row)"
          >
            授予授权
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="loadUsers(scope.row)"
          >
            查看成员
          </el-button>
          <el-button
            type="warning"
            size="mini"
            @click="updateRole(scope.row)"
          >
            修改描述
          </el-button>
          <el-button
            v-if="isKing"
            type="danger"
            size="mini"
            @click="deleteRole(scope.$index, scope.row.id)"
          >
            删除权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-dialog
      v-model="showDialog"
      :loading="submitting"
      title="权限管理"
      @submit="createOrUpdateRole"
    >
      <el-form
        ref="form"
        :model="form"
      >
        <el-form-item label="名称">
          <el-input v-model.trim="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model.trim="form.desc"
            type="textarea"
          />
        </el-form-item>
      </el-form>
    </v-dialog>
    <v-dialog
      v-model="showDetail"
      :footer="false"
      title="查看权限用户"
    >
      <el-table
        :data="focusUsers"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="id"
          prop="id"
        />
        <el-table-column
          label="昵称"
          prop="nickname"
        />
        <el-table-column
          label="操作"
          width="400px"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
            >
              <a
                :href="$alias.user(scope.row.zone)"
                target="_blank"
              >
                查看空间
              </a>
            </el-button>
            <el-button
              type="warning"
              size="mini"
            >
              <a
                :href="`/user/show/?id=${scope.row.id}`"
                target="_blank"
              >
                查看数据
              </a>
            </el-button>
            <el-button
              v-if="isKing"
              type="danger"
              size="mini"
              @click="removeRole(scope.row)"
            >
              移除权限
            </el-button>
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
      users: [],
      roles: [],
      loading: false,
      submitting: false,
      showDialog: false,
      form: {
        name: '',
        desc: ''
      },
      checkRole: {},
      showDetail: false
    }
  },
  computed: {
    isKing() {
      return this.$store.state.user.id === 1
    },
    focusUsers() {
      return this.users.filter(_ => _.role_id === this.checkRole.id)
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios
        .$get('admin/role/all')
        .then(data => {
          this.roles = data.roles
          this.users = data.users
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    createRole() {
      this.form = {
        name: '',
        desc: ''
      }
      this.showDialog = true
    },
    updateRole(row) {
      this.form = row
      this.showDialog = true
    },
    deleteRole(index, id) {
      this.$axios.$post('admin/role/destroy_role', { id }).then(() => {
        this.roles.splice(index, 1)
      })
    },
    loadUsers(role) {
      this.checkRole = role
      this.showDetail = true
    },
    setRole(role) {
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
            .$post('admin/role/set_role', {
              role_name: role.name,
              user_id: value
            })
            .then(user => {
              this.users.push({
                ...user,
                role_id: role.id
              })
            })
        })
        .catch(() => {})
    },
    computeRoleCount(roleId) {
      return this.users.filter(_ => _.role_id === roleId).length
    },
    removeRole(user) {
      this.$axios
        .$post('admin/role/delete_role', {
          role_name: this.checkRole.name,
          user_id: user.id
        })
        .then(() => {
          this.users.forEach((item, index) => {
            if (item.id === user.id && item.role_id === user.role_id) {
              this.users.splice(index, 1)
            }
          })
        })
    },
    createOrUpdateRole() {
      if (this.submitting) {
        return
      }
      this.submitting = true
      const isCreate = !this.form.id
      this.$axios
        .$post(
          isCreate ? 'admin/role/create_role' : 'admin/role/update_role',
          this.form
        )
        .then(id => {
          if (isCreate) {
            this.roles.push({
              id,
              ...this.form
            })
          } else {
            this.roles.forEach(item => {
              if (item.id === this.form.id) {
                item.name = this.form.name
                item.desc = this.form.desc
              }
            })
          }
          this.submitting = false
          this.showDialog = false
        })
        .catch(() => {
          this.submitting = false
        })
    }
  }
}
</script>
