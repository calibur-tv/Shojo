<style lang="scss">
#spider-user {
  .page-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-right: 20px;
  }

  a {
    color: $color-blue-normal;
  }
}
</style>

<template>
  <div
    id="spider-user"
    v-loading="pageLoading"
  >
    <header class="page-header">
      <ElButton type="primary" @click="showDialog = true">
        添加用户
      </ElButton>
      <a href="http://json-validator.com/" target="_blank">JSON校验工具</a>
    </header>
    <el-table
      :data="users"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="id"
        prop="user_id"
      >
        <template slot-scope="scope">
          <a
            :href="convertUserLink(scope.row)"
            target="_blank"
            v-text="scope.row.user_id"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="来源"
        prop="name"
      >
        <template slot-scope="scope">
          {{ convertUserSite(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="规则"
        prop="rule"
      />
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            :type="scope.row.deleted_at ? 'success' : 'danger'"
            size="small"
            @click="deleteUser(scope.row, scope.$index)"
          >
            {{ scope.row.deleted_at ? '恢复用户' : '删除用户' }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="changeUserRule(scope.row, scope.$index)"
          >
            更改规则
          </el-button>
          <el-button
            type="warning"
            size="small"
            @click="refreshUserData(scope.row, scope.$index)"
          >
            刷新数据
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <VDialog
      v-model="showDialog"
      title="添加用户"
      @submit="handleCreateUser"
    >
      <el-form label-position="top">
        <el-form-item label="id">
          <el-input v-model="form.user_id" />
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="form.site_type">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规则">
          <el-input v-model="form.rule" type="textarea" />
        </el-form-item>
      </el-form>
    </VDialog>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

const isJSON = (str) => {
  if (typeof str !== 'string') {
    return false
  }
  try {
    const obj = JSON.parse(str)
    return typeof obj === 'object' && obj
  } catch (e) {
    return false
  }
}

export default {
  mixins: [pageMixin],
  data() {
    return {
      showDialog: false,
      users: [],
      sites: [],
      form: {
        user_id: '',
        site_type: '',
        rule: ''
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getUsers()
  },
  mounted() {},
  methods: {
    getUsers() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios.$get('console/spider/get_all_user')
        .then((res) => {
          this.users = res.user
          this.sites = res.site
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    convertUserSite(data) {
      return this.sites.find(_ => _.id === data.site_type).name
    },
    convertUserLink(data) {
      return this.sites.find(_ => _.id === data.site_type).path.replace('{id}', data.user_id)
    },
    deleteUser(user, index) {
      this.$confirm(`确定要${user.deleted_at ? '恢复' : '删除'}该用户吗？`, '提示')
        .then(() => {
          this.$axios.$post('console/spider/del_user', {
            site: user.site_type,
            user_id: user.user_id,
            with_data: true
          })
            .then(() => {
              const user = this.users[index]
              this.users.splice(index, 1, {
                ...user,
                deleted_at: user.deleted_at ? null : Date.now()
              })
            })
        })
        .catch(() => {})
    },
    changeUserRule(user, index) {
      this.$prompt('请输入新的抓取规则', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!isJSON(value)) {
            this.$toast.error('规则不是合法的 JSON')
            return
          }
          this.$axios.$post('console/spider/set_user', {
            site: user.site_type,
            rule: JSON.parse(value),
            user_id: user.user_id
          })
            .then((res) => {
              this.$set(this.users, index, res)
            })
        })
        .catch(() => {})
    },
    refreshUserData(user) {
      this.pageLoading = true
      this.$confirm('确定要刷新用户数据吗', '提示')
        .then(() => {
          this.$axios.$post('console/spider/refresh_user_data', {
            site: user.site_type,
            user_id: user.user_id
          })
            .then(() => {
              this.pageLoading = false
            })
            .catch(() => {
              this.pageLoading = false
            })
        })
        .catch(() => {})
    },
    handleCreateUser() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      if (!this.form.user_id) {
        this.$toast.error('id 不能为空')
        return
      }
      if (!this.form.site_type) {
        this.$toast.error('来源不能为空')
        return
      }
      if (this.form.rule && !isJSON(this.form.rule)) {
        this.$toast.error('规则不是合法的 JSON')
        return
      }
      this.$axios.$post('console/spider/set_user', {
        site: this.form.site_type,
        user_id: this.form.user_id,
        rule: this.form.rule ? JSON.parse(this.form.rule) : ''
      })
        .then((user) => {
          this.users.push(user)
          this.showDialog = false
          this.form = {
            user_id: '',
            site_type: '',
            rule: ''
          }
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    }
  }
}
</script>
