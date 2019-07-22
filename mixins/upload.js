import { getUpToken } from '~/api/imageApi'

export default {
  data() {
    return {
      uploadHeaders: {
        key: '',
        token: ''
      },
      uploadConfig: {
        max: 5
      },
      uploadImageLimit: 20,
      imageUploadAccept: [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif'
      ].join(', '),
      imageUploadAction: 'https://upload.qiniup.com',
      imagePrefix: 'https://m1.calibur.tv/',
      getUpTokenTimer: 0,
      uploadPending: 0,
      uploadImageTotal: 0,
      uploadImageList: []
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.user
    },
    login() {
      return this.$store.state.login
    }
  },
  watch: {
    login(val) {
      val && this.initUpToken()
    }
  },
  mounted() {
    if (this.login) {
      this.initUpToken()
    }
  },
  beforeDestroy() {
    this.getUpTokenTimer && clearInterval(this.getUpTokenTimer)
  },
  methods: {
    initUpToken() {
      this.getUpToken()
      this.getUpTokenTimer = setInterval(() => {
        this.getUpToken()
      }, 1000 * 60 * 30)
    },
    async getUpToken() {
      this.uploadHeaders.token = await this.$axios.$get('image/uptoken')
    },
    handleImageUploadError(err, file) {
      this.uploadImageList.forEach((item, index) => {
        if (item.uid === file.uid) {
          this.uploadPending--
          this.uploadImageList.splice(index, 1)
          console.log(err)
        }
      })
      this.$toast.error(`图片：${file.name} 上传失败`)
    },
    handleImageUploadRemove(file) {
      this.uploadImageList.forEach((item, index) => {
        if (item.uid === file.uid) {
          this.uploadImageList.splice(index, 1)
          this.uploadImageTotal--
        }
      })
    },
    handleImageUploadSuccess(res, file) {
      this.uploadImageList.forEach((item, index) => {
        if (item.uid === file.uid) {
          this.uploadImageList[index] = Object.assign(item, {
            data: res.data,
            status: 'success',
            url: this.$resize(`${this.imagePrefix}${res.data.url}`, {
              width: 200
            })
          })
        }
      })
      this.uploadImageTotal++
      this.uploadPending--
    },
    handleImageUploadExceed() {
      this.$toast.info(`最多还能上传${this.uploadImageLimit - this.uploadImageTotal}张图片`)
    },
    handleImageUploadBefore(file) {
      if (!this.login) {
        this.$channel.$emit('sign-in')
        return false
      }

      if (!this.imageUploadAccept.split(', ').includes(file.type)) {
        this.$toast.error(
          `仅支持上传${this.imageUploadAccept
            .replace(/image\//g, '')
            .replace(/, /g, '、')}格式的图片`
        )
        return false
      }
      if (this.uploadConfig.max && this.uploadConfig.max < file.size / 1024 / 1024) {
        this.$toast.error(`图片大小不能超过 ${this.uploadConfig.max}MB!`)
        return false
      }

      const createFileName = ({ slug, file }) => {
        return `${slug}/${new Date().getTime()}-${Math.random()
          .toString(36)
          .substring(3, 6)}.${file.type.split('/').pop()}`
      }

      this.uploadHeaders.key = createFileName({
        slug: this.currentUser.slug,
        file
      })

      this.uploadImageList.push({
        name: file.name,
        percentage: 0,
        raw: file,
        size: file.size,
        status: 'uploading',
        errMsg: '',
        uid: file.uid
      })
      this.uploadPending++

      return true
    }
  }
}
