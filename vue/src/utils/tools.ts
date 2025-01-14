function setStorage<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, val as string)
  } catch {
    console.log("setStorageSync --- ERROR")
  }
}

function getStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.log("getStorageSync --- ERROR")
  }
}

// 判断对象的值是否为空
function isObjEmpty(obj: Object) {
  return Boolean(Object.values(obj).filter(item => item === "" || item === null).length)
}

// 对象相同字段快速赋值
function objectSame(obj1: Record<string, any>, obj2: Record<string, any>, excludedFields: string[] = []): void {
  Object.keys(obj2).forEach(key => {
    if (key in obj1 && !excludedFields.includes(key)) {
      obj1[key] = obj2[key]
    }
  })
}

// 复制
function handleCopy(str: string) {
  var input = document.createElement("input") // 创建input对象
  input.value = str // 设置复制内容
  document.body.appendChild(input) // 添加临时实例
  input.select() // 选择实例内容
  document.execCommand("Copy") // 执行复制
  document.body?.removeChild(input) // 删除临时实例
}

// 下载
function downloadIamge(imgsrc: string, name: string) {
  //下载图片地址和图片名
  var image = new Image()
  // 解决跨域 Canvas 污染问题
  image.setAttribute("crossOrigin", "anonymous")
  image.onload = function () {
    var canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    var context = canvas.getContext("2d") as any
    context.drawImage(image, 0, 0, image.width, image.height)
    var url = canvas.toDataURL("image/png") //得到图片的base64编码数据'
    var a = document.createElement("a") // 生成一个a元素
    var event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }) // 创建一个单击事件
    a.download = name || "photo" // 设置图片名称
    a.href = url // 将生成的URL设置为a.href属性
    a.dispatchEvent(event) // 触发a的单击事件
  }
  image.src = imgsrc
}

// 添加前缀
function addBaseUrl(key: string) {
  const base = import.meta.env.VITE_APP_BASE_URL.slice(0, -3)
  return base + key
}

export default { setStorage, getStorage, isObjEmpty, objectSame, handleCopy, downloadIamge, addBaseUrl }
