<style lang="scss">
#tag-cm {
  .page-header {
    .el-tag {
      margin-left: 10px;
    }
  }
}
</style>

<template>
  <div
    id="tag-cm"
    v-loading="pageLoading"
  >
    <div class="page-header">
      <el-row>
        <el-col :span="20">
          <el-radio-group
            v-model="selectedTagId"
            @change="changeSelectedTag"
          >
            <el-radio-button
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.id"
            >
              {{ tag.name }}
            </el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="showCreateModal = true"
          >
            <i class="el-icon-plus" />
            添加番剧
          </el-button>
        </el-col>
      </el-row>
      <v-dialog
        v-model="showCreateModal"
        title="添加番剧"
        @submit="addBangumi"
      >
        <el-form label-width="60px">
          <el-form-item label="标签">
            <el-select v-model="submitTagId">
              <el-option
                v-for="type in tags"
                :key="type.id"
                :value="type.id"
                :label="type.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="番剧">
            <bangumi-search @search="handleBangumiSearch" />
          </el-form-item>
        </el-form>
      </v-dialog>
    </div>
    <el-table
      :data="displayList"
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
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="small"
            icon="edit"
            @click="deleteBangumi(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'TagCm',
  props: {},
  data() {
    return {
      pageLoading: false,
      selectedTagId: 0,
      list: [],
      showCreateModal: false,
      submitTagId: 0,
      submitBangumiId: 0
    }
  },
  computed: {
    tags() {
      return this.list.map(_ => _.tag)
    },
    displayList() {
      const list = this.list.filter(_ => _.tag.id === this.selectedTagId)
      if (!list.length) {
        return []
      }
      return list[0].bangumis
    }
  },
  watch: {},
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    getData() {
      this.pageLoading = true
      this.$axios
        .$get('/flow/recommended', {
          params: { is_admin: '1' }
        })
        .then(data => {
          this.list = data
          if (data.length) {
            this.selectedTagId = data[0].tag.id
            this.submitTagId = this.selectedTagId
          }
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    deleteBangumi(bangumi) {
      this.$axios
        .$post('/cm/recommended/del', {
          tag_id: +this.submitTagId,
          bangumi_id: bangumi.id
        })
        .then(() => {
          window.location.reload()
        })
    },
    addBangumi() {
      if (!this.submitTagId || !this.submitBangumiId) {
        return
      }
      this.$axios
        .$post('/cm/recommended/set', {
          tag_id: +this.submitTagId,
          bangumi_id: this.submitBangumiId
        })
        .then(() => {
          window.location.reload()
        })
    },
    changeSelectedTag(tagId) {
      this.selectedTagId = tagId
      this.submitTagId = tagId
    },
    handleBangumiSearch(id) {
      this.submitBangumiId = id
    }
  }
}
</script>
