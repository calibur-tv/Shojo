<style lang="scss">
#idol-show {
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
  <div
    id="idol-show"
    v-loading="pageLoading"
  >
    <el-tabs v-model="activeIndex" @tab-click="handleTabSwitch">
      <el-tab-pane label="简介" name="0">
        <ElForm
          v-if="idol"
          :rules="rule"
          :disable="submitting"
          label-position="top"
        >
          <el-form-item label="名称">
            <ElInput v-model="idol.name" />
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
              v-model="idol.intro"
              :rows="5"
              :maxlength="500"
              show-word-limit
              type="textarea"
            />
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
      <el-tab-pane label="音频" name="1">
        <div class="page-header">
          <ElButton type="primary" @click="showCreateVoiceDialog = true">
            添加声源
          </ElButton>
        </div>
        <ElTable
          :data="voiceList"
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
            prop="link"
          >
            <template slot-scope="scope">
              <VAudio :src="scope.row.src" />
            </template>
          </el-table-column>
          <el-table-column
            label="文案"
            prop="text"
          />
          <el-table-column
            label="属性"
          >
            <template slot-scope="scope">
              {{ scope.row.meta }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
          >
            <template slot-scope="scope">
              <ElButton
                type="warning"
                size="small"
                @click="beginUpdateVoice(scope.row)"
              >
                更新
              </ElButton>
              <ElButton
                :type="scope.row.deleted_at ? '' : 'danger'"
                size="small"
                @click="deleteVoiceItem(scope.row)"
              >
                {{ scope.row.deleted_at ? '已删除' : '删除' }}
              </ElButton>
            </template>
          </el-table-column>
        </ElTable>
        <VDialog
          v-model="showCreateVoiceDialog"
          :title="voice.isUpdate ? '更新声源' : '添加声源'"
          @submit="handleCreateVoice"
        >
          <el-form label-position="top">
            <el-form-item label="资源">
              <VUploader
                v-model="voice.src"
                :cookie="false"
                required
                :url="imageUploadAction"
                :accept="['audio/mp4', 'audio/mp3']"
                :transform-request="imageUploadRequest"
                :transform-response="audioUploadResponse"
              >
                <template #display>
                  <VAudio v-if="voice.src" :src="voice.src" />
                </template>
              </VUploader>
            </el-form-item>
            <el-form-item label="文字">
              <ElInput
                v-model="voice.text"
                :rows="5"
                type="textarea"
                placeholder="请输入语音对应的文字"
              />
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
import VAudio from '~/components/Audio'

export default {
  name: 'IdolShow',
  components: {
    VAudio
  },
  mixins: [pageMixin, uploadMixin],
  data() {
    const validateAlias = (rule, value, callback) => {
      if (!value || !value.length) {
        callback(new Error('别名不能为空'))
      }
      if (value.some(_ => /,/.test(_))) {
        callback(new Error('别名不能包含英文逗号'))
      }
      if (value.join('').length > 100) {
        callback(new Error('别名最多100个字符'))
      }
      callback()
    }
    return {
      idol: null,
      rule: {
        alias: {
          type: 'array',
          validator: validateAlias
        }
      },
      submitting: false,
      inputVisible: false,
      inputValue: '',
      activeIndex: '0',
      showCreateVoiceDialog: false,
      voice: {
        id: 0,
        src: '',
        text: '',
        meta: null,
        isUpdate: false
      },
      creating: false,
      voiceList: []
    }
  },
  computed: {
    slug() {
      return this.$route.query.slug
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios.$get('idol/show', {
        params: {
          slug: this.slug
        }
      })
        .then((res) => {
          this.idol = res
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    handleTabSwitch() {
      if (this.activeIndex === '1') {
        this.getVoices()
      }
    },
    getVoices() {
      this.$axios.$get('console/live_room/voice/list', {
        params: {
          slug: this.slug
        }
      })
        .then((res) => {
          this.voiceList = res
        })
    },
    beginUpdateVoice(voice) {
      this.voice.id = voice.id
      this.voice.src = voice.src
      this.voice.meta = voice.meta
      this.voice.text = voice.text
      this.voice.isUpdate = true
      this.showCreateVoiceDialog = true
    },
    deleteVoiceItem(voice) {
      if (voice.deleted_at) {
        return
      }
      this.$confirm('确定要删除这条音频吗？', '确认')
        .then(() => {
          this.$axios.$post('console/live_room/voice/delete', {
            id: voice.id
          })
            .then(() => {
              voice.deleted_at = Date.now()
            })
        })
        .catch(() => {})
    },
    handleCreateVoice() {
      if (!this.voice.src) {
        this.$toast.info('请先上传音频')
        return
      }
      if (!this.voice.text) {
        this.$toast.info('必须填写文字')
        return
      }
      if (this.creating) {
        return
      }
      this.creating = true
      this.$axios.$post(`console/live_room/voice/${this.voice.isUpdate ? 'update' : 'create'}`, {
        slug: this.slug,
        ...this.voice
      })
        .then((res) => {
          if (this.voice.isUpdate) {
            this.voiceList.forEach((item, index) => {
              if (item.id === this.voice.id) {
                this.$set(this.voiceList, index, res)
              }
            })
          } else {
            this.voiceList.unshift(res.data)
          }
          this.showCreateVoiceDialog = false
          this.voice = {
            id: 0,
            src: '',
            text: '',
            meta: null,
            isUpdate: false
          }
        })
        .finally(() => {
          this.creating = false
        })
    },
    audioUploadResponse(resp) {
      try {
        const { format } = resp.data.meta
        this.voice.meta = {
          duration: +parseFloat(format.duration).toFixed(1),
          size: +format.size
        }
        return {
          ...resp.data,
          url: `${this.imagePrefix}${resp.data.url}`
        }
      } catch (e) {
        return {}
      }
    },
    handleSubmit() {
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

      if (this.submitting) {
        return
      }
      this.submitting = true
      this.$axios
        .$post('idol/update', {
          ...this.idol,
          alias: [this.idol.name, ...this.idol.alias]
        })
        .finally(() => {
          this.submitting = false
        })
    },
    removeAlias(index) {
      this.idol.alias.splice(index, 1)
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
