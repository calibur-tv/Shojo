<template>
  <div id="bangumi-create">
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
      </el-form-item>
      <el-form-item
        label="番剧别名"
        prop="alias"
        required
      >
        <el-input
          v-model.trim="form.alias"
          type="textarea"
          placeholder="中文名、日文名、英文名... 名字之间以逗号分隔"
        />
      </el-form-item>
      <el-form-item label="连载周期">
        <el-select
          v-model="form.released_at"
          placeholder="请选择"
        >
          <el-option
            v-for="item in releaseWeekly"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="外站视频">
        <el-switch v-model="form.others_site_video" />
      </el-form-item>
      <el-form-item label="已完结">
        <el-switch v-model="form.end" />
      </el-form-item>
      <el-form-item label="有视频">
        <el-switch v-model="form.has_video" />
      </el-form-item>
      <el-form-item label="有漫画">
        <el-switch v-model="form.has_cartoon" />
      </el-form-item>
      <el-form-item
        label="上映日期"
        prop="published_at"
        required
      >
        <el-date-picker
          v-model="form.published_at"
          type="date"
          placeholder="选择日期"
        />
      </el-form-item>
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
            <template slot="prepend">
              https://image.calibur.tv/
            </template>
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
                <i class="el-icon-plus" />
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
            trigger="hover"
          >
            <img :src="imagePrefix + form.avatar">
          </el-popover>
          <a
            v-popover:popoverAvatar
            :href="imagePrefix + form.avatar"
            type="text"
            target="_blank"
          >
            <i class="el-icon-view" />&nbsp;预览
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
            <template slot="prepend">
              https://image.calibur.tv/
            </template>
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
                <i class="el-icon-plus" />
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
            <i class="el-icon-view" />&nbsp;预览
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
      <el-form-item>
        <el-col
          :span="3"
          :offset="21"
        >
          <el-button
            type="primary"
            @click="submitForm"
          >
            立即创建
          </el-button>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import uploadMixin from '~/mixins/upload'

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
    const validatePublish = (rule, value, callback) => {
      if (value === 0 || value === '') {
        callback(new Error('请选择上映日期'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      tags: [],
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
      form: {
        name: '',
        alias: '',
        released_at: 0,
        published_at: '',
        tags: [],
        avatar: '',
        banner: '',
        summary: '',
        others_site_video: false,
        end: false,
        has_video: true,
        has_cartoon: false
      },
      rules: {
        name: [{ required: true, message: '请输入番剧名称', trigger: 'blur' }],
        alias: [{ validator: validateAlias, trigger: 'blur' }],
        published_at: [{ validator: validatePublish, trigger: 'change' }],
        tags: [{ validator: validateTags, trigger: 'change' }],
        summary: [
          { required: true, message: '简介不能为空', trigger: 'blur' },
          { min: 1, max: 250, message: '最多250字', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getBangumiTags()
  },
  methods: {
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
    submitForm() {
      if (this.canNot('创建编辑番剧')) {
        return
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          const params = Object.assign({}, this.form, {
            published_at: new Date(this.form.published_at).getTime() / 1000
          })
          try {
            const newBangumiId = await this.$axios.$post(
              'admin/bangumi/create',
              params
            )
            setTimeout(() => {
              window.location = `/bangumi/edit/?id=${newBangumiId}`
            }, 2000)
          } catch (e) {
            this.$toast.error('操作失败')
          }
        }
      })
    }
  }
}
</script>
