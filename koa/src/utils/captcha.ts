import { Context } from 'koa'
import svgCaptcha from 'svg-captcha'

class CaptchaController {
  getCaptcha(ctx: Context) {
    //  若创建算数式验证码，将create改为createMathExpr
    const newCaptcha = svgCaptcha.createMathExpr({
      size: 5, // 验证码长度
      fontSize: 60, // 验证码字号
      noise: Math.floor(Math.random() * (5 - 1 + 1)) + 1, // 随机生成 1-5 条干扰线
      width: 125, // 宽度
      height: 40, // 高度
      color: false, // 验证码字符是否有颜色
      background: '#fff' // 背景色
    })

    ctx.session.captcha = String(newCaptcha.text) // 设置 session 验证码文本

    // console.log(ctx.session.captcha);

    ctx.type = 'text/html' // 设置响应类型为 HTML
    ctx.body = newCaptcha.data // 返回验证码 SVG 数据
  }
}

export default CaptchaController
