<template>
  <div id="bangumi-edit">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="番剧名称"
        prop="name"
      >
        <el-col :span="8">
          <el-input
            v-model.trim="form.name"
            placeholder="中文名"
          />
        </el-col>
        <el-col
          :offset="10"
          :span="6"
          style="text-align: right"
        >
          <el-button
            v-if="form.deleted_at"
            type="success"
            @click="handleDelete"
          >恢复番剧</el-button>
          <el-button
            v-else
            type="danger"
            @click="handleDelete"
          >删除番剧</el-button>
          <el-button
            type="primary"
            @click="editBangumiInfo"
          >更新番剧</el-button>
        </el-col>
      </el-form-item>
      <el-form-item
        label="番剧别名"
        prop="alias"
        required
      >
        <el-input
          v-model.trim="form.alias"
          placeholder="中文名、日文名、英文名... 名字之间以逗号分隔"
        />
      </el-form-item>
      <el-row>
        <el-col :span="4">
          <el-form-item label="有视频">
            <el-switch v-model="form.has_video"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="有漫画">
            <el-switch v-model="form.has_cartoon"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="有漫评">
            <el-switch v-model="form.has_score"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        label="番剧标签"
        prop="tags"
        required
      >
        <el-select
          v-model="form.tags"
          style="width: 100%"
          multiple
          placeholder="可多选，至少选择一个"
        >
          <el-option
            v-for="item in tags"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="板块类型"
        prop="type"
        required
      >
        <el-select v-model="form.type">
          <el-option
            v-for="item in types"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="番剧头像"
        prop="avatar"
        required
      >
        <el-col :span="16">
          <el-input
            v-model.trim="form.avatar"
            :disabled="true"
            auto-complete="off"
          >
            <template slot="prepend">https://image.calibur.tv/</template>
          </el-input>
        </el-col>
        <el-col
          :span="2"
          :offset="1"
        >
          <el-form-item>
            <el-upload
              :data="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-error="handleImageUploadError"
              :before-upload="beforeAvatarUpload"
              :action="imageUploadAction"
              :accept="imageUploadAccept"
            >
              <el-button type="text">
                <i class="el-icon-plus"/>
                上传
              </el-button>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col
          v-if="form.avatar"
          :span="2"
        >
          <el-popover
            ref="popoverAvatar"
            placement="left"
            width="200"
            trigger="hover">
            <img :src="imagePrefix + form.avatar">
          </el-popover>
          <a
            v-popover:popoverAvatar
            :href="imagePrefix + form.avatar"
            type="text"
            target="_blank"
          >
            <i class="el-icon-view"/>&nbsp;预览
          </a>
        </el-col>
      </el-form-item>
      <el-form-item
        label="番剧背景"
        prop="banner"
        required
      >
        <el-col :span="16">
          <el-input
            v-model.trim="form.banner"
            :disabled="true"
            auto-complete="off"
          >
            <template slot="prepend">https://image.calibur.tv/</template>
          </el-input>
        </el-col>
        <el-col
          :span="2"
          :offset="1"
        >
          <el-form-item>
            <el-upload
              :data="uploadHeaders"
              :show-file-list="false"
              :on-success="handleBannerSuccess"
              :on-error="handleImageUploadError"
              :before-upload="beforeBannerUpload"
              :action="imageUploadAction"
              :accept="imageUploadAccept"
            >
              <el-button type="text">
                <i class="el-icon-plus"/>
                上传
              </el-button>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col
          v-if="form.banner"
          :span="2"
        >
          <el-popover
            ref="popoverBanner"
            placement="left"
            width="200"
            trigger="hover"
          >
            <img :src="imagePrefix + form.banner">
          </el-popover>
          <a
            v-popover:popoverBanner
            :href="imagePrefix + form.banner"
            type="text"
            target="_blank"
          >
            <i class="el-icon-view"/>&nbsp;预览
          </a>
        </el-col>
      </el-form-item>
      <el-form-item
        label="番剧简介"
        prop="summary"
      >
        <el-input
          v-model.trim="form.summary"
          :rows="4"
          type="textarea"
          placeholder="请输入番剧简介，最多250字，纯文本不支持各种换行符"
        />
      </el-form-item>
    </el-form>
    <el-alert
      title="以下是季度信息，与番剧信息分开编辑保存"
      type="info"
      style="margin-bottom: 20px"
    />
    <el-tabs 
      v-model="editableTabsValue" 
      type="card" 
      editable 
      @edit="handleTabsEdit">
      <el-tab-pane
        v-for="(item, index) in seasons"
        :key="`${index}-${item.id}`"
        :label="item.tab_name"
        :name="item.tab_name"
      >
        <el-form
          :ref="`season-${item.id}`"
          :model="item"
          :rules="seasonRule"
          label-width="100px"
        >
          <el-form-item
            label="季度名称"
            prop="name"
          >
            <el-col :span="8">
              <el-input
                v-model.trim="item.name"
                placeholder="季度名"
              />
            </el-col>
            <el-col
              :offset="10"
              :span="6"
              style="text-align: right"
            >
              <el-button
                type="warning"
                @click="updateRelease"
              >发布视频</el-button>
              <el-button
                type="primary"
                @click="editSeasonInfo"
              >更新季度</el-button>
            </el-col>
          </el-form-item>
          <el-form-item
            label="季度简介"
            prop="summary"
          >
            <el-input
              v-model.trim="item.summary"
              :rows="4"
              type="textarea"
              placeholder="季度简介，最多250字，纯文本不支持各种换行符"
            />
          </el-form-item>
          <el-form-item
            label="季度封面"
            prop="avatar"
            required
          >
            <el-col :span="16">
              <el-input
                v-model.trim="item.avatar"
                :disabled="true"
                auto-complete="off"
              >
                <template slot="prepend">https://image.calibur.tv/</template>
              </el-input>
            </el-col>
            <el-col
              :span="2"
              :offset="1"
            >
              <el-form-item>
                <el-upload
                  :data="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handlePosterUploadSuccess"
                  :on-error="handleImageUploadError"
                  :before-upload="beforeAvatarUpload"
                  :action="imageUploadAction"
                  :accept="imageUploadAccept"
                >
                  <el-button type="text">
                    <i class="el-icon-plus"/>
                    上传
                  </el-button>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col
              v-if="item.avatar"
              :span="2"
            >
              <el-popover
                :ref="`popoverPoster-${item.id}`"
                placement="left"
                width="200"
                trigger="hover">
                <img :src="imagePrefix + item.avatar">
              </el-popover>
              <a
                v-popover="`popoverPoster-${item.id}`"
                :href="imagePrefix + item.avatar"
                type="text"
                target="_blank"
              >
                <i class="el-icon-view"/>&nbsp;预览
              </a>
            </el-col>
          </el-form-item>
          <el-form-item
            label="上映日期"
            prop="published_at"
            required
          >
            <el-date-picker
              v-model="item.published_at"
              :clearable="false"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="连载周期">
            <el-select
              v-model="item.released_at"
              placeholder="请选择"
            >
              <el-option
                v-for="day in releaseWeekly"
                :key="day.id"
                :label="day.name"
                :value="day.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="版权类型">
            <el-select v-model="item.copyright_type">
              <el-option
                v-for="item in copyrightOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="外站视频">
            <el-switch v-model="item.other_site_video"/>
          </el-form-item>
          <el-form-item label="已完结">
            <el-switch v-model="item.end"/>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import uploadMixin from '~/mixins/upload'
