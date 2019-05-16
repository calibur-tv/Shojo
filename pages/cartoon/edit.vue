<template>
  <div id="cartoon-edit">
    <el-table
      :data="list"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="名称">
        <template slot-scope="scope">
          <a
            :href="$alias.image(scope.row.id)"
            target="_blank"
          >{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        label="集数"
        prop="part"
      />
      <el-table-column label="上传人">
        <template slot-scope="scope">
          <a
            :href="$alias.user(scope.row.user.zone)"
            target="_blank"
          >{{ scope.row.user.nickname }}</a>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="created_at"
      />
      <el-table-column label="编辑">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="beginEditItem(scope.row)"
          >编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <v-dialog
      v-if="editingItem"
      v-model="toggleEditModal"
      title="编辑"
      @submit="submitCartoonEdit"
    >
      <el-form label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editingItem.name"/>
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            :data="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleUpUploadSuccess"
            :on-error="handleImageUploadError"
            :action="imageUploadAction"
            :accept="imageUploadAccept"
          >
            <el-button
              type="primary"
              size="mini"
            >
              <i class="el-icon-plus"/>
              上传
            </el-button>
            &nbsp;
            <el-popover
              ref="popoverPoster"
              placement="right"
              width="200"
              trigger="hover"
            >
              <img :src="$resize(editingItem.url)">
            </el-popover>
            <a
              v-popover:popoverPoster
              :href="$resize(editingItem.url)"
              type="text"
              target="_blank"
            >
              <i class="el-icon-view"/>&nbsp;预览
            </a>
          </el-upload>
        </el-form-item>
      </el-form>
    </v-dialog>
  </div>
</template>

<script>
import uploadMixin from '~/mixins/upload'

export default {
  mixins: [uploadMixin],
  data() {
    return {
      loading: false,
      toggleEditModal: false,
      editingItem: null,
      loadingSubmit: false,
      loadingCreate: false,
      list: []
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      if (!/\d+/.test(this.id)) {
        return
      }
      this.loading = true
      this.$axios
        .$get(`bangumi/${this.id}/cartoon`, {
          params: { take: 9999 }
        })
        .then(data => {
          this.list = data.list
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    beginEditItem(item) {
      this.editingItem = {
        id: item.id,
        name: item.name,
        url: item.source.url.split('image.calibur.tv/').pop(),
        bangumi_id: item.bangumi_id
      }
      this.toggleEditModal = true
    },
    async submitCartoonEdit() {
      if (this.canNot('编辑漫画')) {
        return
      }
      if (this.loadingCreate) {
        return
      }
      this.loadingCreate = true
      this.$axios
        .$post('admin/cartoon/edit', {
          id: this.editingItem.id,
          name: this.editingItem.name,
          url: this.editingItem.url
        })
        .then(() => {
          this.toggleEditModal = false
          this.list.forEach((item, index) => {
            if (item.id === this.editingItem.id) {
              this.list[index].name = this.editingItem.name
              this.list[index].url = this.editingItem.url
            }
          })
        })
    },
    handleUpUploadSuccess(res) {
      this.$toast.success('上传成功')
      this.editingItem.url = res.data.url
    }
  }
}
</script>
