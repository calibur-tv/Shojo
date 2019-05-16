<template>
  <div
    v-loading="pageLoading"
    id="tag-list"
  >
    <header class="page-header">
      <el-row>
        <el-col :span="18">
          <el-select
            v-model="selectedType"
            placeholder="选择查询种类"
            @change="getData"
          >
            <el-option
              v-for="type in types"
              :key="type.value"
              :label="type.text"
              :value="type.value"
            />
          </el-select>
        </el-col>
        <el-col
          :span="6"
          style="text-align: right"
        >
          <el-button
            type="primary"
            @click="showCreateModal = true"
          >
            <i class="el-icon-plus"/>
            添加标签
          </el-button>
        </el-col>
      </el-row>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        prop="id"
        label="索引"
      />
      <el-table-column
        prop="name"
        label="名称"
      />
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            icon="edit"
            @click="editTagName(scope.row)"
          >修改名称</el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :change="handlePageChange"
      :state="pageState"
    />
    <v-dialog
      v-model="showCreateModal"
      title="创建标签"
      @submit="handleCreateDone"
    >
      <el-form
        :model="createForm"
        :loading="createLoading"
        label-width="60px"
      >
        <el-form-item label="类型">
          <el-select
            v-model="createForm.type"
            placeholder="请选择标签类别"
          >
            <el-option
              v-for="type in types"
              :key="type.value"
              :value="type.value"
              :label="type.text"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model.trim="createForm.name"/>
        </el-form-item>
      </el-form>
    </v-dialog>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'TagList',
  mixins: [pageMixin],
  data() {
    return {
      showCreateModal: false,
      createLoading: false,
      types: [
        {
          value: 'bangumi',
          text: '番剧'
        },
        {
          value: 'post',
          text: '帖子'
        },
        {
          value: 'index',
          text: '运营'
        }
      ],
      selectedType: 'bangumi',
      createForm: {
        type: '',
        name: ''
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/tag/all', {
          params: { type: this.selectedType }
        })
        .then(data => {
          this.pageState.total = data.length
          this.pageState.cur = 1
          this.pageState.size = 20
          this.pageList = data
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    editTagName(tag) {
      if (this.canNot('创建编辑标签')) {
        return
      }
      this.$prompt('请输入新名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          this.$axios
            .$post('admin/tag/edit', {
              id: tag.id,
              name: value,
              type: this.selectedType
            })
            .then(() => {
              tag.name = value
            })
        })
        .catch(() => {})
    },
    handleCreateDone() {
      if (this.canNot('创建编辑标签')) {
        return
      }
      const name = this.createForm.name
      if (!this.createForm.name) {
        this.$toast.error('名字不能为空')
        return
      }
      for (const tag of this.pageList) {
        if (tag.name === name) {
          this.$toast.error('标签已存在')
          return
        }
      }
      if (this.createLoading) {
        return
      }
      this.createLoading = true
      this.$axios
        .$post('admin/tag/create', {
          name,
          type: this.createForm.type
        })
        .then(id => {
          this.pageList.unshift({
            name,
            id
          })
          this.pageState.total++
          this.createLoading = false
          this.showCreateModal = false
        })
        .catch(() => {
          this.createLoading = false
        })
    }
  }
}
</script>
