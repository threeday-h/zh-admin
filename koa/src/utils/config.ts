const baseUrl = 'https://xxx'
const key = '8f2f0c4e1a1ed4e0f69c8d78ef8a19cb'

export = {
  // 服务端口
  prot: 9898,
  token: {
    // 密钥
    singKey: key,
    // 过期时间（秒） 30天
    singTime: 60 * 60 * 24 * 30,
    // 请求头参数
    headers: 'Authorization',
    // 不用校验的路由
    unRouter: ['/api/upload', '/api/dict', '/api/sys/login/user', '/api/sys/captcha', '/api/wx/notify_url']
  },
  // 本地
  mysql: {
    //数据库地址
    host: 'localhost',
    // 端口
    port: '3306',
    //用户名，没有可不填
    user: 'root',
    //密码，没有可不填
    password: '123456',
    database: 'my-koa'
  },
  crypto: {
    key
  },
  session: {
    key: 'koa:sess',
    maxAge: 30000, // session 有效期，30秒
    httpOnly: true,
    signed: true,
    rolling: false // 每次响应时重置 session 有效期
  },
  weixin: {
    url: 'https://api.weixin.qq.com',
    appid: '',
    secret: '',
    // 商户号
    merchantId: '',
    // 回调地址(必须是公网地址) 这里需要我们自行实现用来接收支付结果信息
    notify_url: baseUrl + '/api/wx/notify_url',
    pay_secret: ''
  }
}
