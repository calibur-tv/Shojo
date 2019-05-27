export default {
  computed: {
    mapHidden() {
      return []
    }
  },
  methods: {
    mapTitle(title) {
      return {
        dashboard: '首页',
        manager: '管理',
        'manager-control': '用户权限',
        'manager-setting': '敏感词库'
      }[title]
    },
    mapIcon(icon) {
      // icons: https://fontawesome.com/icons?d=gallery&s=solid
      return {
        dashboard: 'tachometer-alt',
        manager: 'cog',
        'manager-control': 'scroll',
        'manager-setting': 'dice-d20'
      }[icon]
    },
    mapVisit(title, store = null) {
      return true
    }
  }
}
