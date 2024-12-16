import path from 'path'
import job from './job/index'
import config from '@/utils/config'
const { exec } = require('child_process')

const mysql = config.mysql

// 创建每天凌晨 24 点 备份数据库
job.createCronJob(
  '0 0 0 * * *',
  async () => {
    const backupDir = path.join(__dirname, '../../mysql/backups')
    const dateFolder = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const backupFile = path.join(backupDir, `${dateFolder}.sql`)
    const dumpCommand = `mysqldump -h ${mysql.host} -u ${mysql.user} -p${mysql.password} ${mysql.database} > ${backupFile}`

    exec(dumpCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`[ERROR] 数据库备份失败: ${error.message}`)
        return
      }
      console.log(`[INFO] ${backupFile} 数据库备份完成:`, backupFile)
    })
  },
  {}
)
