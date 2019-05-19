export default {
  computed: {
    mapHidden() {
      return ['bangumi-edit']
    }
  },
  methods: {
    mapTitle(title) {
      return {
        dashboard: '首页',
        manager: '管理',
        'manager-control': '权限列表',
        'manager-setting': '设置权限'
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
      if (title === 'dashboard') {
        return true
      }
      const list = {
        'bangumi-manager': '访问设置版主',
        'user-faker': '访问运营账号'
      }
      const must = {
        manager: '幕后主使者',
        'manager-control': '幕后主使者',
        'manager-setting': '幕后主使者'
      }
      if (!list[title] && !must[title]) {
        return true
      }
      const roles = store
        ? store.state.user.roles
        : this.$store.state.user.roles
      if (must[title]) {
        return roles.some(_ => _ === must[title])
      }
      if (
        roles.some(
          _ => ~['幕后主使者', '继承繁星之人', '被神所眷恋之人'].indexOf(_)
        )
      ) {
        return true
      }
      return roles.some(_ => _ === list[title])
    }
  }
}
