import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '@/utils/config'

/**
 * @description: 创建 token
 * @param {any} data
 * @return {*}
 */
function setToken(data: any) {
  //expiresIn:过期时间
  let token = jwt.sign(data, config.token.singKey, {
    expiresIn: config.token.singTime
  })
  return token
}

// AES 加密函数
function aesEncrypt(text: string, key: string = config.crypto.key) {
  const iv = crypto.randomBytes(16) // 生成随机的初始化向量
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted // 返回 iv 和加密后的文本
}

// AES 解密函数
function aesDecrypt(encryptedText: string, key: string = config.crypto.key) {
  const [iv, encrypted] = encryptedText.split(':') // 分离 iv 和加密文本
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'))
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export { setToken, aesEncrypt, aesDecrypt }
