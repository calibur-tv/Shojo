<template>
  <div
    id="role-edit"
    v-loading="loading"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="角色名称"
        prop="name"
        required
      >
        <el-col :span="8">
          <el-input
            v-model.trim="form.name"
            placeholder="中文名"
          />
        </el-col>
      </el-form-item>
      <el-form-item
        label="角色别名"
        prop="alias"
        required
      >
        <el-input
          v-model.trim="form.alias"
          type="textarea"
          placeholder="中文名、日文名、英文名... 名字之间以英文逗号分隔"
        />
      </el-form-item>
      <el-form-item
        label="所属番剧"
        prop="bangumi_id"
      >
        <bangumi-search v-model="form.bangumi_id" />
      </el-form-item>
      <el-form-item
        label="角色头像"
        prop="avatar"
        required
      >
        <el-col :span="16">
          <el-input
            v-model.trim="form.avatar"
            :disabled="true"
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
              :before-upload="beforeImageUpload"
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
            width="100"
            trigger="hover"
          >
            <img :src="$resize(form.avatar, { width: 100 })">
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
        label="角色简介"
        prop="intro"
        required
      >
        <el-input
          v-model.trim="form.intro"
          :rows="4"
          type="textarea"
          placeholder="请输入角色简介，最多250字，纯文本不支持各种换行符"
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
            {{ id ? '确认编辑' : '立即创建' }}
          </el-button>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import uploadMixin from '~/mixins/upload'

export default {
  name: 'RoleCreate',
  mixins: [uploadMixin],
  data() {
    const validateAlias = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入番剧别名'))
      } else if (value.split(/,/).length <= 1) {
        callback(new Error('请输入多个别名，用英文逗号分隔'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        name: '',
        alias: '',
        bangumi_id: '',
        avatar: '',
        intro: ''
      },
      rules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        avatar: [{ required: true, message: '头像是必填', trigger: 'change' }],
        alias: [{ validator: validateAlias, trigger: 'blur' }],
        intro: [
          { required: true, message: '简介不能为空', trigger: 'blur' },
          { min: 1, max: 250, message: '最多250字', trigger: 'blur' }
        ],
        bangumi_id: [{ required: true, message: '番剧是必选', trigger: 'blur' }]
      },
      submitting: false
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.getRoleById()
  },
  methods: {
    getRoleById() {
      this.$refs.form.resetFields()
      if (!/\d+/.test(this.id)) {
        return
      }
      this.loading = true
      this.$axios
        .$get('admin/cartoon_role/show', {
          params: { id: this.id }
        })
        .then(data => {
          this.form = Object.assign(data, {
            avatar: data.avatar.split('calibur.tv/').pop()
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleAvatarSuccess(res) {
      this.$toast.success('上传成功')
      this.form.avatar = res.data.url
    },
    submitForm() {
      if (this.canNot('编辑创建偶像')) {
        return
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (this.submitting) {
            return
          }
          this.submitting = true
          let jumpId = this.id
          try {
            if (jumpId) {
              await this.$axios.$post('admin/cartoon_role/edit', this.form)
            } else {
              jumpId = await this.$axios.$post(
                'admin/cartoon_role/create',
                this.form
              )
            }
            if (!this.id) {
              this.$refs.form.resetFields()
            }
            setTimeout(() => {
              window.open(this.$alias.cartoonRole(jumpId))
            }, 2000)
          } finally {
            this.submitting = false
          }
        }
      })
    }
  }
}
</script>
