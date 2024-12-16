// CookieUtil.ts
import Cookies from 'js-cookie'

class CookieUtil {
  // 设置 Cookie
  static setCookie(name: string, value: string, days: number = 7) {
    const options: Cookies.CookieAttributes = {
      expires: days,
      path: '/'
    }
    Cookies.set(name, value, options)
  }

  // 获取 Cookie
  static getCookie(name: string): string | undefined {
    return Cookies.get(name)
  }

  // 删除 Cookie
  static deleteCookie(name: string) {
    Cookies.remove(name, { path: '/' })
  }

  // 清除所有 Cookie
  static clearAllCookies() {
    const allCookies = Cookies.get() // 获取所有 Cookie
    Object.keys(allCookies).forEach((cookieName) => {
      if (cookieName !== 'loginForm' && cookieName !== 'themeConfig') Cookies.remove(cookieName, { path: '/' })
    })
  }
}

export default CookieUtil
