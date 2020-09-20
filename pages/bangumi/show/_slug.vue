<style lang="scss">
#bangumi-show {
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

  .avatar {
    display: block;
    width: 100px;
    height: 100px;
  }
}
</style>

<template>
  <div
    id="bangumi-show"
    v-loading="pageLoading"
  >
    <el-tabs v-model="activeIndex" @tab-click="handleTabSwitch">
      <el-tab-pane label="简介" name="0">
        <ElForm
          v-if="form"
          :disable="submitting"
          label-position="top"
        >
          <el-form-item label="名称">
            <ElInput v-model="form.name" />
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
            <ElInput
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
          <el-form-item>
            <ElButton
              :loading="submitting"
              type="primary"
              @click="handleSubmit"
            >
              提交
            </ElButton>
          </el-form-item>
        </ElForm>
      </el-tab-pane>
      <el-tab-pane label="偶像" name="1">
        <div class="page-header">
          <ElButton type="primary" @click="showCreateIdolDialog = true">
            创建偶像
          </ElButton>
        </div>
        <ElTable
          :data="idols"
          border
          fit
          highlight-current-row
        >
          <el-table-column
            label="索引"
            prop="id"
          />
          <el-table-column
            label="头像"
          >
            <template slot-scope="scope">
              <img class="avatar" :src="$resize(scope.row.avatar, { width: 100 })">
            </template>
          </el-table-column>
          <el-table-column
            label="名字"
            prop="name"
          />
          <el-table-column
            label="操作"
          >
            <template slot-scope="scope">
              <NLink :to="`/idol/show?slug=${scope.row.slug}`">
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
          v-model="showCreateIdolDialog"
          title="创建偶像"
          @submit="handleCreateIdol"
        >
          <el-form label-position="top" :disabled="creating">
            <el-form-item label="名称">
              <el-input v-model="idol.name" />
            </el-form-item>
            <el-form-item label="头像">
              <VUploader
                v-model="idol.avatar"
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
                v-for="(name, index) in idol.alias"
                :key="name"
                closable
                :disable-transitions="false"
                @close="removeIdolAlias(index)"
              >
                {{ name }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="saveTagInput"
                v-model="inputValue"
                size="small"
                class="input-new-tag"
                @keyup.enter.native="handleIdolInputConfirm"
                @blur="handleIdolInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showIdolInput">
                添加别名
              </el-button>
            </el-form-item>
            <el-form-item label="简介">
              <el-input
                v-model="idol.intro"
                :rows="5"
                :maxlength="500"
                show-word-limit
                type="textarea"
              />
            </el-form-item>
            <el-form-item label="来源">
              <el-input v-model="idol.id" />
            </el-form-item>
          </el-form>
        </VDialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'
import uploadMixin from '~/mixins/upload'

export default {
  name: 'BangumiShow',
  components: {},
  mixins: [pageMixin, uploadMixin],
  data() {
    return {
      activeIndex: '0',
      inputVisible: false,
      inputValue: '',
      form: null,
      submitting: false,
      idols: [],
      showCreateIdolDialog: false,
      idol: {
        id: '',
        name: '',
        avatar: '',
        alias: [],
        intro: ''
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
    },
    slug() {
      return this.$route.query.slug
    }
  },
  watch: {},
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    handleTabSwitch() {
      if (this.activeIndex === '1') {
        this.getBangumiIdols()
      }
    },
    handleCreateIdol() {
      if (!this.idol.name) {
        return
      }

      if (!this.idol.alias.length) {
        return
      }

      if (!this.idol.avatar) {
        return
      }

      if (!this.idol.intro) {
        return
      }

      if (this.creating) {
        return
      }
      this.creating = true
      this.$axios
        .$post('idol/create', {
          ...this.idol,
          alias: [this.idol.name, ...this.idol.alias],
          bangumi_slug: this.slug
        })
        .then((slug) => {
          this.$router.push({
            path: `/idol/show?slug=${slug}`
          })
        })
        .finally(() => {
          this.creating = false
        })
    },
    getBangumiIdols() {
      this.$axios.$get('bangumi/idols', {
        params: {
          slug: this.slug,
          page: 1,
          take: 1000
        }
      })
        .then((res) => {
          this.idols = res.result
        })
    },
    handleSubmit() {
      if (!this.form.name) {
        return
      }

      if (!this.form.alias.length) {
        return
      }

      if (!this.form.avatar) {
        return
      }

      if (!this.form.intro) {
        return
      }

      if (this.submitting) {
        return
      }

      this.submitting = true
      this.$axios.$post('bangumi/update/profile', {
        ...this.form,
        slug: this.slug,
        alias: [this.form.name, ...this.form.alias]
      })
        .then(() => {
          // console.log(res)
        })
        .finally(() => {
          this.submitting = false
        })
    },
    getData() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios.$get('bangumi/show', {
        params: {
          slug: this.slug
        }
      })
        .then((res) => {
          this.form = res
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
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
    removeIdolAlias(index) {
      this.idol.alias.splice(index, 1)
    },
    showIdolInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleIdolInputConfirm() {
      const val = this.inputValue
      if (!val) {
        return
      }
      if (this.idol.alias.includes(val)) {
        return
      }
      this.idol.alias.push(val)
      this.inputValue = ''
      this.inputVisible = false
    }
  }
}
</script>

<style lang="scss">
</style>
