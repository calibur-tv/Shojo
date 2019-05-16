<template>
  <div id="app-template">
    <header
      v-if="isKing"
      class="page-header"
    >
      <el-row>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="showCreateModal = true"
          >
            <i class="el-icon-plus"/>
            更新
          </el-button>
        </el-col>
        <el-col :span="4">
          <a
            href="http://www.json.cn/"
            target="_blank"
          >
            <el-button>
              JSON格式化工具
            </el-button>
          </a>
        </el-col>
      </el-row>
      <v-dialog
        v-model="showCreateModal"
        :loading="loading"
        title="更新模板"
        @submit="submit"
      >
        <el-input
          v-model.trim="jsonStr"
          :rows="10"
          type="textarea"
          placeholder="请输入内容"
        />
      </v-dialog>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="页面">
        <template slot-scope="scope">
          {{ scope.row.page }}
        </template>
      </el-table-column>
      <el-table-column label="版本">
        <template slot-scope="scope">
          {{ scope.row.version }}
        </template>
      </el-table-column>
      <el-table-column label="链接">
        <template slot-scope="scope">
          <a
            :href="scope.row.url"
            target="_blank"
            v-text="scope.row.url"
          />
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

export default {
  name: 'AppTemplate',
  mixins: [pageMixin],
  data() {
    return {
      showCreateModal: false,
      jsonStr: '',
      loading: false
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
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('app/template')
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
    async submit() {
      if (this.canNot('发布页面模板')) {
        return
      }
      if (this.loading) {
        return
      }
      try {
        const dataObj = JSON.parse(this.jsonStr)
        const list = []
        Object.keys(dataObj).forEach(key => {
          list.push({
            version: key.split('-v')[1],
            page: key.split('-v')[0],
            url: dataObj[key].file
          })
        })
        this.loading = true
        this.$axios.$post('admin/app/setTemplates', { list }).then(() => {
          window.location.reload()
        })
      } catch (e) {
        this.$toast.error(typeof e === 'string' ? e : '数据格式错误，不是JSON')
      }
    }
  }
}
</script>
