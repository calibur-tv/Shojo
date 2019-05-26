import Cookies from 'js-cookie'
import { Message } from 'element-ui'
import permission from '~/assets/js/permission'

export default ({ app, store, route, redirect }) => {
  const { user } = store.state
  const token = Cookies.get('JWT-TOKEN')
  const loginPath = '/login/'
  const indexPath = '/dashboard/'
  const notRolePath = '/error/401/'
  const isLoginPage = route.path === loginPath
  // 用户未登录
  if (!user.id) {
    // 没有 token，且不在登录页面，跳到登录页
    if (!token && !isLoginPage) {
      return redirect(loginPath)
    }
    if (!token) {
      return
    }
    app.$axios.setToken(token, 'Bearer')
    app.$axios
      .$post('door/get_user_info?role=visit_console')
      .then(data => {
        // 登录成功
        if (isLoginPage) {
          window.location = indexPath
        }
        // 是管理员
        store.commit('SET_USER', data)
        const hasRole = permission(route, store)
        if (!hasRole) {
          redirect(notRolePath)
        }
        store.dispatch('getTodo')
      })
      .catch(err => {
        // 登录失败
        Message.error(err.message)
        Cookies.remove('JWT-TOKEN')
        if (!isLoginPage) {
          window.location = loginPath
        }
      })
  } else {
    // 已登录用户不能访问登录页面
    if (isLoginPage) {
      return redirect(indexPath)
    }
    const hasRole = permission(route, store)
    if (!hasRole) {
      redirect(notRolePath)
    }
  }
}
