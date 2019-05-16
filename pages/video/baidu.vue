<style lang="scss">
</style>

<template>
  <div
    v-loading="pageLoading"
    id="video-baidu"
  >
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="视频id">
        <a
          slot-scope="scope"
          :href="$alias.video(scope.row.id)"
          target="_blank"
          v-text="scope.row.id"
        />
      </el-table-column>
      <el-table-column label="番剧">
        <a
          slot-scope="scope"
          :href="$alias.bangumi(scope.row.bangumi_id)"
          target="_blank"
          v-text="scope.row.bangumi.name"
        />
      </el-table-column>
      <el-table-column
        label="名称"
        prop="name"
      />
      <el-table-column
        label="云链接"
      >
        <a
          slot-scope="scope"
          :href="scope.row.baidu_cloud_src"
          target="_blank"
          v-text="scope.row.baidu_cloud_src"
        />
      </el-table-column>
      <el-table-column
        label="云密码"
        prop="baidu_cloud_pwd"
      />
      <el-table-column
        label="集数"
        prop="episode"
      />
      <el-table-column
        label="时间"
        prop="created_at"
      />
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
  name: 'VideoBaidu',
  mixins: [pageMixin],
  created() {
    this.getData(1)
  },
  methods: {
    async getData(page) {
      if (page <= this.pageState.max) {
        this.pageState.cur = page
        return
      }
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.pageState.size = 20
      this.$axios
        .$get('admin/video/baidu_list', {
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
