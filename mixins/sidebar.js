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
        app: 'APP',
        'app-template': '页面模板',
        'app-version': '版本发布',
        bangumi: '番剧',
        'bangumi-list': '番剧列表',
        'bangumi-manager': '设置版主',
        'bangumi-managers': '版主列表',
        'bangumi-create': '创建番剧',
        'bangumi-edit': '编辑番剧',
        video: '视频',
        'video-list': '视频列表',
        'video-trending': '播放排行',
        'video-create': '上传视频',
        'video-season': '季度列表',
        'video-baidu': '百度视频',
        cartoon: '漫画',
        'cartoon-list': '漫画列表',
        'cartoon-edit': '漫画编辑',
        'cartoon-trending': '观看排行',
        tag: '标签',
        'tag-list': '标签列表',
        'tag-cm': '标签运营',
        'tag-badge': '用户徽章',
        role: '偶像',
        'role-list': '偶像列表',
        'role-create': '添加偶像',
        user: '用户',
        'user-dalao': '大佬列表',
        'user-faker': '运营账号',
        'user-show': '用户查询',
        'user-feedback': '用户反馈',
        cm: '运营',
        'cm-loop': '首页轮播',
        'cm-banner': '主站背景',
        'cm-friends': '友情链接',
        'cm-notice': '系统消息',
        manager: '管理',
        'manager-control': '权限管理',
        'manager-setting': '权限设置',
        flow: '信息流',
        'flow-post': '帖子',
        'flow-review': '漫评'
      }[title]
    },
    mapIcon(icon) {
      // icons: https://fontawesome.com/icons?d=gallery&s=solid
      return {
        dashboard: 'tachometer-alt',
        app: 'mobile-alt',
        'app-template': 'sitemap',
        'app-version': 'code-branch',
        bangumi: 'globe',
        'bangumi-list': 'th-list',
        'bangumi-manager': 'user-cog',
        'bangumi-managers': 'users',
        'bangumi-create': 'network-wired',
        'bangumi-edit': 'quidditch',
        video: 'video',
        'video-list': 'list-ol',
        'video-trending': 'signal',
        'video-create': 'cart-plus',
        'video-season': 'list-ul',
        'video-baidu': 'life-ring',
        cartoon: 'dragon',
        'cartoon-list': 'list',
        'cartoon-edit': 'edit',
        'cartoon-trending': 'chart-line',
        tag: 'tag',
        'tag-list': 'tags',
        'tag-cm': 'chart-area',
        'tag-badge': 'ribbon',
        role: 'user-injured',
        'role-list': 'users',
        'role-create': 'cross',
        user: 'users',
        'user-dalao': 'crown',
        'user-faker': 'hat-wizard',
        'user-show': 'search-location',
        'user-feedback': 'code-branch',
        cm: 'hand-holding-heart',
        'cm-loop': 'layer-group',
        'cm-banner': 'images',
        'cm-friends': 'link',
        'cm-notice': 'microphone',
        manager: 'cog',
        'manager-control': 'scroll',
        'manager-setting': 'dice-d20',
        flow: 'wind',
        'flow-post': 'layer-group',
        'flow-review': 'lightbulb'
      }[icon]
    },
    mapVisit(title, store = null) {
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