const copyright = [
  '未知',
  '责令下架',
  '独家播放',
  '多家全收费',
  '多家个别收费',
  '多家全免费',
  '广电禁播',
  '无版权'
]
const copyrightOptions = []
copyright.forEach((item, index) => {
  copyrightOptions.push({
    label: item,
    value: index
  })
})

export default {
  mixins: [uploadMixin],
  data() {
    const validateTags = (rule, value, callback) => {
      if (!value || !value.length) {
        return callback(new Error('至少保留 1 个标签'))
      }
      if (value.length > 10) {
        return callback(new Error('最多选择 10 个标签'))
      }
      callback()
    }
    const validateAlias = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入番剧别名'))
      } else if (value.split(/,|，/).length <= 1) {
        callback(new Error('请输入多个别名，用逗号分隔'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      tags: [],
      types: [
        {
          id: 0,
          name: '番剧'
        },
        {
          id: 1,
          name: '游戏'
        },
        {
          id: 2,
          name: '话题'
        }
      ],
      releaseWeekly: [
        {
          id: 0,
          name: '不连载'
        },
        {
          id: 1,
          name: '周一'
        },
        {
          id: 2,
          name: '周二'
        },
        {
          id: 3,
          name: '周三'
        },
        {
          id: 4,
          name: '周四'
        },
        {
          id: 5,
          name: '周五'
        },
        {
          id: 6,
          name: '周六'
        },
        {
          id: 7,
          name: '周日'
        }
      ],
      copyrightOptions,
      form: {
        name: '',
        alias: '',
        tags: [],
        type: '',
        avatar: '',
        banner: '',
        summary: '',
        has_video: true,
        has_cartoon: false,
        has_score: true
      },
      rules: {
        name: [{ required: true, message: '请输入番剧名称', trigger: 'blur' }],
        alias: [{ validator: validateAlias, trigger: 'blur' }],
        tags: [{ validator: validateTags, trigger: 'change' }],
        summary: [
          { required: true, message: '简介不能为空', trigger: 'blur' },
          { min: 1, max: 250, message: '最多250字', trigger: 'blur' }
        ]
      },
      seasons: [],
      editableTabsValue: '',
      tabIndex: 0,
      seasonRule: {}
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.getBangumiById()
    this.getBangumiTags()
  },
  methods: {
    getBangumiById() {
      this.$refs.form.resetFields()
      this.loading = true
      this.$axios
        .$get('admin/bangumi/info', {
          params: { id: this.id }
        })
        .then(resp => {
          this.form = Object.assign(resp, {
            banner: resp.banner.split('.calibur.tv/').pop(),
            avatar: resp.avatar.split('.calibur.tv/').pop(),
            tags: resp.tags.map(_ => _.id)
          })
          const season = resp.season.map(_ => {
            return Object.assign(_, {
              tab_name: _.name ? _.name : `第${_.rank}季`,
              avatar: _.avatar.split('.calibur.tv/').pop()
            })
          })
          this.seasons = season
          this.tabIndex = season.length - 1
          this.editableTabsValue = season[this.tabIndex].tab_name
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getBangumiTags() {
      this.$axios.$get('bangumi/tags').then(data => {
        this.tags = data
      })
    },
    beforeAvatarUpload(file) {
      this.uploadConfig.max = 1
      return this.beforeImageUpload(file)
    },
    beforeBannerUpload(file) {
      this.uploadConfig.max = 3
      return this.beforeImageUpload(file)
    },
    handleAvatarSuccess(res) {
      this.$toast.success('上传成功')
      this.form.avatar = res.data.url
    },
    handleBannerSuccess(res) {
      this.$toast.success('上传成功')
      this.form.banner = res.data.url
    },
    editBangumiInfo() {
      if (this.canNot('创建编辑番剧')) {
        return
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          const params = Object.assign({}, this.form, {
            published_at: new Date(this.form.published_at).getTime() / 1000
          })
          try {
            await this.$axios.$post('admin/bangumi/edit', params)
            window.location.reload()
          } catch (e) {
            this.$toast.error('操作失败')
          }
        }
      })
    },
    updateRelease() {
      if (this.canNot('操作视频')) {
        return
      }
      this.$prompt('请输入视频id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^([1-9][0-9]*)$/,
        inputErrorMessage: 'id 格式不正确'
      })
        .then(({ value }) => {
          this.$axios.$post('admin/bangumi/release', {
            season_id: this.seasons[this.tabIndex].id,
            video_id: value
          })
        })
        .catch(() => {})
    },
    handleDelete() {
      if (this.canNot('删除番剧')) {
        return
      }
      this.$confirm('确认要执行该操作吗?', '提示')
        .then(() => {
          this.$axios
            .$post('admin/bangumi/delete', {
              id: this.id
            })
            .then(() => {
              this.form.deleted_at = !this.form.deleted_at
            })
            .catch(() => {
              this.$toast.error('操作失败')
            })
        })
        .catch(() => {})
    },
    handlePosterUploadSuccess(res) {
      this.$toast.success('上传成功')
      this.seasons[this.tabIndex].avatar = res.data.url
    },
    async editSeasonInfo() {
      if (this.canNot('创建编辑番剧')) {
        return
      }
      const form = this.seasons[this.tabIndex]
      if (!form.published_at) {
        this.$toast.error('上映日期不能为空')
        return
      }
      if (!form.avatar) {
        this.$toast.error('季度封面不能为空')
        return
      }
      const params = Object.assign({}, form, {
        published_at: new Date(form.published_at).getTime() / 1000
      })
      try {
        if (form.id) {
          await this.$axios.$post('admin/bangumi/edit_season', params)
        } else {
          await this.$axios.$post('admin/bangumi/create_season', params)
        }
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (e) {
        this.$toast.error('操作失败')
      }
    },
    handleTabsEdit(targetName, action) {
      if (action === 'add') {
        const rank = this.seasons[this.seasons.length - 1].rank + 1
        let newTabName = `第${rank}季`
        this.seasons.push({
          id: 0,
          name: '',
          bangumi_id: this.id,
          tab_name: newTabName,
          other_site_video: false,
          end: false,
          released_at: 0,
          published_at: '',
          avatar: '',
          summary: '',
          rank
        })
        this.editableTabsValue = newTabName
        this.tabIndex = this.seasons.length - 1
      }
      if (action === 'remove') {
        const form = this.seasons[this.tabIndex]
        if (!form.published_at) {
          this.seasons = this.seasons.filter(tab => tab.tab_name !== targetName)
          this.tabIndex = this.seasons.length - 1
          this.editableTabsValue = this.seasons[this.tabIndex].tab_name
        } else {
          this.$toast.warn('还不支持删除季度')
        }
      }
    }
  }
}
</script>
