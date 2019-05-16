<style lang="scss">
.bangumi-list {
  .bangumi {
    margin-top: 20px;
    margin-bottom: 5px;
    font-size: 16px;
    font-weight: bold;

    a:hover {
      text-decoration: underline;
    }
  }

  .managers {
    margin-bottom: 20px;
    line-height: 24px;
    font-size: 14px;

    p {
      margin-left: 8px;
    }

    a {
      display: inline-block;
      width: 200px;
      color: $color-blue-normal;
    }

    span {
      display: inline-block;
      width: 200px;
    }

    li {
      list-style-type: disc;
      margin-left: 2em;
      cursor: default;

      &:hover {
        background-color: $color-gray-normal;
      }
    }
  }
}

.user-list {
  .user {
    margin-top: 20px;
    margin-bottom: 5px;
    font-size: 16px;
    font-weight: bold;
    margin-left: 5px;

    a {
      width: 200px;
      display: inline-block;

      &:hover {
        text-decoration: underline;
      }
    }

    span {
      display: inline-block;
      width: 200px;
    }
  }

  .bangumis {
    margin-bottom: 20px;
    line-height: 24px;
    font-size: 14px;

    p {
      margin-left: 8px;
    }

    a {
      display: inline-block;
      width: 300px;
      color: $color-blue-normal;
    }

    span {
      display: inline-block;
      width: 200px;
    }

    li {
      list-style-type: disc;
      margin-left: 2em;
      cursor: default;

      &:hover {
        background-color: $color-gray-normal;
      }
    }
  }
}
</style>

<template>
  <div
    v-loading="loading"
    id="bangumi-list"
  >
    <header class="page-header">
      <el-button
        type="primary"
        round
        @click="switchPage"
      >{{ sort === 'bangumi' ? '切换到番剧视角' : '切换到版主视角' }}</el-button>
    </header>
    <ul
      v-if="sort === 'bangumi'"
      class="bangumi-list"
    >
      <li
        v-for="list in source"
        :key="list.data.id"
      >
        <div class="bangumi">
          <a
            :href="$alias.bangumi(list.data.id)"
            target="_blank"
          >
            《{{ list.data.name }}》
          </a>
          <span>活跃度：{{ list.power }}</span>
        </div>
        <ul class="managers">
          <p>管理员：</p>
          <li
            v-for="item in list.list"
            :key="item.id"
          >
            【<strong :style="[ item.is_leader ? { color: 'red' } : '' ]">{{ item.is_leader ? '大' : '小' }}</strong>】
            <a
              :href="$alias.user(item.zone)"
              target="_blank"
              v-text="item.nickname"
            />
            <span>战斗力：{{ item.power }}</span>
            <span>邀请码：{{ item.id }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <ul
      v-else
      class="user-list"
    >
      <li
        v-for="list in source"
        :key="list.data.id"
      >
        <div class="user">
          <a
            :href="$alias.user(list.data.zone)"
            target="_blank"
          >
            {{ list.data.nickname }}
          </a>
          <span>战斗力：{{ list.power }}</span>
          <span>邀请码：{{ list.data.id }}</span>
        </div>
        <ul class="bangumis">
          <p>番剧：</p>
          <li
            v-for="item in list.list"
            :key="item.id"
          >
            【<strong :style="[ item.is_leader ? { color: 'red' } : '' ]">{{ item.is_leader ? '大' : '小' }}</strong>】
            <a
              :href="$alias.bangumi(item.id)"
              target="_blank"
              v-text="item.name"
            />
            <span>活跃度：{{ item.power }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      source: [],
      loading: false,
      sort: 'user'
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      if (this.loading) {
        return
      }
      this.$axios
        .$get('admin/bangumi/manager/list', {
          params: { sort: this.sort }
        })
        .then(data => {
          this.source = data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    switchPage() {
      if (this.sort === 'bangumi') {
        this.sort = 'user'
      } else {
        this.sort = 'bangumi'
      }
      this.getData()
    }
  }
}
</script>
