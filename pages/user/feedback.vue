<template>
  <div
    id="user-feedback"
    v-loading="pageLoading"
  >
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="类型">
        <template slot-scope="scope">
          {{ computeType(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column
        label="内容"
        prop="desc"
      />
      <el-table-column label="浏览器">
        <template slot-scope="scope">
          <div v-html="computeUA(scope.row.ua)" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            @click="remove(scope.$index, scope.row.id)"
          >
            确认
          </el-button>
          <router-link
            v-if="scope.row.user_id != 0"
            :to="`/user/show/?id=${scope.row.user_id}`"
          >
            <el-button
              size="small"
              type="primary"
              style="margin-left: 10px"
            >
              查看用户
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :state="pageState"
      :change="handlePageChange"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'
import UAParser from 'ua-parser-js'

export default {
  name: 'UserFeedback',
  mixins: [pageMixin],
  data() {
    return {
      options: [
        {
          label: '功能建议',
          value: 1
        },
        {
          label: '遇到错误',
          value: 2
        },
        {
          label: '资源报错',
          value: 4
        },
        {
          label: '求资源',
          value: 5
        },
        {
          label: '求偶像',
          value: 6
        },
        {
          label: '其它问题',
          value: 3
        }
      ]
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/user/feedback/list')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 15
          this.pageState.total = data.length
          this.pageList = data
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    computeType(type) {
      let result = ''
      this.options.forEach(item => {
        if (item.value === parseInt(type, 10)) {
          result = item.label
        }
      })
      return result
    },
    computeUA(ua) {
      if (/-----/.test(ua)) {
        const arr = ua.split('-----')
        let result = `厂商：${arr[0]}<br>型号：${arr[1]}`
        if (arr[2]) {
          result = `${result}<br>App版本：${arr[2]}`
        }
        if (arr[3]) {
          result = `${result}<br>系统版本：${arr[3]}`
        }
        return result
      }
      const parser = new UAParser()
      parser.setUA(ua)
      const result = parser.getResult()
      return `系统：${result.os.name} - ${result.os.version}<br>浏览器：${
        result.browser.name
      } - ${result.browser.version}`
    },
    remove(index, id) {
      if (this.canNot('操作用户反馈')) {
        return
      }
      this.$axios.$post('admin/user/feedback/read', { id }).then(() => {
        this.pageList.splice(
          (this.pageState.cur - 1) * this.pageState.size + index,
          1
        )
        this.pageState.total--
        this.$store.commit('CHANGE_TODO', {
          key: 'feedback'
        })
      })
    }
  }
}
</script>
