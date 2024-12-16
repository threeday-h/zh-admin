import { defineStore } from 'pinia'
import cookieTools from '@/utils/cookie'
export const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {
      userInfo: cookieTools.getCookie('userInfo') ? JSON.parse(cookieTools.getCookie('userInfo') as string) : null
    }
  },
  actions: {
    logout() {
      this.userInfo = null
      sessionStorage.removeItem('routerTags')
      cookieTools.clearAllCookies()
    }
  }
})
