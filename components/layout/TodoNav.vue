<style lang="scss">
#todo-nav {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  padding-left: 10px;
  overflow: hidden;

  .todo-item {
    display: inline-block;
    position: relative;
    cursor: pointer;
    height: 26px;
    line-height: 24px;
    border: 1px solid;
    color: #fff;
    padding: 0 8px;
    font-size: 12px;
    margin-left: 5px;
    margin-top: 4px;
  }

  .level-0 {
    border-color: #909399;
    background-color: #909399;
  }

  .level-1 {
    background-color: #42b983;
    border-color: #42b983;
  }

  .level-2 {
    background-color: #409eff;
    border-color: #409eff;
  }

  .level-3 {
    background-color: #e6a23c;
    border-color: #e6a23c;
  }

  .level-4 {
    background-color: #f56c6c;
    border-color: #f56c6c;
  }
}
</style>

<template>
  <div id="todo-nav">
    <nuxt-link
      v-for="(item, index) in todo"
      v-if="item.value > 0"
      :key="index"
      :to="mapTodo(item.name, 'link')"
      :class="`level-${mapTodo(item.name, 'level')}`"
      class="todo-item"
    >
      {{ mapTodo(item.name, 'label') + '  ' + item.value }}
    </nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'TodoNav',
  computed: {
    todo() {
      return this.$store.state.todo
    }
  },
  methods: {
    mapTodo(name, key) {
      const list = [
        {
          name: 'feedback',
          label: '用户反馈',
          level: 0,
          link: '/user/feedback/'
        }
      ]
      return list.filter(_ => _.name === name)[0][key]
    }
  }
}
</script>
