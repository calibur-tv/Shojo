<template>
  <div id="app-version">
    <header class="page-header">
      <el-button
        type="primary"
        @click="openCreateUserBadgeDialog"
      >
        <i class="el-icon-plus"/>
        创建徽章
      </el-button>
      <el-button
        type="primary"
        @click="openUserBadgesDialog"
      >
        <i class="el-icon-search"/>
        搜索用户徽章
      </el-button>
      <el-button
        type="primary"
        @click="openBatchSetDialog = true"
      >
        <i class="el-icon-plus"/>
        批量授予徽章
      </el-button>
      <v-dialog
        v-model="openBatchSetDialog"
        title="批量授予徽章"
        @submit="batchSetUserBadge"
      >
        <el-form label-width="40px">
          <el-form-item label="徽章">
            <el-select v-model="batchSetForm.badge_id">
              <el-option
                v-for="item in highLevelBadges"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户">
            <el-input
              v-model.trim="batchSetForm.userIds"
              :rows="4"
              type="textarea"
              placeholder="用户id，一行一个"
            />
          </el-form-item>
        </el-form>
      </v-dialog>
      <v-dialog
        v-model="showCreateModal"
        :title="form.id ? '更新徽章' : '创建徽章'"
        @submit="createUserBadge"
      >
        <el-form label-width="40px">
          <el-form-item label="名称">
            <el-input
              v-model.trim="form.name"
              placeholder="名称不可重复"
            />
          </el-form-item>
          <el-form-item label="等级">
            <el-select v-model="form.level">
              <el-option
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-alert
              :title="levelOptions[form.level].intro"
              style="padding: 0;margin-top: 10px"
              type="info"
            />
          </el-form-item>
          <el-form-item label="图标">
            <el-row>
              <el-col :span="20">
                <el-upload
                  :data="uploadHeaders"
                  :on-success="handleIconSuccess"
                  :before-upload="beforeIconUpload"
                  :action="imageUploadAction"
                  :accept="imageUploadAccept"
                >
                  <el-button type="text">
                    <i class="el-icon-plus"/>
                    上传
                  </el-button>
                </el-upload>
              </el-col>
              <el-col :span="4">
                <img
                  v-if="form.icon"
                  :src="form.icon"
                  style="width: 75px;!important;margin-left: 10px"
                  width="75"
                  height="75"
                >
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model.trim="form.intro"
              :rows="4"
              type="textarea"
              maxlength="120"
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-form>
      </v-dialog>
    </header>
    <el-table
      :data="pageData"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        label="索引"
        prop="id"
      />
      <el-table-column label="徽章">
        <template slot-scope="scope">
          <img
            :src="scope.row.icon"
            style="width: 75px;height: 75px;vertical-align: middle"
          >
          <span
            style="vertical-align: middle;margin-left: 10px"
            v-text="scope.row.name"
          />
        </template>
      </el-table-column>
      <el-table-column label="等级">
        <template slot-scope="scope">
          {{ levelOptions[scope.row.level].label }}
        </template>
      </el-table-column>
      <el-table-column
        label="持有人数"
      >
        <template slot-scope="scope">
          <div
            @click="showBadgeUsers(scope.row)"
          >{{ scope.row.user_count }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="danger"
            @click="deleteBadge(scope.$index, scope.row)"
          >删除</el-button>
          <el-button
            size="small"
            type="primary"
            @click="updateUserBadge(scope.row)"
          >更新</el-button>
          <el-button
            size="small"
            type="success"
            @click="setBadgeUser(scope.row)"
          >授予</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 徽章的用户列表 -->
    <v-dialog
      v-model="badgeUserDialog"
      :footer="false"
    >
      <el-table
        :data="badgeUsers"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="id"
          prop="id"
        />
        <el-table-column
          label="昵称"
          prop="nickname"
        />
        <el-table-column
          label="团子"
          prop="coin_count"
        />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a
              :href="`/user/show/?id=${scope.row.id}`"
              target="_blank"
            >
              <el-button
                type="primary"
                size="small"
              >查看用户</el-button>
            </a>
          </template>
        </el-table-column>
      </el-table>
    </v-dialog>
    <!-- 用户的徽章列表 -->
    <v-dialog
      v-model="userBadgeDialog"
      :footer="false"
    >
      <el-table
        :data="userBadges"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="索引"
          prop="id"
        />
        <el-table-column label="徽章">
          <template slot-scope="scope">
            <img
              :src="scope.row.icon"
              style="width: 75px;height: 75px;vertical-align: middle"
            >
            <span
              style="vertical-align: middle;margin-left: 10px"
              v-text="scope.row.name"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="danger"
              @click="removeUserBadge(scope.$index, scope.row)"
            >撤销授权</el-button>
          </template>
        </el-table-column>
      </el-table>
    </v-dialog>
    <!-- 授予徽章的弹窗 -->
    <v-dialog
      v-model="openSetBadgeDialog"
      title="授予用户勋章"
      @submit="submitSetUserBadge"
    >
      <el-form label-width="40px">
        <el-form-item label="用户">
          <el-input
            v-model.trim="setBadgeForm.user_id"
            placeholder="被授予徽章的用户id"
          />
        </el-form-item>
        <el-form-item
          v-if="selectedBadge && +selectedBadge.level > 2"
          label="文案"
        >
          <el-input
            v-model.trim="setBadgeForm.intro"
            :rows="4"
            type="textarea"
            maxlength="120"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
    </v-dialog>
    <v-page
      :state="pageState"
      :change="handlePageChange"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'
import uploadMixin from '~/mixins/upload'

export default {
  name: 'UserBadge',
  mixins: [pageMixin, uploadMixin],
  data() {
    return {
      showCreateModal: false,
      form: {
        id: 0,
        name: '',
        icon: '',
        intro: '',
        level: 0
      },
      levelOptions: [
        {
          label: 'D级',
          intro: '廉价的，一个人可获取无限个，并且可以授予无限个人的徽章',
          value: 0
        },
        {
          label: 'C级',
          intro: '普通的，一个人只可获取一个，但可以授予给无限个人的徽章',
          value: 1
        },
        {
          label: 'B级',
          intro:
            '优质的，一个人只可获取一个，只有满足一定条件的人才能获取的徽章（比如参与了某活动）',
          value: 2
        },
        {
          label: 'A级',
          intro:
            '高级的，一个人只可获取一个，需要满足一定条件才能获取的徽章，并且有专属文案',
          value: 3
        },
        {
          label: 'S级',
          intro: '稀世的，只会授予给一个人的徽章',
          value: 4
        }
      ],
      badgeUsers: [],
      badgeUserDialog: false,
      userBadges: [],
      userBadgeDialog: false,
      selectedUserId: 0,
      selectedBadge: null,
      openSetBadgeDialog: false,
      setBadgeForm: {
        user_id: '',
        intro: ''
      },
      openBatchSetDialog: false,
      batchSetForm: {
        badge_id: '',
        userIds: ''
      }
    }
  },
  computed: {
    highLevelBadges() {
      if (!this.pageList.length) {
        return []
      }
      return this.pageList.filter(_ => +_.level < 3)
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      this.pageLoading = true
      this.$axios
        .$get('admin/badge/all')
        .then(data => {
          this.pageState.cur = 1
          this.pageState.size = 15
          this.pageState.total = data.total
          this.pageList = data.list.map(_ => {
            return Object.assign(_, {
              icon: `https://image.calibur.tv/${_.icon}`
            })
          })
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    beforeIconUpload(file) {
      console.log(file)
      return this.beforeImageUpload(file)
    },
    handleIconSuccess(res) {
      this.form.icon = `https://image.calibur.tv/${res.data.url}`
    },
    createUserBadge() {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      if (!this.form.name) {
        this.$toast.error('请输入徽章名称')
        return
      }
      if (!this.form.icon) {
        this.$toast.error('请上传徽章图标')
        return
      }
      if (!this.form.intro) {
        this.$toast.error('请填写徽章描述')
      }
      const isUpdate = this.form.id !== 0
      this.$axios
        .$post(`admin/badge/${isUpdate ? 'update' : 'create'}`, {
          id: this.form.id,
          name: this.form.name,
          icon: this.form.icon,
          intro: this.form.intro,
          level: this.form.level
        })
        .then(data => {
          if (isUpdate) {
            this.pageList.forEach((item, index) => {
              if (+item.id === this.form.id) {
                this.$set(this.pageList, index, data)
              }
            })
          } else {
            this.pageList.unshift(data)
            this.pageState.total++
          }
          this.showCreateModal = false
          this.form = {
            id: 0,
            name: '',
            icon: '',
            intro: '',
            level: 0
          }
        })
    },
    openCreateUserBadgeDialog() {
      this.form = {
        id: 0,
        name: '',
        icon: '',
        intro: '',
        level: 0
      }
      this.showCreateModal = true
    },
    updateUserBadge(badge) {
      this.form.id = +badge.id
      this.form.name = badge.name
      this.form.icon = badge.icon
      this.form.intro = badge.intro
      this.form.level = +badge.level
      this.showCreateModal = true
    },
    setBadgeUser(badge) {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      this.selectedBadge = badge
      this.openSetBadgeDialog = true
    },
    showBadgeUsers(badge) {
      if (+badge.user_count === 0) {
        return
      }
      this.$axios
        .$get('admin/badge/users', {
          params: {
            id: badge.id,
            page: 0,
            take: 99999
          }
        })
        .then(data => {
          this.badgeUsers = data.list
          this.badgeUserDialog = true
        })
    },
    openUserBadgesDialog() {
      this.$prompt('请输入用户id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^([1-9][0-9]*)$/,
        inputErrorMessage: 'id 格式不正确'
      })
        .then(({ value }) => {
          this.$axios
            .$get('user/badge/list', {
              params: {
                user_id: value
              }
            })
            .then(data => {
              if (data.length) {
                this.userBadges = data
                this.userBadgeDialog = true
                this.selectedUserId = value
              } else {
                this.$toast.error('该用户没有徽章')
              }
            })
        })
        .catch(() => {})
    },
    removeUserBadge(index, badge) {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      this.$confirm('确定要执行该操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$axios
            .$post('admin/badge/remove', {
              user_id: this.selectedUserId,
              badge_id: badge.id
            })
            .then(() => {
              this.userBadges.splice(index, 1)
            })
        })
        .catch(() => {})
    },
    deleteBadge(index, badge) {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      this.$confirm('确定要执行该操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$axios
            .$post('admin/badge/delete', {
              id: badge.id
            })
            .then(() => {
              this.pageList.splice(
                (this.pageState.cur - 1) * this.pageState.size + index,
                1
              )
              this.pageState.total--
            })
        })
        .catch(() => {})
    },
    submitSetUserBadge() {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      if (!this.setBadgeForm.user_id) {
        this.$toast.error('用户id不能为空')
        return
      }
      if (!this.setBadgeForm.intro && +this.selectedBadge.level > 2) {
        this.$toast.error('描述不能为空')
        return
      }
      this.$axios
        .$post('admin/badge/set', {
          user_id: this.setBadgeForm.user_id,
          badge_id: this.selectedBadge.id
        })
        .then(() => {
          this.selectedBadge.user_count++
          this.setBadgeForm = {
            user_id: '',
            intro: ''
          }
          this.openSetBadgeDialog = false
        })
    },
    batchSetUserBadge() {
      if (this.canNot('编辑用户徽章')) {
        return
      }
      if (!this.batchSetForm.badge_id) {
        this.$toast.error('请先选择徽章')
        return
      }
      if (!this.batchSetForm.userIds) {
        this.$toast.error('请先填写用户id')
        return
      }
      this.$axios
        .$post('admin/badge/batch_set', {
          badge_id: this.batchSetForm.badge_id,
          user_ids: [
            ...new Set(
              this.batchSetForm.userIds
                .split('\n')
                .filter(_ => _ && /^\d+$/.test(_))
            )
          ]
        })
        .then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        })
    }
  }
}
</script>
