import Vue from 'vue'

function checkCode (res, text) {
  const code = res.status
  const { $route, $router, $confirm, $notify } = Vue.prototype._vue
  if (code === 401) {
    if (!Vue.prototype.loginConfirm) {
      $confirm('未登录或登陆已过期，请重新登陆！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        $router.push('/Login')
        Vue.prototype.loginConfirm = false
      }).catch(() => {
        Vue.prototype.loginConfirm = false
      })
      Vue.prototype.loginConfirm = true
    }
    return false
  }
  if (code === 400) {
    $notify.error({
      title: '错误',
      message: '请求的地址有误！' + text
    })
  }
  if (code >= 500 && code <= 505) {
    if ($route.path === '/Login') {
      $router.push({ path: '/500', query: { text: text } })
      $notify.error({
        title: '错误',
        message: '服务器出现内部错误！'
      })
      return
    }
    $router.push('/App/500')
    return false
  }
  return true
}
/**
 * 构建一个Promise
 */
const newPromise = function (handle) {
  var p = new Promise(function (resolve, reject) {
    // 传入操作为函数才执行操作
    if (typeof handle === 'function' || typeof handle === 'object') {
      try {
        resolve(typeof handle === 'function' ? handle(reject) : handle)
      } catch (e) {
        reject(e)
      }
    }
  })
  return p
}
/**
 * 处理token
 */
function handleToken (res) {
  let token = res.headers.get('custom-user-login-token')
  localStorage['user_login_token'] = token || localStorage['user_login_token']
  localStorage['user_login_life'] = new Date().getTime() + 20 * 60 * 1000
}
/**
 * 处理参数对象
 */
function handleParamObj (param) {
  let querySrc = ''
  for (var key in param) {
    querySrc += '&' + key + '=' + param[key]
  }
  return querySrc
}
/**
 * 封装POST请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 * @param skipCheck 跳过登录检查
 */
const post = function (url, param, skipCheck) {
  let paramStr = param
  if (typeof param === 'object') {
    paramStr = handleParamObj(param)
  }
  return fetch(url, {
    body: paramStr,
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'custom-user-login-token': localStorage['user_login_token']
    }
  })
    .then(res => {
      // 包装一层同时传递字符串和响应对象到下一步
      var p = new Promise(function (resolve, reject) {
        res.text().then(function (text) {
          resolve({ res, text })
        })
      })
      return p
    })
    .then(({ res, text }) => {
      // 跳过
      if (skipCheck) {
        return newPromise(function () {
          return text
        })
      }
      // 检查通过
      if (checkCode(res, text)) {
        handleToken(res)
        return newPromise(function () {
          return text
        })
      } else {
        // 中断操作
        return newPromise()
      }
    })
}
/**
 * 封装POST JSON请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 * @param skipCheck 跳过登录检查
 */
const postJSON = function (url, param, skipCheck) {
  return post(url, param)
    .then(text => {
      return newPromise(JSON.parse(text))
    })
}
/**
 * 封装POST TEXT请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 */
const postText = function (url, param, skipCheck) {
  return post(url, param)
}

/**
 * 封装GET请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 * @param skipCheck 跳过登录检查
 */
const get = function (url, param, skipCheck) {
  let paramStr = param
  if (typeof param === 'object') {
    paramStr = handleParamObj(param)
  }
  url += paramStr
  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      // 携带token信息
      'custom-user-login-token': localStorage['user_login_token']
    }
  })
    .then(res => {
      // 包装一层同时传递字符串和响应对象到下一步
      var p = new Promise(function (resolve, reject) {
        res.text().then(function (text) {
          resolve({ res, text })
        })
      })
      return p
    })
    .then(({ res, text }) => {
      // 跳过
      if (skipCheck) {
        return newPromise(function () {
          return text
        })
      }
      // 检查通过
      if (checkCode(res, text)) {
        handleToken(res)
        return newPromise(function () {
          return text
        })
      } else {
        // 中断操作
        return newPromise()
      }
    })
}
/**
 * 封装GET SJON请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 * @param skipCheck 跳过登录检查
 */
const getJSON = function (url, param, skipCheck) {
  return get(url, param, skipCheck)
    .then(text => {
      return newPromise(JSON.parse(text))
    })
}
/**
 * 封装GET TEXT请求
 * @param {*} url 地址
 * @param {*} param 参数（格式：a=a&b=b）
 * @param skipCheck 跳过登录检查
 */
const getText = function (url, param, skipCheck) {
  return get(url, param, skipCheck)
}
/**
 * 封装SRC处理共通
 * @param {*} src 数据源(结构:string | {url: string | function, param: any | fucntion}))
 * @param {*} addition 附带数据(若url或者param为函数将被作为参数传递)
 */
const handleSrc = function (src, addition) {
  var requestUrl = ''
  var otherParams = {}
  // 是函数场合
  if (typeof src === 'function') {
    requestUrl = src(addition)
  // 是对象场合
  } else if (typeof src === 'object') {
    const { url, param } = src
    // 参数
    otherParams = typeof param === 'function' ? param(addition) : param
    // 是函数就执行函数获取url否则直接赋值
    requestUrl = typeof url === 'function' ? url(addition) : url
  // 是字符串场合
  } else if (typeof src === 'string') {
    requestUrl = src
  }
  return { url: requestUrl, param: otherParams }
}

export { postJSON, getJSON, getText, postText, handleSrc, newPromise }
