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
        spider: '运营',
        'spider-user': '渠道用户',
        'spider-channel': '渠道状态',
        'spider-banner': '首页轮播',
        'spider-menu': '首页导航'
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
        'spider-channel': 'biohazard',
        'spider-banner': 'photo-video',
        'spider-menu': 'map-signs'
      }[icon]
    },
    mapVisit(title, store = null) {
      return true
    }
  }
}
