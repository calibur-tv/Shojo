<style lang="scss">
#bangumi-import {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .button-new-tag {
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    vertical-align: top;
  }
}
</style>

<template>
  <div id="bangumi-import">
    <header class="page-header">
      <ElButton type="primary" @click="showCreateDialog = true">
        创建番剧
      </ElButton>
    </header>
    <ElTable
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="索引"
        prop="id"
      />
      <el-table-column
        label="名称"
        prop="name"
      />
      <el-table-column
        label="类型"
      >
        <template slot-scope="scope">
          {{ computedType(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column
        label="来源"
      >
        <template slot-scope="scope">
          <a
            :href="`http://bgm.tv/subject/${scope.row.source_id}`"
            target="_blank"
          >
            {{ scope.row.source_id }}
          </a>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <NLink :to="`/bangumi/show?slug=${scope.row.slug}`">
            <ElButton
              type="primary"
              size="small"
            >
              查看
            </ElButton>
          </NLink>
        </template>
      </el-table-column>
    </ElTable>
    <VDialog
      v-model="showCreateDialog"
      title="创建番剧"
      @submit="handleCreateBangumi"
    >
      <el-form label-position="top" :disabled="creating">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="头像">
          <VUploader
            v-model="form.avatar"
            :cookie="false"
            required
            :url="imageUploadAction"
            :accept="imageUploadAccept"
            :transform-request="imageUploadRequest"
            :transform-response="imageUploadResponse"
          />
        </el-form-item>
        <el-form-item label="别名">
          <el-tag
            v-for="(name, index) in form.alias"
            :key="name"
            closable
            :disable-transitions="false"
            @close="removeAlias(index)"
          >
            {{ name }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            size="small"
            class="input-new-tag"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            添加别名
          </el-button>
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="form.intro"
            :rows="5"
            :maxlength="500"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option
              v-for="item in types"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="form.source_id" />
        </el-form-item>
      </el-form>
    </VDialog>
    <VPage
      :state="pageState"
      :change="getData"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'
import uploadMixin from '~/mixins/upload'

export default {
  name: 'BangumiImport',
  components: {},
  mixins: [pageMixin, uploadMixin],
  props: {},
  data() {
    return {
      showCreateDialog: false,
      inputVisible: false,
      inputValue: '',
      form: {
        name: '',
        avatar: '',
        alias: [],
        intro: '',
        source_id: '',
        type: 0
      },
      creating: false
    }
  },
  computed: {
    types() {
      return [
        {
          id: 0,
          name: '动漫'
        },
        {
          id: 1,
          name: '游戏'
        },
        {
          id: 9,
          name: '其它'
        }
      ]
    }
  },
  watch: {},
  created() {
    this.getData(1)
  },
  mounted() {},
  methods: {
    computedType(type) {
      return [
        '动漫',
        '游戏',
        '分区',
        '-',
        '-',
        '-',
        '-',
        '-',
        '其它'
      ][type]
    },
    handleCreateBangumi() {
      if (!this.form.name) {
        return
      }

      if (!this.form.avatar) {
        return
      }

      if (!this.form.alias.length) {
        return
      }

      if (!this.form.intro) {
        return
      }

      if (!this.form.source_id) {
        return
      }

      if (this.creating) {
        return
      }

      this.creating = true
      this.$axios.$post('bangumi/create', {
        ...this.form,
        alias: [this.form.name, ...this.form.alias]
      })
        .then((res) => {
          this.$router.push({
            path: `/bangumi/show?slug=${res}`
          })
        })
        .finally(() => {
          this.creating = false
        })
    },
    removeAlias(index) {
      this.form.alias.splice(index, 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const val = this.inputValue
      if (!val) {
        return
      }
      if (this.form.alias.includes(val)) {
        return
      }
      this.form.alias.push(val)
      this.inputValue = ''
      this.inputVisible = false
    },
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
      this.pageState.size = 20
      this.$axios
        .$get('bangumi/all', {
          params: {
            to_page: page,
            cur_page: this.pageState.cur,
            take: 100
          }
        })
        .then((data) => {
          this.pageState.total = data.total
          this.pageState.cur = page
          this.pageState.max = page
          this.pageList = this.pageList.concat(data.result)
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    }
  }
}
</script>
