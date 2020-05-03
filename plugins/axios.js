import { Message } from 'element-ui'

const generateRequestError = (err) => {
  const result = {}
  if (/timeout of/.test(err.message)) {
    result.statusCode = 504
    result.message = '网络请求超时，请稍候再试！'
    return result
  }
  if (!err.response) {
    result.statusCode = 502
    result.message = '网络错误，请刷新网页重试！'
    return result
  }
  result.statusCode = err.response.status
  result.message = err.response.data.message || '发生错误了，请稍后再试！'
  return result
}

export default ({ $axios, redirect, app }) => {
  $axios.setHeader('Accept', 'application/x.api.latest+json')
  if (app.store.state.user) {
    $axios.setToken(app.store.state.user.token, 'Bearer')
  }

  $axios.onRequest((config) => {
    config.baseURL = process.env.API_URL
    return config
  })

  $axios.onResponse((resp) => {
    if (
      resp.config.method === 'post' &&
      !/door\/get_user_info/.test(resp.config.url)
    ) {
      Message.success('操作成功')
    }
    return resp.data
  })

  $axios.onError((error) => {
    const err = generateRequestError(error)
    Message.error(err.message)
    if (err.statusCode === 401) {
      app.store.commit('USER_LOGOUT')
      redirect('/login')
    }
  })
}
