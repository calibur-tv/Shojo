<style lang="scss">
#spider-menu {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>

<template>
  <div
    id="spider-menu"
    v-loading="pageLoading"
  >
    <header class="page-header">
      <ElButton type="primary" @click="createMenuType">
        添加分类
      </ElButton>
      <ElButton type="primary" @click="showDialog = true">
        添加网站
      </ElButton>
    </header>
    <el-tag v-for="item in menu" :key="item.id">
      {{ item.name }}
    </el-tag>
    <el-table
      :data="link"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="索引"
        prop="id"
      />
      <el-table-column
        label="链接"
        prop="href"
      >
        <template slot-scope="scope">
          <a target="_blank" :href="scope.row.href" v-text="scope.row.name" />
        </template>
      </el-table-column>
      <el-table-column
        label="分类"
        prop="href"
      >
        <template slot-scope="scope">
          <span v-text="computedType(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column
        label="点击"
        prop="click_count"
      />
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <ElButton
            v-if="scope.row.deleted_at"
            type="primary"
            size="small"
          >
            已删除
          </ElButton>
          <ElButton
            v-else
            type="danger"
            size="small"
            @click="deleteLink(scope.row)"
          >
            删除
          </ElButton>
        </template>
      </el-table-column>
    </el-table>
    <VDialog
      v-model="showDialog"
      title="添加网站"
      @submit="handleCreateLink"
    >
      <el-form label-position="top">
        <el-form-item label="名称">
          <el-input v-model="form.name" :maxlength="10" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.type">
            <el-option
              v-for="item in menu"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.href" />
        </el-form-item>
      </el-form>
    </VDialog>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  mixins: [pageMixin],
  props: {},
  data() {
    return {
      menu: [],
      link: [],
      showDialog: false,
      form: {
        name: '',
        href: '',
        type: ''
      }
    }
  },
  created() {
    this.getAllMenu()
    this.getAllLink()
  },
  methods: {
    computedType({ type }) {
      return this.menu.find(_ => _.id === type).name
    },
    getAllMenu() {
      this.$axios.$get('console/cm/show_all_menu_type')
        .then((res) => {
          this.menu = res
        })
    },
    getAllLink() {
      this.pageLoading = true
      this.$axios.$get('console/cm/show_all_menu_list')
        .then((res) => {
          this.link = res
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    createMenuType() {
      this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          if (!value) {
            return
          }
          this.$axios.$post('console/cm/create_menu_type', {
            name: value
          })
            .then(() => {
              window.location.reload()
            })
        })
        .catch(() => {})
    },
    handleCreateLink() {
      if (!this.form.name || !this.form.type || !this.form.href) {
        return
      }
      if (!/^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(this.form.href)) {
        return
      }
      this.$axios.$post('console/cm/create_menu_link', { ...this.form })
        .then(() => {
          window.location.reload()
        })
    },
    deleteLink({ id }) {
      this.$confirm('确认要删除该网站吗？', '提示')
        .then(() => {
          this.$axios.$post('console/cm/delete_menu_link', { id })
            .then(() => {
              window.location.reload()
            })
        })
        .catch(() => {})
    }
  }
}
</script>
