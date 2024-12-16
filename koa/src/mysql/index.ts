// mysql/index.js
const { createConnection } = require('mysql2/promise')

interface MySQLConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  waitForConnections: boolean
  connectionLimit: number
}

// 创建连接
const createDbConnection = async (mysqlConfig: MySQLConfig) => {
  try {
    const connection = await createConnection(mysqlConfig)
    return connection
  } catch (error) {
    console.error('Database connection error:', error)
    throw error // 抛出错误以便捕获
  }
}

module.exports = createDbConnection // 导出函数
