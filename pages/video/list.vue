<template>
  <div
    v-loading="pageLoading"
    id="video-list"
  >
    <header class="page-header">
      <el-row>
        <el-col :span="6">
          <bangumi-search
            :disabled="loadingSeason"
            placeholder="请先选择番剧"
            @search="handleBangumiChange"
          />
        </el-col>
        <el-col
          :span="6"
          :offset="1"
        >
          <el-select
            v-model="seasonId"
            :disabled="loadingSeason"
            placeholder="请先选择季度"
            style="width: 100%"
          >
            <el-option
              v-for="item in seasons"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-col>
      </el-row>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="索引">
        <a
          slot-scope="scope"
          :href="$alias.video(scope.row.id)"
          target="_blank"
          v-text="scope.row.id"
        />
      </el-table-column>
      <el-table-column
        label="名称"
        prop="name"
      />
      <el-table-column
        label="集数"
        prop="episode"
      />
      <el-table-column
        label="播放量"
        prop="count_played"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="primary"
            icon="edit"
            @click="handleEditOpen(scope.row)">编辑</el-button>
          <el-button
            :type="scope.row.deleted_at ? 'warning' : 'danger'"
            size="small"
            icon="delete"
            @click="handleDelete(scope.row)">{{ scope.row.deleted_at ? '恢复' : '删除' }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-page
      :change="handlePageChange"
      :state="pageState"
    />
    <v-dialog
      v-model="showEditorModal"
      title="编辑视频"
      width="1000px"
      @submit="handleEditDone"
    >
      <el-form
        :model="editForm"
        :loading="editSubmitting"
        label-width="100px"
      >
        <el-form-item label="番剧">
          <bangumi-search v-model="editForm.bangumi_id"/>
        </el-form-item>
        <el-form-item label="集数">
          <el-input v-model.trim="editForm.episode"/>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model.trim="editForm.name"/>
        </el-form-item>
        <template>
          <el-form-item label="资源">
            <el-col :span="18">
              <el-input v-model.trim="editForm.resource.video[720].src">
                <template slot="prepend">https://video.calibur.tv/</template>
              </el-input>
            </el-col>
          </el-form-item>
        </template>
        <el-form-item label="海报">
          <el-input v-model.trim="editForm.poster">
            <template slot="prepend">https://image.calibur.tv/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="外链">
          <el-input v-model.trim="editForm.url"/>
        </el-form-item>
        <el-form-item label="百度云链接">
          <el-input v-model.trim="editForm.baidu_cloud_src"/>
        </el-form-item>
        <el-form-item label="百度云密码">
          <el-input v-model.trim="editForm.baidu_cloud_pwd"/>
        </el-form-item>
      </el-form>
    </v-dialog>
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'VideoList',
  mixins: [pageMixin],
  data() {
    return {
      bangumiId: 0,
      seasonId: '',
      showEditorModal: false,
      editSubmitting: false,
      editForm: {
        id: '',
        bangumi_id: '',
        bname: '',
        name: '',
        part: '',
        episode: '',
        poster: '',
        url: '',
        resource: {
          video: {
            '720': {
              useLyc: false,
              src: ''
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
        },
        baidu_cloud_src: '',
        baidu_cloud_pwd: ''
      },
      seasons: [],
      loadingSeason: false
    }
  },
  watch: {
    seasonId() {
      this.getData()
    }
  },
  methods: {
    async getData() {
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.$axios
        .$get('admin/video/bangumis', {
          params: {
            id: this.seasonId
          }
        })
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 30
          this.pageState.total = data.total
          this.pageList = data.list
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    handleBangumiChange(id) {
      if (this.bangumiId !== id) {
        this.bangumiId = id
        this.resetPageState()
        this.handleSeasonSearch()
      }
      this.bangumiId = id
    },
    handleSeasonSearch() {
      if (this.loadingSeason) {
        return
      }
      this.loadingSeason = true
      this.$axios
        .$get('bangumi/seasons', {
          params: {
            bangumi_id: this.bangumiId
          }
        })
        .then(data => {
          this.seasons = data.map(_ => {
            return Object.assign(_, {
              name: _.name ? _.name : `第${_.rank}季`
            })
          })
          this.seasonId = this.seasons[this.seasons.length - 1].id
          this.loadingSeason = false
        })
        .catch(() => {
          this.loadingSeason = false
        })
    },
    handleEditOpen(row) {
      Object.keys(row).forEach(key => {
        this.editForm[key] = row[key]
      })
      const defResource = {
        video: {
          '720': {
            useLyc: false,
            src: ''
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
      this.editForm.resource = row.resource
        ? _.merge({}, defResource, row.resource)
        : _.merge({}, defResource)
      this.editForm.poster = this.editForm.poster.split('calibur.tv/').pop()
      this.showEditorModal = true
    },
    handleDelete(video) {
      if (this.canNot('操作视频')) {
        return
      }
      this.$confirm('确认要执行该操作吗?', '提示')
        .then(() => {
          this.$axios.$post('admin/video/delete', { id: video.id }).then(() => {
            video.deleted_at = !video.deleted_at
          })
        })
        .catch(() => {})
    },
    async handleEditDone() {
      if (this.canNot('操作视频')) {
        return
      }
      if (this.editSubmitting) {
        return
      }
      this.editSubmitting = true
      this.$axios
        .$post(
          'admin/video/edit',
          Object.assign({}, this.editForm, {
            url: this.editForm.url.split('?').shift()
          })
        )
        .then(() => {
          this.showEditorModal = false
          this.editSubmitting = false
        })
        .catch(() => {
          this.editSubmitting = false
        })
    }
  }
}
</script>
