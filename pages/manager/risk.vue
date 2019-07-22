<style lang="scss">
#manager-risk {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .button-new-tag {
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    vertical-align: top;
  }
}
</style>

<template>
  <div
    id="manager-risk"
    v-loading="pageLoading"
  >
    <header class="page-header">
      <el-select
        v-model="level"
        @change="handleChange"
      >
        <el-option
          v-for="(item, index) in options"
          :key="index"
          :label="`敏感词级别：${item}`"
          :value="item"
        />
      </el-select>
    </header>
    <div>
      <el-tag
        v-for="(tag, index) in pageData"
        :key="index"
        closable
        :disable-transitions="false"
        @close="handleClose(tag, index)"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="saveTagInput"
        v-model="inputValue"
        class="input-new-tag"
        size="small"
        @keydown.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button v-else class="button-new-tag" size="small" @click="showInput">
        + 添加词汇
      </el-button>
    </div>
    <v-page
      :state="pageState"
      :change="getData"
    />
  </div>
</template>

<script>
import pageMixin from '~/mixins/page'

export default {
  mixins: [pageMixin],
  data() {
    return {
      level: this.$route.query.level ? this.$route.query.level : 'level_1',
      options: [
        'level_1',
        'level_2'
      ],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    filename() {
      return `words_${this.level}`
    }
  },
  created() {
    this.getData(1)
  },
  methods: {
    getData(page) {
      if (page <= this.pageState.max) {
        this.pageState.cur = page
        return
      }
      if (page - this.pageState.max > 3) {
        this.$toast.error('一次获取的数据太多')
        return
      }
      if (this.pageLoading) {
        return
      }
      this.pageLoading = true
      this.pageState.size = 100
      this.$axios
        .$get('console/trial/words/show', {
          params: {
            filename: this.filename,
            to_page: page,
            cur_page: this.pageState.cur,
            take: 100
          }
        })
        .then(data => {
          this.pageState.total = data.total
          this.pageState.cur = page
          this.pageState.max = page
          this.pageList = this.pageList.concat(data.result)
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
        })
    },
    handleClose(word, index) {
      this.$confirm('确定要删除这个词汇吗？', '删除敏感词')
        .then(() => {
          this.$axios.$post('console/trial/words/delete', {
            filename: this.filename,
            words: [word]
          })
            .then(() => {
              this.pageDelete(index)
            })
        })
        .catch(() => {})
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const val = this.inputValue
      if (!val) {
        return
      }
      this.$axios.$post('console/trial/words/add', {
        filename: this.filename,
        words: [val].filter(_ => _)
      })
        .then(() => {
          this.pageAppend(val)
          this.inputValue = ''
          this.inputVisible = false
        })
        .catch(() => {
          this.inputValue = ''
          this.inputVisible = false
        })
    },
    handleChange(val) {
      window.location.href = `${this.$route.path}?level=${val}`
    }
  }
}
</script>
