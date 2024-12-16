import 'koa'

declare module 'koa' {
  interface Context {
    generateResponse?: (code: number, msg: string, data?: any) => void
    dbTools?: typeof import('@/mysql/tools').dbTools
  }
}
