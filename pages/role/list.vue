<style lang="scss">
#role-list {
  .avatar {
    img {
      width: 60px;
      height: 60px;
      vertical-align: middle;
      margin-left: 2px;
      margin-right: 10px;
    }
  }
}
</style>

<template>
  <div
    v-loading="loading"
    id="role-list"
  >
    <header class="page-header">
      <el-row>
        <el-col :span="10">
          <bangumi-search @search="handleBangumiSearch"/>
        </el-col>
        <el-col
          :offset="1"
          :span="10"
        >
          <el-button
            type="danger"
            icon="delete"
            size="medium"
            @click="removeStar"
          >撤销应援</el-button>
        </el-col>
      </el-row>
    </header>
    <el-table
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="名称"
      >
        <a
          slot-scope="scope"
          :href="$alias.cartoonRole(scope.row.id)"
          target="_blank"
          class="avatar"
        >
          <img :src="$resize(scope.row.avatar, { width: 120 })">
          <span v-text="scope.row.name"/>
        </a>
      </el-table-column>
      <el-table-column
        label="粉丝"
        prop="fans_count"
      />
      <el-table-column
        label="团子"
        prop="star_count"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <router-link :to="`/role/create/?id=${scope.row.id}`">
            <el-button
              size="small"
              type="primary"
            >编辑</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'RoleList',
  data() {
    return {
      bangumiId: 0,
      list: [],
      loading: false
    }
  },
  methods: {
    async getData() {
      if (this.loading) {
        return
      }
      this.loading = true
      this.$axios
        .$get('flow/list', {
          params: {
            type: 'role',
            sort: 'hot',
            take: 1000,
            seenIds: '',
            page: 0,
            userZone: '',
            bangumiId: this.bangumiId
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
    handleBangumiSearch(id) {
      if (this.bangumiId !== id) {
        this.bangumiId = id
        this.getData()
      }
    },
    removeStar() {
      if (this.canNot('撤销用户应援')) {
        return
      }
      this.$prompt('请输入违规用户的 id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value) {
            return
          }
          this.$axios.$post('admin/trial/user/banned_user_cherr', {
            user_id: value
          })
        })
        .catch(() => {})
    }
  }
}
</script>
