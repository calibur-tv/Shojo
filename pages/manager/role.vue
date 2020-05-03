<style lang="scss">
#manager-role {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 5px;
    margin-top: 5px;
  }

  .role-list {
    margin-bottom: 20px;
    margin-top: -10px;
  }
}
</style>

<template>
  <div
    id="manager-role"
    v-loading="loading"
  >
    <header class="page-header">
      <el-button
        type="primary"
        @click="createRole"
      >
        <i class="el-icon-plus" />
        创建角色
      </el-button>
      <el-button
        type="primary"
        @click="createPermission"
      >
        <i class="el-icon-plus" />
        创建权限
      </el-button>
    </header>
    <div class="role-list">
      <el-tag
        v-for="item in permissions"
        :key="item.id"
      >
        {{ item.name }}
      </el-tag>
    </div>
    <el-table
      :data="roles"
      border
      fit
      highlight-current-row
      @expand-change="showUsers"
    >
      <el-table-column
        label="id"
        prop="id"
        width="80px"
      />
      <el-table-column
        label="角色"
        prop="name"
        width="150px"
      />
      <el-table-column label="权限">
        <template slot-scope="scope">
          <el-tag
            v-for="tag in scope.row.permissions"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="deleteRolePermission(scope.row, tag)"
          >
            {{ tag.name }}
          </el-tag>
          <el-select
            v-if="scope.row.inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            filterable
            size="small"
            placeholder="请选择"
            @change="toggleRolePermission"
            @blur="handleInputBlur"
          >
            <el-option
              v-for="item in filterPermission"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showInput(scope.row)"
          >
            添加权限
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="用户"
        type="expand"
        width="80px"
      >
        <template slot-scope="props">
          <el-table
            v-loading="props.row.loading"
            :data="props.row.users"
            fit
            highlight-current-row
          >
            <el-table-column
              label="id"
              prop="id"
            />
            <el-table-column
              label="slug"
              prop="slug"
            />
            <el-table-column
              label="昵称"
              prop="nickname"
            />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteUserRole(scope.row)"
                >
                  删除角色
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200px"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="addUserRole(scope.row)"
          >
            添加用户
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      roles: [],
      permissions: [],
      inputValue: '',
      selectedRole: null
    }
  },
  computed: {
    filterPermission() {
      return this.selectedRole
        ? this.permissions.filter(_ => !this.selectedRole.permissions.map(_ => _.id).includes(_.id))
        : this.permissions
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios
        .$get('console/role/show_all_roles')
        .then((data) => {
          this.permissions = data.permissions
          this.roles = data.roles.map((_) => {
            return Object.assign(_, {
              inputVisible: false,
              loading: false,
              fetched: false,
              users: []
            })
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    createRole() {
      this.$prompt('请输入角色名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          this.$axios.$post('console/role/create_role', { name: value }).then((role) => {
            role.permissions = []
            this.roles.push(Object.assign(role, {
              inputVisible: false,
              loading: false,
              fetched: false,
              users: []
            }))
          })
        })
        .catch(() => {})
    },
    createPermission() {
      this.$prompt('请输入权限名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          this.$axios.$post('console/role/create_permission', { name: value }).then((permission) => {
            this.permissions.push(permission)
          })
        })
        .catch(() => {})
    },
    deleteRolePermission(role, permission) {
      this.selectedRole = role
      this.toggleRolePermission(permission.id)
    },
    showInput(role) {
      this.selectedRole = role
      this.selectedRole.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus()
      })
    },
    toggleRolePermission(val) {
      const index = this.selectedRole.permissions.map(_ => _.id).indexOf(val)
      const isDelete = index > -1
      this.$confirm('确定要执行该操作吗？', isDelete ? '删除权限' : '添加权限')
        .then(() => {
          this.handleInputBlur()
          this.$axios.$post('console/role/toggle_permission_to_role', {
            role_id: this.selectedRole.id,
            permission_id: val,
            is_delete: isDelete
          })
            .then(() => {
              isDelete
                ? this.selectedRole.permissions.splice(index, 1)
                : this.selectedRole.permissions.push(this.permissions.filter(_ => _.id === val)[0])
            })
        })
        .catch(() => {})
    },
    handleInputBlur() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.selectedRole.inputVisible = false
          this.inputValue = ''
        }, 1000)
      })
    },
    showUsers(role) {
      this.selectedRole = role
      if (role.fetched) {
        return
      }
      role.loading = true
      this.$axios.$get('console/role/show_all_users', {
        params: {
          key: 'role',
          value: role.name
        }
      })
        .then((data) => {
          role.users = data
          role.loading = false
          role.fetched = true
        })
    },
    addUserRole(role) {
      this.$prompt('请输入用户slug', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          this.$axios.$post('console/role/toggle_role_to_user', {
            role_id: role.id,
            user_id: value,
            is_delete: false
          }).then((user) => {
            role.users.push(user)
          })
        })
        .catch(() => {})
    },
    deleteUserRole(user) {
      this.$confirm('确定要执行该操作吗？', '删除权限')
        .then(() => {
          this.$axios.$post('console/role/toggle_role_to_user', {
            role_id: this.selectedRole.id,
            user_id: user.slug,
            is_delete: true
          }).then((user) => {
            this.selectedRole.users.forEach((item, index) => {
              if (item.slug === user.slug) {
                this.selectedRole.users.splice(index, 1)
              }
            })
          })
        })
        .catch(() => {})
    }
  }
}
</script>
