<style lang="scss">
#manager-setting {
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>

<template>
  <div
    id="manager-setting"
    v-loading="loading"
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
        v-for="(tag, index) in list"
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
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      level: this.$route.query.level ? this.$route.query.level : 'level_1',
      options: [
        'level_1',
        'level_2'
      ],
      loading: true,
      list: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    filename() {
      return `words_${this.level}`
    }
  },
  watch: {},
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    getData() {
      this.$axios
        .$get('console/trial/words/show', {
          params: {
            filename: this.filename
          }
        })
        .then(data => {
          this.list = data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
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
              this.list.splice(index, 1)
            })
        })
        .catch(() => {})
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
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
          this.list.push(val)
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
