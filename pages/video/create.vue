<style lang="scss">
#video-create {
  .video-preview {
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;

    .image {
      width: 300px;
      height: 225px;
    }
  }
}
</style>

<template>
  <div id="video-create">
    <el-form
      ref="form"
      :model="form"
      label-width="100px"
    >
      <el-row>
        <el-col :span="10">
          <el-form-item
            :rules="[{ type: 'number', required: true, message: '请选择视频所属番剧', trigger: 'submit' }]"
            label="番剧"
            prop="bangumiId"
          >
            <bangumi-search
              v-model="form.bangumiId"
              :disabled="saver.bangumi || loadingSeason"
              @search="handleBangumiSearch"
            />
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item
            label="季度"
            prop="seasonId"
          >
            <el-select
              v-model="form.seasonId"
              :disabled="saver.bangumi || loadingSeason"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in seasons"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.bangumi"
              style="margin-left: 10px"
              type="primary"
              @click="validateAndSaveBangumiId"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-form-item
        :rules="[{ validator: validatePrefix, trigger: 'blur' }]"
        label="资源前缀"
        prop="prefix"
      >
        <el-col :span="20">
          <el-input
            v-model.trim="form.prefix"
            :disabled="saver.prefix"
            placeholder="番剧的英文名/季度的英文名"
          />
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.prefix"
              type="primary"
              @click="validateAndSavePrefix"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-alert
          title="番剧的资源前缀统一设为番剧的英文名，英文之间用短横线 ' - ' 隔开，纯小写，不知道名字的请百度"
          type="info"
        />
        <el-alert
          title="此处不要忘记添加季度文件夹的名称作为前缀"
          type="error"
          style="margin-top: 20px"
        />
      </el-form-item>
      <el-form-item
        :rules="[{ validator: validatePart, trigger: 'change' }]"
        label="集数"
        prop="parts"
        required
      >
        <el-col :span="20">
          <el-input-number
            v-model="form.parts[0]"
            :min="1"
            :disabled="saver.parts"
            label="描述文字"
          />
          &nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;
          <el-input-number
            v-model="form.parts[1]"
            :min="form.parts[0]"
            :disabled="saver.parts"
            label="描述文字"
          />
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.parts"
              type="primary"
              @click="validateAndSaveParts"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="封面格式">
        <el-col :span="20">
          <el-select
            v-model="form.suffix"
            :disabled="saver.suffix"
            placeholder="请选择"
          >
            <el-option
              v-for="item in options"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.suffix"
              type="primary"
              @click="handleSaverSuffix"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-alert
          title="大部分视频封面图的格式是相同的，部分不相同的格式可以在之后重置"
          type="info"
        />
      </el-form-item>
      <el-form-item label="视频格式">
        <el-col :span="20">
          <el-select
            v-model="form.format"
            :disabled="saver.format"
            placeholder="请选择"
          >
            <el-option
              v-for="item in videoFormat"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.format"
              type="primary"
              @click="handleSaverFormat"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item
        :rules="[{ required: true, message: '内容不能为空', trigger: 'blur' }]"
        label="每集名称"
        prop="names"
      >
        <el-col :span="20">
          <el-input
            v-model.trim="form.names"
            :disabled="saver.names"
            :rows="10"
            type="textarea"
            placeholder="每集番剧的名称，每行一个，不要有空行"
          />
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.names"
              type="primary"
              @click="validateAndSaveNames"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="自建资源">
        <el-switch v-model="form.haveSelfResource"/>
      </el-form-item>
      <el-form-item
        label="外链资源"
        prop="videos"
      >
        <el-col :span="20">
          <el-input
            v-model.trim="form.videos"
            :disabled="saver.videos"
            :rows="10"
            type="textarea"
            placeholder="如果有自建资源，则外链资源可为空，如果某一集没有外链资源，则那一行可为空，如果不为空，则必须为合法链接，如果没有自建资源，要求就和标题一样"
          />
        </el-col>
        <el-col
          :span="3"
          :offset="1"
        >
          <el-tooltip
            effect="dark"
            content="确认后不可修改"
            placement="top"
          >
            <el-button
              :disabled="saver.videos"
              type="primary"
              @click="validateAndSaveUrls"
            >确认</el-button>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <template
        v-if="saver.bangumi &&
          saver.prefix &&
          saver.names &&
          saver.suffix &&
          saver.parts &&
          saver.format &&
        saver.videos"
      >
        <el-form-item label="视频预览">
          <el-card
            v-for="(part, index) in (form.parts[1] - form.parts[0] + 1)"
            :key="part"
            class="video-preview"
          >
            <img
              :src="$resize(form.posters[index], { width: 600, height: 450 })"
              class="image"
            >
            <div style="padding: 14px;">
              <span>【第 {{ index + form.parts[0] }} 集】{{ form.titles[index] }}</span>
              <div class="bottom clearfix">
                <a
                  v-if="form.haveSelfResource"
                  :href="`https://video.calibur.tv/bangumi/${form.prefix}/video/720/${index + form.parts[0]}.${form.format}`"
                  target="_blank"
                >查看视频资源</a>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <a
                  v-if="form.urls[index]"
                  :href="form.urls[index]"
                  target="_blank"
                >查看外链资源</a>
              </div>
            </div>
          </el-card>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
          >确认并上传</el-button>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item>
          <el-alert
            title="确认上述所有信息后，自动进行下一步，确认后不可修改"
            type="warning"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'VideoCreate',
  data() {
    return {
      validatePart: (rule, value, callback) => {
        if (value.length !== 2) {
          callback(new Error('集数格式不对'))
        } else if (value[0] < 1) {
          callback(new Error('集数不能小于1'))
        } else if (value[0] > value[1]) {
          callback(new Error('集数必须是正确的区间'))
        } else {
          callback()
        }
      },
      validatePrefix: (rule, value, callback) => {
        if (!value) {
          callback(new Error('资源前缀不能为空'))
        }
        if (!/\//.test(value)) {
          callback(new Error('必须添加季度'))
        }
        callback()
      },
      options: ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'],
      videoFormat: ['mp4', 'flv', 'Mp4', 'Flv'],
      form: {
        bangumiId: '',
        seasonId: '',
        parts: [1, 1],
        prefix: '',
        suffix: 'jpg',
        format: 'mp4',
        names: '',
        videos: '',
        uploaded: false,
        titles: [],
        urls: [],
        posters: [],
        haveSelfResource: true
      },
      saver: {
        bangumi: false,
        prefix: false,
        suffix: false,
        format: false,
        videos: false,
        parts: false,
        names: false
      },
      list: {},
      saving: false,
      seasons: [],
      loadingSeason: false
    }
  },
  methods: {
    validateAndSaveBangumiId() {
      this.$refs.form.validateField('bangumiId', error => {
        if (!error) {
          this.saver.bangumi = true
        }
      })
    },
    validateAndSavePrefix() {
      this.$refs.form.validateField('prefix', error => {
        if (!error) {
          this.saver.prefix = true
        }
      })
    },
    validateAndSaveParts() {
      this.$refs.form.validateField('parts', error => {
        if (!error) {
          this.saver.parts = true
        }
      })
    },
    handleSaverFormat() {
      this.saver.format = true
    },
    handleSaverSuffix() {
      const arr = []
      const parts = this.form.parts
      const suffix = this.form.suffix
      for (let i = parts[0]; i <= parts[1]; i++) {
        arr.push(`bangumi/${this.form.prefix}/poster/${i}.${suffix}`)
      }
      this.form.posters = arr
      this.saver.suffix = true
    },
    validateAndSaveNames() {
      const names = this.form.names
      if (!names) {
        this.$toast.error('标题不能为空')
        return
      }
      const parts = this.form.parts
      const length = parts[1] - parts[0] + 1
      const titles = names.split('\n')
      const result = []
      if (titles.length !== length) {
        this.$toast.error('标题个数不对')
        return
      }
      let goOut = false
      titles.forEach(title => {
        if (!title || title.length > 30) {
          goOut = true
        }
        result.push(title.trim())
      })
      if (goOut) {
        this.$toast.error('每一个标题都不能为空，且不能超过30字')
        return
      }
      this.form.titles = result
      this.saver.names = true
    },
    validateAndSaveUrls() {
      const videos = this.form.videos
      if (!videos) {
        if (this.form.haveSelfResource) {
          this.saver.videos = true
        } else {
          this.$toast.error('资源链接不能为空')
        }
        return
      }
      const parts = this.form.parts
      const length = parts[1] - parts[0] + 1
      const arr = videos.split('\n')
      if (this.form.haveSelfResource) {
        if (arr.length > length) {
          this.$toast.error('外链视频的个数大于视频的总数')
          return
        }
      } else {
        if (arr.length !== length) {
          this.$toast.error('资源个数')
          return
        }
      }
      let goOut = false
      const result = []
      arr.forEach(video => {
        if (
          video &&
          !(video.startsWith('http://') || video.startsWith('https://'))
        ) {
          goOut = true
        }
        result.push(
          video
            .trim()
            .split('?')
            .shift()
        )
      })
      if (goOut) {
        this.$toast.error('存在不合法的链接')
        return
      }
      this.form.urls = result
      this.saver.videos = true
    },
    resetForm() {
      this.saver = {
        bangumi: false,
        prefix: false,
        suffix: false,
        videos: false,
        format: false,
        parts: false,
        names: false
      }
    },
    handleBangumiSearch() {
      if (this.loadingSeason) {
        return
      }
      this.loadingSeason = true
      this.$axios
        .$get('bangumi/seasons', {
          params: {
            bangumi_id: this.form.bangumiId
          }
        })
        .then(data => {
          this.seasons = data.map(_ => {
            return Object.assign(_, {
              name: _.name ? _.name : `第${_.rank}季`
            })
          })
          this.loadingSeason = false
          this.form.seasonId = data[data.length - 1].id
        })
        .catch(() => {
          this.loadingSeason = false
        })
    },
    async submitForm() {
      if (this.canNot('操作视频')) {
        return
      }
      if (this.saving) {
        return
      }
      this.saving = true
      const arr = []
      const begin = this.form.parts[0]
      for (let i = begin; i <= this.form.parts[1]; i++) {
        const idx = [i - begin]
        const selfUrl = `bangumi/${this.form.prefix}/video/720/${i}.${
          this.form.format
        }`
        arr.push({
          bangumiId: this.form.bangumiId,
          bangumiSeasonId: this.form.seasonId,
          part: i,
          episode: i,
          name: this.form.titles[idx],
          url: this.form.urls[idx] || '',
          selfUrl: selfUrl,
          poster: this.form.posters[idx],
          resource: this.form.haveSelfResource
            ? {
                video: {
                  '720': {
                    useLyc: false,
                    src: selfUrl
                  },
                  '1080': {
                    useLyc: false,
                    src: ''
                  }
                },
                lyric: {
                  zh: '',
                  en: ''
                }
              }
            : null
        })
      }
      this.$axios
        .$post('admin/video/save', arr)
        .then(() => {
          this.$refs.form.resetFields()
          this.resetForm()
          this.saving = false
        })
        .catch(() => {
          this.saving = false
        })
    }
  }
}
</script>
