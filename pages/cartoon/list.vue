<template>
  <div
    id="cartoon-list"
    v-loading="pageLoading"
  >
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="番名">
        <template slot-scope="scope">
          <a
            :href="$alias.bangumi(scope.row.id)"
            target="_blank"
          >{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <router-link :to="`/cartoon/edit/?id=${scope.row.id}`">
            <el-button
              size="small"
              type="primary"
              icon="edit"
            >
              编辑漫画
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :change="handlePageChange"
      :state="pageState"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'CartoonList',
  mixins: [pageMixin],
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/cartoon/bangumis')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.total = data.length
          this.pageList = data
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    }
  }
}
</script>
