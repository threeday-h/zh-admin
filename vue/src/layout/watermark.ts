export const getmark = () => {
  let intervalId: number | undefined
  const id = "1.23452384164.123412416"

  const setWatermark = (str: string, container: HTMLElement) => {
    const existingWatermark = document.getElementById(id)
    if (existingWatermark !== null) {
      container?.removeChild(existingWatermark)
    }

    // 创建新的 canvas 元素，用于绘制水印图像
    const can = document.createElement("canvas")
    can.width = 400
    can.height = 200
    const cans = can.getContext("2d")!
    cans.rotate((-15 * Math.PI) / 180)
    cans.font = "16px sans-serif"
    cans.fillStyle = "rgba(0, 0, 0, 0.08)"
    cans.textAlign = "left"
    cans.fillText(str, can.width / 5, can.height / 1.5)

    const div = document.createElement("div")
    div.id = id
    div.style.pointerEvents = "none"
    div.style.position = "absolute"
    div.style.zIndex = "10"
    div.style.top = "0"
    div.style.left = "0"
    div.style.right = "0"
    div.style.bottom = "0"
    div.style.width = `${container.clientWidth}px`
    div.style.height = "100%"
    div.style.background = `url(${can.toDataURL("image/png")}) left top repeat`
    container.appendChild(div)

    return id
  }

  // 定义 watermark 函数，用于在给定的容器中创建水印
  const watermark = (str: string, container: HTMLElement) => {
    let id = setWatermark(str, container)

    // 设置定时器，每隔500毫秒检查水印是否存在
    intervalId = window.setInterval(() => {
      if (document.getElementById(id) === null) {
        id = setWatermark(str, container)
      }
    }, 500)

    // 当窗口大小改变时，重新创建水印
    window.addEventListener("resize", () => setWatermark(str, container))
  }

  // 定义销毁水印的函数
  const destroy = (container: HTMLElement) => {
    // 清除定时器
    if (intervalId !== undefined) {
      clearInterval(intervalId)
      intervalId = undefined
    }
    // 移除水印元素
    const watermarkElement = document.getElementById(id)
    if (watermarkElement) {
      container?.removeChild(watermarkElement)
    }
    // 移除 resize 事件监听器
    window.removeEventListener("resize", () => setWatermark("", container))
  }

  return { watermark, destroy }
}
