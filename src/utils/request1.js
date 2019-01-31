import Vue from 'vue'

// 注意
// fetch()方法返回的Promise对象并不会在HTTP状态码为404或者500的时候自动抛出异常，而需要用户进行手动处理
// 所以在此处设置checkCode进行返回状态码的判断，并给予提示
// $route, $router, $confirm, $notify进行封装，并根据返回的状态码进行对应的提示
// 此方法是在登录检查通过时调用
function checkCode (res, text) {
  const code = res.status// 所得的状态码
  const { $route, $router, $confirm, $notify } = Vue.prototype._vue
  // 如果返回的状态码进行提示，单部分配置与后台配置相关
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

// 构建一个Promise，做参数(操作)的处理，此promise主要用作处理post，get请求的所得的返回值得处理，HandleRequestValue
const handleRequestValue = function (handle) { // 建议将newPromise的命名改为 newPromise
  var p = new Promise(function (resolve, reject) {
    // 传入操作为函数才执行操作，做传入的data类型的判断
    if (typeof handle === 'function' || typeof handle === 'object') {
      // 做异步操作是否成功的判断
      try {
        // 传入的数据类型为function则用传入的function处理reject，否则则直接获取传入function的返回值
        resolve(typeof handle === 'function' ? handle(reject) : handle)
      } catch (e) {
        // 异步失败处理
        reject(e)
      }
    }
  })
  // 返回通过p处理过的值
  return p
}
// 进行token的配置
function handleToken (res) {
  let token = res.headers.get('custom-user-login-token')
  localStorage['user_login_token'] = token || localStorage['user_login_token']
  localStorage['user_login_life'] = new Date().getTime() + 20 * 60 * 1000
}
// 处理传入的参数对象param进行处理
function handleParamObj (param) {
  let querySrc = ''
  for (var key in param) {
    querySrc += '&' + key + '=' + param[key]
  }
  return querySrc
}

// 下面开始进行请求的封装

/**
 * 参数说明：
 *url 地址
 *param 参数（格式：a=a&b=b）
 *skipCheck 跳过登录检查
 */
// 封装post请求
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
      'custom-user-login-token': localStorage['user_login_token'], // token的存储的提取
      'Message': 'there can spend some message , but no support chinese'// 所带内容不支持中文
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
        return handleRequestValue(function () {
          return text
        })
      }
      // 检查通过
      if (checkCode(res, text)) {
        handleToken(res)
        return handleRequestValue(function () {
          return text
        })
      } else {
        // 中断操作
        return handleRequestValue()
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
      return handleRequestValue(JSON.parse(text))
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
        return handleRequestValue(function () {
          return text
        })
      }
      // 检查通过
      if (checkCode(res, text)) {
        handleToken(res)
        return handleRequestValue(function () {
          return text
        })
      } else {
        // 中断操作
        return handleRequestValue()
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
      return handleRequestValue(JSON.parse(text))
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

// 输出(传出以下定的const常量)
export { postJSON, getJSON, getText, postText, handleSrc, handleRequestValue }
