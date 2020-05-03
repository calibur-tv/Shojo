<style lang="scss" scoped>
.bangumi-search-item {
  img {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    margin-right: 5px;
    margin-top: -2px;
    vertical-align: middle;
  }

  span {
    font-size: 14px;
  }
}
</style>

<template>
  <el-select
    v-model="searchId"
    :filter-method="handleEnter"
    :filterable="true"
    :clearable="clear"
    :disabled="disabled"
    :placeholder="showPlaceholder"
    :multiple="multiple"
    :multiple-limit="limit"
    style="width: 100%"
  >
    <el-option
      v-for="item in filteredOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
      class="bangumi-search-item"
    >
      <img :src="$resize(item.avatar, { width: 48 })">
      <span v-text="item.name" />
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'BangumiSearch',
  props: {
    value: {
      type: [String, Number, Array],
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 0
    },
    clear: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '点击选择番剧'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    followed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchId: this.value,
      filteredOptions: [],
      loading: false,
      bangumis: []
    }
  },
  computed: {
    showPlaceholder() {
      if (this.loading) {
        return '加载中...'
      }
      return this.placeholder
    }
  },
  created() {
    this.getData()
    this.$watch('value', (val) => {
      this.searchId = val
    })
    this.$watch('searchId', (val) => {
      this.$emit('input', val)
      val && this.$emit('search', val)
    })
  },
  methods: {
    handleEnter(query) {
      if (!query) {
        this.filteredOptions = this.bangumis
        return
      }
      this.filteredOptions = this.bangumis.filter((option) => {
        return option.alias
          ? option.alias.includes(query) || option.name.includes(query)
          : option.name.includes(query)
      })
    },
    getData() {
      if (this.loading) {
        return
      }
      this.loading = true
      this.$axios
        .$get('search/bangumis')
        .then((data) => {
          this.bangumis = data
          this.filteredOptions = data
          this.loading = false
        })
        .catch((e) => {
          this.$toast.error(e.message)
          this.loading = false
        })
    }
  }
}
</script>
