<style lang="scss" scoped>
.panel-group {
  .card-panel-col {
    margin-bottom: 30px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shoppingCard {
        background: #34bfa3;
      }
    }

    .svg-icon {
      width: 48px;
      height: 48px;
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shoppingCard {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;

      i {
        font-size: 48px;
      }
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>

<template>
  <el-row
    :gutter="40"
    class="panel-group"
  >
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <v-icon
            name="users"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">注册</div>
          <count-to
            :start-val="0"
            :end-val="stats.user"
            :duration="2600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <v-icon
            name="edit"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">发帖</div>
          <count-to
            :start-val="0"
            :end-val="stats.post"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-money">
          <v-icon
            name="comments"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">评论</div>
          <count-to
            :start-val="0"
            :end-val="stats.comment"
            :duration="3200"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-shoppingCard">
          <v-icon
            name="images"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">图片</div>
          <count-to
            :start-val="0"
            :end-val="stats.image"
            :duration="3600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <v-icon
            name="edit"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">漫评</div>
          <count-to
            :start-val="0"
            :end-val="stats.score"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <v-icon
            name="edit"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">提问</div>
          <count-to
            :start-val="0"
            :end-val="stats.question"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-message">
          <v-icon
            name="edit"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">回答</div>
          <count-to
            :start-val="0"
            :end-val="stats.answer"
            :duration="3000"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
    <el-col
      :xs="12"
      :sm="12"
      :lg="6"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-shoppingCard">
          <v-icon
            name="images"
            class="svg-icon"
          />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">相册</div>
          <count-to
            :start-val="0"
            :end-val="stats.image_album"
            :duration="3600"
            class="card-panel-num"
          />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      stats: {}
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios.$get('admin/stats/realtime').then(data => {
        this.stats = data
      })
    }
  }
}
</script>
