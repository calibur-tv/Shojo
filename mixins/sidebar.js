export default {
  computed: {
    mapHidden() {
      return [
        'idol-show-slug'
      ]
    }
  },
  methods: {
    mapTitle(title) {
      return {
        dashboard: '仪表盘',
        manager: '管理',
        'manager-role': '用户权限',
        'manager-risk': '敏感词库',
        'manager-test': '敏感检测',
        spider: '首页',
        bangumi: '番剧',
        idol: '角色',
        'idol-stats': '统计',
        'idol-show-slug': '详情',
        'idol-import': '查询',
        'spider-user': '用户',
        'spider-channel': '状态',
        'spider-banner': '轮播',
        'spider-menu': '导航'
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
        idol: 'user-injured',
        'idol-import': 'map-signs',
        'idol-stats': 'user-injured',
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
