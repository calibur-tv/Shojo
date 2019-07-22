<style lang="scss">
#manager-test {
  .page-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .text-result {
    li {
      display: block;
      margin: 10px 0;
      font-size: 14px;
      line-height: 20px;
    }
  }
}
</style>

<template>
  <div
    id="manager-test"
    v-loading="pageLoading"
  >
    <div>
      <header class="page-header">
        <h3>点击删除不合理的敏感词</h3>
        <el-button type="primary" @click="handleClear">
          清空
        </el-button>
      </header>
      <el-tag
        v-for="(tag, index) in words"
        :key="index"
        closable
        :disable-transitions="false"
        @close="handleClose(tag, index)"
      >
        {{ tag }}
      </el-tag>
    </div>
    <br>
    <br>
    <div>
      <header class="page-header">
        <h3>文本检测</h3>
      </header>
      <el-input
        v-model="textarea"
        type="textarea"
        :rows="4"
        resize="none"
        placeholder="请输入要检测的内容"
      />
      <br>
      <br>
      <el-button type="primary" @click="handleTextTest">
        点击检测
      </el-button>
      <ul v-if="wordsResult" class="text-result">
        <li v-for="(value, key) in wordsResult" :key="key">
          <b v-text="key" />：
          <span v-html="value" />
        </li>
      </ul>
    </div>
    <br>
    <br>
    <div>
      <header class="page-header">
        <h3>图片检测</h3>
      </header>
      <el-input
        v-model="url"
        placeholder="请输入要检测的图片链接"
      />
      <br>
      <br>
      <el-button type="primary" @click="handleImageTest">
        点击检测
      </el-button>
      <ul v-if="imageResult" class="text-result">
        <li v-for="(value, key) in imageResult" :key="key">
          <b v-text="key" />：
          <span v-html="value" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageLoading: true,
      words: [],
      textarea: '',
      wordsResult: null,
      url: '',
      imageResult: null
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios
        .$get('console/trial/words/blocked')
        .then(data => {
          this.words = data
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
            filename: 'words_level_1',
            words: [word]
          })
            .then(() => {
              this.words.splice(index, 1)
            })
          this.$axios.$post('console/trial/words/delete', {
            filename: 'words_level_2',
            words: [word]
          })
        })
        .catch(() => {})
    },
    handleClear() {
      this.$axios.$post('console/trial/words/clear')
        .then(() => {
          this.words = []
        })
    },
    handleTextTest() {
      if (!this.textarea.trim()) {
        return
      }
      this.$axios.$post('console/trial/words/test', {
        text: this.textarea
      })
        .then(result => {
          this.wordsResult = result
        })
    },
    handleImageTest() {
      if (!this.url.trim()) {
        return
      }
      this.$axios.$post('console/trial/image/test', {
        url: this.url
      })
        .then(result => {
          this.imageResult = result
        })
    }
  }
}
</script>
