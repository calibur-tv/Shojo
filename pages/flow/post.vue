<style lang="scss">
#post-flow {
  .page-header {
    .buttons {
      float: right;
    }
  }

  .total {
    text-align: center;
    margin-top: 30px;
  }

  .post-item {
    margin-bottom: 10px;

    .line {
      margin-bottom: 10px;
    }
  }

  .body {
    .content {
      font-size: 13px;
      color: $color-text-light;
      text-indent: 45px;
      margin-top: -15px;
      word-break: break-all;
    }
  }

  .images {
    img {
      width: 100px;
      height: 100px;
      vertical-align: top;
      margin-right: 5px;
      margin-top: 5px;
    }
  }

  .control {
    margin-top: 30px;
    text-align: center;
  }

  .footer {
    margin-top: 15px;
  }
}
</style>

<template>
  <div
    v-loading="loading"
    id="post-flow"
  >
    <div class="page-header">
      <el-radio-group 
        v-model="selectedTab"
        @change="handleTabSwitch"
      >
        <el-radio-button label="待审 - 不在首页"/>
        <el-radio-button label="待审 - 在首页"/>
        <el-radio-button label="已审 - 不在首页"/>
        <el-radio-button label="已审 - 在首页"/>
      </el-radio-group>
      <div class="buttons">
        <el-button
          type="danger"
          @click="removePost"
        >
          从首页移除某贴
        </el-button>
        <el-button
          type="primary"
          @click="appendPost"
        >
          添加某贴到首页
        </el-button>
      </div>
      <p class="total">总数：{{ total }}</p>
    </div>
    <div v-if="list.length">
      <el-card
        v-for="(item, index) in list"
        :key="item.id"
        class="post-item"
      >
        <a
          :href="$alias.post(item.id)"
          target="_blank"
        >
          <div class="line"><strong>标题：</strong><span>{{ item.title }}</span></div>
          <div class="line">
            <strong>用户：</strong>
            <a
              :href="$alias.user(item.user.zone)"
              target="_blank"
            >
              {{ item.user.nickname }}
            </a>
          </div>
          <div class="line">
            <strong>番剧：</strong>
            <a
              :href="$alias.bangumi(item.bangumi.id)"
              target="_blank"
            >
              {{ item.bangumi.name }}
            </a>
          </div>
          <div class="line">
            <strong>状态：</strong>
            <span>{{ item.deleted_at ? '已删除' : item.state == 0 ? '正常' : '审核中' }}</span>
          </div>
          <div class="line body">
            <strong>内容：</strong>
            <div
              class="content"
              v-html="item.content"
            />
          </div>
          <div class="line images">
            <p class="label"><strong>图片：</strong></p>
            <img
              v-for="(img, subIndex) in item.images"
              :key="subIndex"
              :src="$resize(img.url, { width: 200 })"
            >
          </div>
        </a>
        <div class="footer">
          <el-button
            v-if="status !== 1"
            type="success"
            @click="changeFlowStatus(item.id, index, true)"
          >
            上到首页
          </el-button>
          <el-button
            v-if="status === 1"
            type="primary"
            @click="changeFlowStatus(item.id, index, false)"
          >
            移出首页
          </el-button>
          <el-button
            type="danger"
            @click="deletePost(item.id, index)"
          >
            删帖
          </el-button>
        </div>
      </el-card>
      <div
        v-if="!self"
        class="control"
      >
        <el-button
          v-if="status === 0"
          :loading="submitting"
          @click="batchReject"
        >
          全部不上首页
        </el-button>
        <el-button
          v-if="status === 1"
          :loading="submitting"
          @click="batchResolve"
        >
          全部留在首页
        </el-button>
      </div>
    </div>
    <div v-else>
      暂无数据
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostFlow',
  data() {
    return {
      selectedTab: '待审 - 不在首页',
      status: 0,
      total: 0,
      list: [],
      loading: false,
      submitting: false,
      self: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    handleTabSwitch(value) {
      if (value === '待审 - 在首页') {
        this.status = 1
        this.self = false
      } else if (value === '待审 - 不在首页') {
        this.status = 0
        this.self = false
      } else if (value === '已审 - 不在首页') {
        this.status = 0
        this.self = true
      } else {
        this.status = 1
        this.self = true
      }
      this.getData()
    },
    getData() {
      if (this.loading) {
        return
      }
      this.loading = true
      this.list = []
      this.$axios
        .$get(
          this.self
            ? 'admin/trial/post/self_flow_status'
            : 'admin/trial/post/get_flow_status',
          {
            params: {
              limit: this.self ? 50 : 15,
              status: this.status
            }
          }
        )
        .then(data => {
          this.list = data.list
          this.total = data.total
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    changeFlowStatus(postId, index, isUp) {
      if (this.submitting) {
        return
      }
      this.submitting = true
      this.$axios
        .$post('admin/trial/post/change_flow_status', {
          post_id: postId,
          flow_status: isUp ? 1 : 0
        })
        .then(() => {
          this.list.splice(index, 1)
          this.total--
          this.submitting = false
        })
        .catch(() => {
          this.submitting = false
        })
    },
    deletePost(id, index) {
      this.$axios.$post('admin/trial/post/ban', { id }).then(() => {
        this.total--
        this.list.splice(index, 1)
      })
    },
    removePost() {
      this.$prompt('请输入帖子id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '非法的id'
      })
        .then(({ value }) => {
          if (value < 1) {
            this.$toast.error('非法的id')
            return
          }
          this.$axios.$post('admin/trial/post/change_flow_status', {
            post_id: value,
            flow_status: 0
          })
        })
        .catch(() => {})
    },
    appendPost() {
      this.$prompt('请输入帖子id', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '非法的id'
      })
        .then(({ value }) => {
          if (value < 1) {
            this.$toast.error('非法的id')
            return
          }
          this.$axios.$post('admin/trial/post/change_flow_status', {
            post_id: value,
            flow_status: 1
          })
        })
        .catch(() => {})
    },
    batchReject() {
      if (!this.list.length) {
        this.getData()
      }
      if (this.submitting) {
        return
      }
      this.submitting = true
      this.$axios
        .$post('admin/trial/post/batch_change_flow_status', {
          post_id: this.list.map(_ => _.id),
          flow_status: 0
        })
        .then(() => {
          this.submitting = false
          this.getData()
        })
        .catch(() => {
          this.submitting = false
        })
    },
    batchResolve() {
      if (!this.list.length) {
        this.getData()
      }
      if (this.submitting) {
        return
      }
      this.submitting = true
      this.$axios
        .$post('admin/trial/post/batch_change_flow_status', {
          post_id: this.list.map(_ => _.id),
          flow_status: 1
        })
        .then(() => {
          this.submitting = false
          this.getData()
        })
        .catch(() => {
          this.submitting = false
        })
    }
  }
}
</script>
