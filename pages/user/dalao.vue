<template>
  <div
    id="user-dalao"
    v-loading="pageLoading"
  >
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
      <el-table-column label="昵称">
        <a
          slot-scope="scope"
          :href="$alias.user(scope.row.zone)"
          target="_blank"
          v-text="scope.row.nickname"
        />
      </el-table-column>
      <el-table-column
        label="团子"
        prop="coin_count"
      />
      <el-table-column label="运营号">
        <template slot-scope="scope">
          {{ scope.row.faker == 1 ? '是' : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <router-link :to="`/user/show/?zone=${scope.row.zone}`">
            <el-button
              type="primary"
              size="mini"
            >
              查看详情
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :state="pageState"
      :change="getData"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'UserDalao',
  mixins: [pageMixin],
  created() {
    this.getData(1)
  },
  methods: {
    getData(page) {
      if (page <= this.pageState.max) {
        this.pageState.cur = page
        return
      }
      if (page - this.pageState.max > 3) {
        this.$toast.error('一次获取的数据太多')
        return
      }
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.pageState.size = 10
      this.$axios
        .$get('admin/user/dalao', {
          params: {
            to_page: page,
            cur_page: this.pageState.cur,
            take: this.pageState.size
          }
        })
        .then(data => {
          this.pageState.total = data.total
          this.pageState.cur = page
          this.pageState.max = page
          this.pageList = this.pageList.concat(data.list)
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    }
  }
}
</script>
