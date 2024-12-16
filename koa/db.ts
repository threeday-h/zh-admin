const fs = require('fs')
const path = require('path')

// 获取目标文件夹路径
const folderPath = path.join(__dirname, './src/mysql/database')
const updatePath = path.join(__dirname, './src/mysql/update')

// 遍历文件夹中的所有 .sql 文件
fs.readdir(folderPath, (err: any, files: string[]) => {
  if (err) {
    console.error('读取文件夹出错:', err)
    return
  }

  // 筛选出所有 .sql 文件
  const sqlFiles = files.filter((file) => path.extname(file) === '.sql')

  if (sqlFiles.length === 0) {
    console.log('文件夹中没有找到 .sql 文件')
    return
  }

  // 遍历所有 .sql 文件并进行修改
  sqlFiles.forEach((file) => {
    const filePath = path.join(folderPath, file)
    const outputPath = path.join(updatePath, `modified_${file}`)

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err: any, data: string) => {
      if (err) {
        console.error(`读取文件 ${file} 出错:`, err)
        return
      }

      // 执行字符集替换
      let updatedData = data
        .replace(/utf8mb4_0900_ai_ci/g, 'utf8_general_ci') // 替换 utf8mb4_0900_ai_ci 为 utf8_general_ci
        .replace(/utf8mb4/g, 'utf8') // 替换 utf8mb4 为 utf8
        .replace(/utf8mb4_unicode_ci/g, 'utf8_general_ci') // 替换 utf8mb4_unicode_ci 为 utf8_general_ci

      // 保存修改后的文件
      fs.writeFile(outputPath, updatedData, 'utf8', (err: any) => {
        if (err) {
          console.error(`写入文件 ${outputPath} 出错:`, err)
          return
        }
        console.log(`文件 ${file} 已成功修改并保存为 ${outputPath}`)
      })
    })
  })
})
