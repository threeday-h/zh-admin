// 设置 rem 函数
function setRem() {
  // 以 750px 为设计基准宽度，可以根据实际需要调整基准值。
  const baseWidth = 1920
  const scale = document.documentElement.clientWidth / (baseWidth / 16)
  // 设置页面根节点字体大小
  document.documentElement.style.fontSize = scale + 'px'
}

// 防抖函数，避免窗口大小频繁调整导致的性能问题
function debounce(func: () => void, delay: number) {
  let timeoutId: number | null = null
  return function () {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = window.setTimeout(func, delay)
  }
}

// 初始化
setRem()

// 改变窗口大小时重新设置 rem
window.addEventListener('resize', setRem)
