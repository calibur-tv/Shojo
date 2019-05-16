<style lang="scss">
#user-show {
  margin-bottom: 150px;

  .user {
    margin-bottom: 50px;

    > div {
      margin-bottom: 20px;
      font-size: 16px;
    }

    .label {
      font-weight: bold;
      display: inline-block;
      text-align: right;
      width: 80px;
    }

    img {
      vertical-align: top;
    }

    .avatar {
      width: 150px;
      height: 150px;
    }

    .banner {
      height: 200px;
      width: auto;
    }
  }
}
</style>

<template>
  <div
    id="user-show"
    v-loading="searching"
  >
    <header class="page-header">
      <user-search
        :disabled="true"
        @submit="getUserData"
      />
    </header>
    <div
      v-if="user"
      class="user"
    >
      <div>
        <span class="label">id：</span>
        {{ user.id }}
      </div>
      <div>
        <span class="label">昵称：</span>
        {{ user.nickname }}
      </div>
      <div>
        <span class="label">空间：</span>
        <a
          :href="$alias.user(user.zone)"
          target="_blank"
          v-text="user.zone"
        />
      </div>
      <div>
        <span class="label">头像：</span>
        <img
          :src="$resize(user.avatar, { width: 300 })"
          class="avatar"
        >
      </div>
      <div>
        <span class="label">背景：</span>
        <a
          :href="user.banner"
          target="_blank"
        >
          <img
            :src="$resize(user.banner, { height: 200, mode: 2 })"
            class="banner"
          >
        </a>
      </div>
      <div>
        <span class="label">签名：</span>
        {{ user.signature || '无' }}
      </div>
      <div>
        <span class="label">手机号：</span>
        {{ user.phone }}
      </div>
      <div>
        <span class="label">运营号：</span>
        {{ user.faker == 1 ? '是' : '否' }}
      </div>
      <div>
        <span class="label">团子：</span>
        {{ user.coin_count_v2 }}，光玉：{{ user.light_count }}
      </div>
      <div>
        <span class="label">邀请了：</span>
        {{ user.invite_count }} 人
      </div>
      <div>
        <span class="label">等级：</span>
        {{ user.level }}，战斗力：{{ user.power }}
      </div>
      <div>
        <span class="label">性别：</span>
        {{ user.sex }}
      </div>
      <div>
        <span class="label">生日：</span>
        {{ user.birthday }}
      </div>
      <div>
        <span class="label">创建时间：</span>
        {{ user.created_at }}
      </div>
      <div>
        <span class="label">状态：</span>
        {{ user.deleted_at ? '已封禁' : user.state == 1 ? '审核中' : '正常' }}
      </div>
      <div>
        <span class="label">权限：</span>
        {{ user.is_admin == 1 ? '管理员' : '普通用户' }}
      </div>
      <div>
        <span class="label">操作：</span>
        <el-button
          v-if="user.state == 0"
          :loading="loading"
          type="warning"
          size="mini"
          @click="addUserToTrial"
        >
          加入审核列表
        </el-button>
        <el-button
          type="primary"
          size="mini"
          @click="showTransactions = !showTransactions; getTransactions(1)"
        >
          查看交易记录
        </el-button>
        <el-button
          v-if="!showInvite"
          :loading="loadingInvite"
          type="primary"
          size="mini"
          @click="getInvite(1)"
        >
          查看邀请视图
        </el-button>
        <el-button
          v-if="user.ip_address.length"
          type="primary"
          size="mini"
          @click="showIpAddress = !showIpAddress"
        >
          {{ showIpAddress ? '隐藏ip地址' : '查看ip地址' }}
        </el-button>
        <el-button
          v-if="user.deleted_at"
          :loading="loading"
          type="success"
          size="mini"
          @click="recover"
        >
          解禁
        </el-button>
        <el-button
          v-else
          :loading="loading"
          type="danger"
          size="mini"
          @click="block"
        >
          永久封禁
        </el-button>
        <el-tooltip
          v-if="user.banned_to"
          :content="user.banned_to"
          placement="top"
          effect="dark"
        >
          <el-button
            :loading="banning"
            type="primary"
            size="mini"
            @click="freeUser"
          >
            解除禁言
          </el-button>
        </el-tooltip>
        <el-popover
          v-else
          placement="right"
          width="220"
          trigger="hover"
        >
          <el-date-picker
            v-model="banned_to"
            :picker-options="bannedOpts"
            align="right"
            type="datetime"
            placeholder="选择终点"
          />
          <el-button
            slot="reference"
            :loading="banning"
            type="danger"
            size="mini"
            style="margin-left: 10px;margin-right: 10px"
            @click="freezeUser"
          >
            禁言
          </el-button>
        </el-popover>
        <template>
          <el-button
            v-if="user.light_count >= 100"
            type="success"
            size="mini"
            @click="getMoney"
          >
            提现
          </el-button>
          <el-button
            type="success"
            size="mini"
            @click="giveUserGift(1)"
          >
            赠送光玉
          </el-button>
          <el-button
            type="success"
            size="mini"
            @click="giveUserGift(0)"
          >
            赠送团子
          </el-button>
        </template>
      </div>
    </div>
    <!-- 用户的 ip 列表 -->
    <el-collapse-transition>
      <el-table
        v-if="showIpAddress"
        :data="user.ip_address"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="地址"
          prop="ip_address"
        />
        <el-table-column
          label="封禁状态"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.blocked !== '1'">
              正常
            </el-tag>
            <el-tag
              v-else
              type="danger"
            >
              已封禁
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="记录时间"
          prop="created_at"
        />
        <el-table-column
          label="操作时间"
          prop="updated_at"
        />
      </el-table>
    </el-collapse-transition>
    <!-- 用户的交易记录 -->
    <template v-if="showTransactions">
      <el-table
        :data="pageData"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="来源">
          <span slot-scope="scope">
            {{ getTitleByType(scope.row.type) }}
          </span>
        </el-table-column>
        <el-table-column label="金额">
          <span slot-scope="scope">
            {{ scope.row.amount }}
          </span>
        </el-table-column>
        <el-table-column label="内容">
          <span
            slot-scope="scope"
            v-text="computedTransitionText(scope.row)"
          />
        </el-table-column>
        <el-table-column label="用户">
          <a
            slot-scope="scope"
            :href="computedTransitionUser(scope.row)"
            target="_blank"
            v-text="scope.row.user ? scope.row.user.nickname : '无'"
          />
        </el-table-column>
        <el-table-column
          label="交易时间"
          prop="created_at"
        />
      </el-table>
      <v-page
        :change="getTransactions"
        :state="pageState"
      />
    </template>
    <!-- 用户的邀请视图 -->
    <v-dialog
      v-if="user"
      v-model="showInvite"
      :fullscreen="true"
      :title="`${user.nickname}邀请的人`"
      :footer="false"
      :loading="loadingInvite"
    >
      <div class="container">
        <ve-histogram
          v-if="inviteUserLevelChartData"
          :data="inviteUserLevelChartData"
        />
        <ve-histogram
          v-if="inviteUserPowerChartData"
          :data="inviteUserPowerChartData"
        />
      </div>
    </v-dialog>
    <!-- 公用ip的用户列表 -->
    <v-dialog
      v-model="showIpListDialog"
      :footer="false"
      :fullscreen="true"
      title="公用ip的用户列表"
    >
      <el-table
        :data="ipList"
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
        <el-table-column
          label="等级"
          prop="level"
        />
        <el-table-column
          label="战斗力"
          prop="power"
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
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  name: 'UserShow',
  mixins: [pageMixin],
  data() {
    return {
      bannedOpts: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        },
        shortcuts: [
          {
            text: '30分钟',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 500)
              picker.$emit('pick', date)
            }
          },
          {
            text: '1小时',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000)
              picker.$emit('pick', date)
            }
          },
          {
            text: '3小时',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 3)
              picker.$emit('pick', date)
            }
          },
          {
            text: '6小时',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 6)
              picker.$emit('pick', date)
            }
          },
          {
            text: '12小时',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 12)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: '三天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 3)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一周',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      searching: false,
      user: null,
      loading: false,
      showTransactions: false,
      showIpAddress: false,
      banned_to: null,
      banning: false,
      showInvite: false,
      loadingInvite: false,
      inviteList: [],
      ipList: [],
      showIpListDialog: false
    }
  },
  computed: {
    isKing() {
      return this.$store.state.user.id === 1
    },
    queryId() {
      return +(this.$route.query.id || 0)
    },
    queryZone() {
      return this.$route.query.zone || ''
    },
    queryIp() {
      return this.$route.query.ip || ''
    },
    inviteUserLevelChartData() {
      if (!this.inviteList.length) {
        return null
      }
      const resource = _.mapValues(_.groupBy(this.inviteList, 'level'), clist =>
        clist.map(item => _.omit(item, 'level'))
      )
      const result = []
      Object.keys(resource).forEach(level => {
        result.push({
          等级: level,
          人数: resource[level].length,
          list: resource[level]
        })
      })
      return {
        columns: ['等级', '人数'],
        rows: result
      }
    },
    inviteUserPowerChartData() {
      if (!this.inviteList.length) {
        return null
      }
      const resource = _.mapValues(_.groupBy(this.inviteList, 'power'), clist =>
        clist.map(item => _.omit(item, 'power'))
      )
      const result = []
      Object.keys(resource).forEach(power => {
        result.push({
          战斗力: power,
          人数: resource[power].length,
          list: resource[power]
        })
      })
      return {
        columns: ['战斗力', '人数'],
        rows: result
      }
    }
  },
  created() {
    if (this.queryId) {
      this.getUserData({
        type: 'id',
        value: this.queryId
      })
    }
    if (this.queryZone) {
      this.getUserData({
        type: 'zone',
        value: this.queryZone
      })
    }
    if (this.queryIp) {
      this.getUserData({
        type: 'ip_address',
        value: this.queryIp
      })
    }
  },
  methods: {
    getInvite() {
      if (this.showInvite) {
        this.showInvite = false
        return
      }
      if (this.inviteList.length) {
        this.showInvite = true
        return
      }
      if (this.loadingInvite) {
        return
      }
      this.loadingInvite = true
      this.$axios
        .$get('user/invite/list', {
          params: { id: this.user.id }
        })
        .then(data => {
          this.inviteList = data
          this.showInvite = true
          this.loadingInvite = false
        })
        .catch(() => {
          this.loadingInvite = false
        })
    },
    freezeUser() {
      if (this.canNot('禁言用户')) {
        return
      }
      if (!this.banned_to) {
        this.$toast.error('请先选择禁言时长')
        return
      }
      this.banning = true
      this.$axios
        .$post('admin/user/banned/freeze', {
          id: this.user.id,
          banned_to: this.banned_to
        })
        .then(() => {
          this.user.banned_to = this.banned_to.toString()
          this.banning = false
        })
        .catch(() => {
          this.banning = false
        })
    },
    freeUser() {
      if (this.canNot('解除用户禁言')) {
        return
      }
      this.banning = true
      this.$axios
        .$post('admin/user/banned/free', {
          id: this.user.id
        })
        .then(() => {
          this.user.banned_to = null
          this.banning = false
        })
        .catch(() => {
          this.banning = false
        })
    },
    getTransactions(page) {
      if (page <= this.pageState.max) {
        this.pageState.cur = page
        return
      }
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.pageState.size = 20
      this.$axios
        .$post('admin/user/transactions', {
          id: this.user.id,
          to_page: page,
          cur_page: this.pageState.cur,
          take: this.pageState.size
        })
        .then(data => {
          this.pageState.total = data.total
          this.pageState.cur = page
          this.pageState.max = page
          if (page === 1) {
            this.pageList = data.list
          } else {
            this.pageList = this.pageList.concat(data.list)
          }
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    getUserData(data) {
      if (this.searching) {
        return
      }
      this.searching = true
      this.$axios
        .$get('admin/search/user', {
          params: data
        })
        .then(result => {
          if (data.type === 'ip_address') {
            const ids = result.filter(_ => _ !== '0')
            this.$toast.success(`共找到 ${ids.length} 个用户`)
            this.ipList = ids
            this.showIpListDialog = true
          } else {
            this.user = result
            this.inviteList = []
          }
          this.searching = false
        })
        .catch(() => {
          this.searching = false
        })
    },
    addUserToTrial() {
      if (this.canNot('添加用户到审核池')) {
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      this.$axios
        .$post('admin/user/add_to_trial', { id: this.user.id })
        .then(() => {
          this.user.state = 1
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    recover() {
      if (this.canNot('解禁用户')) {
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      this.$axios
        .$post('admin/trial/user/recover', { id: this.user.id })
        .then(() => {
          this.user.deleted_at = null
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    block() {
      if (this.canNot('封禁用户')) {
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      this.$axios
        .$post('admin/trial/user/ban', { id: this.user.id })
        .then(() => {
          this.user.deleted_at = Date.now()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getTitleByType(type) {
      /**
       * channel_type
       * 0 => 签到
       * 1 => 邀请注册
       * 2 => 普通用户活跃送团子
       * 3 => 吧主活跃送团子
       * 4 => 打赏帖子
       * 5 => 打赏相册
       * 6 => 打赏漫评
       * 7 => 打赏回答
       * 8 => 打赏视频
       * 9 => 应援偶像
       * 10 => 提现
       * 11 => 视频被删除
       * 12 => 回答被删除
       * 13 => 漫评被删除
       * 14 => 相册被删除
       * 15 => 帖子被删除
       * 16 => 给用户赠送团子
       * 17 => 给用户赠送光玉
       * 18 => 活跃用户送光玉
       * 19 => 活跃吧主送光玉
       * 20 => 被人邀请注册送团
       * 21 => 承包季度视频
       * 22 => 偶像股份交易
       * 23 => 视频被承包
       * 24 => 偶像产品交易
       * 25 => 打赏帖子赞助了偶像
       */
      if (type === 0) {
        return '每日签到'
      } else if (type === 1) {
        return '邀请注册'
      } else if (type === 2) {
        return '活跃赠送'
      } else if (type === 3) {
        return '吧主赠送'
      } else if (type === 4) {
        return '打赏帖子'
      } else if (type === 5) {
        return '打赏相册'
      } else if (type === 6) {
        return '打赏漫评'
      } else if (type === 7) {
        return '打赏回答'
      } else if (type === 8) {
        return '打赏视频'
      } else if (type === 9) {
        return '应援偶像'
      } else if (type === 10) {
        return '提现'
      } else if (type === 11) {
        return '视频被删除'
      } else if (type === 12) {
        return '回答被删除'
      } else if (type === 13) {
        return '漫评被删除'
      } else if (type === 14) {
        return '相册被删除'
      } else if (type === 15) {
        return '帖子被删除'
      } else if (type === 16) {
        return '给用户赠送团子'
      } else if (type === 17) {
        return '给用户赠送光玉'
      } else if (type === 18) {
        return '活跃用户送光玉'
      } else if (type === 19) {
        return '活跃吧主送光玉'
      } else if (type === 20) {
        return '被人邀请注册送团'
      } else if (type === 21) {
        return '承包季度视频'
      } else if (type === 22) {
        return '偶像股份交易'
      } else if (type === 23) {
        return '视频被承包'
      } else if (type === 24) {
        return '偶像产品交易'
      } else if (type === 25) {
        return '打赏帖子赞助了偶像'
      }
      return '未知'
    },
    computedTransitionText(row) {
      if (row.model) {
        return row.model.title
      }
      if (row.user) {
        return row.user.nickname
      }
      return '-'
    },
    computedTransitionUser(row) {
      if (row.user) {
        return `https://www.calibur.tv/user/${row.user.zone}`
      }
      return 'javascript:;'
    },
    getMoney() {
      if (this.canNot('为用户提现')) {
        return
      }
      this.$prompt('输入要提现的金额', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          const data = +value
          if (data !== value) {
            this.$toast.error('错误的格式')
            return
          }
          if (!/^\d+$/.test(data)) {
            this.$toast.error('必须是整数')
            return
          }
          if (data <= 0) {
            this.$toast.error('必须大于0')
            return
          }
          this.$axios.$post('admin/user/withdrawal', {
            id: this.user.id,
            money: data
          })
        })
        .catch(() => {})
    },
    giveUserGift(state) {
      this.$prompt('输入要赠送的金额', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          const data = +value
          if (data !== value) {
            this.$toast.error('错误的格式')
            return
          }
          if (!/^\d+$/.test(data)) {
            this.$toast.error('必须是整数')
            return
          }
          if (data <= 0) {
            this.$toast.error('必须大于0')
            return
          }
          this.$axios.$post('admin/user/give_user_money', {
            id: this.user.id,
            amount: data,
            state
          })
        })
        .catch(() => {})
    }
  }
}
</script>
