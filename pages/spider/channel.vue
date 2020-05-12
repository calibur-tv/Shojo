<style lang="scss">
</style>

<template>
  <div
    id="spider-channel"
    v-loading="pageLoading"
  >
    <el-table
      :data="channel"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="渠道"
        prop="name"
      />
      <el-table-column
        label="状态"
        prop="status"
      >
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="updateCookie(scope.row)"
          >
            更新cookie
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  mixins: [pageMixin],
  data() {
    return {
      channel: []
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getChannels()
  },
  mounted() {},
  methods: {
    getChannels() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios.$get('console/spider/oauth/get_channel_list')
        .then((res) => {
          this.channel = res
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    updateCookie({ name }) {
      this.$prompt('请输入新的cookie', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value) {
            this.$toast.error('cookie 不能为空')
            return
          }
          this.$axios.$post('console/spider/oauth/set_channel_cookie', {
            data: value,
            channel: name
          })
            .then(() => {
              window.location.reload()
            })
        })
        .catch(() => {})
    }
  }
}
</script>
