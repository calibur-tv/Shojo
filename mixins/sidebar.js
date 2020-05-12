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
        'manager-role': '用户权限',
        'manager-risk': '敏感词库',
        'manager-test': '敏感检测',
        spider: '站源',
        'spider-user': '用户管理',
        'spider-channel': '渠道管理'
      }[title]
    },
    mapIcon(icon) {
      // icons: https://fontawesome.com/icons?d=gallery&s=solid
      return {
        dashboard: 'tachometer-alt',
        manager: 'cog',
        'manager-role': 'scroll',
        'manager-risk': 'dice-d20',
        'manager-test': 'temperature-low',
        spider: 'user-md',
        'spider-user': 'user-plus',
        'spider-channel': 'biohazard'
      }[icon]
    },
    mapVisit(title, store = null) {
      return true
    }
  }
}
