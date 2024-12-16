<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { ElScrollbar } from 'element-plus'
const tagAndTagSpacing = 4

const scrollContainer = ref<InstanceType<typeof ElScrollbar> | null>(null)

const scrollWrapper = computed(() => scrollContainer.value?.$refs.wrap as HTMLElement)

function handleScroll(e: WheelEvent) {
  const eventDelta = e.deltaY ? -e.deltaY * 40 : (e as any).wheelDelta
  if (scrollWrapper.value) {
    scrollWrapper.value.scrollLeft += eventDelta / 4
  }
}

function emitScroll() {
  scrollContainer.value?.$emit('scroll')
}

function moveToTarget(currentTag: HTMLElement) {
  if (!scrollContainer.value || !scrollWrapper.value) return

  const $container = scrollContainer.value.$el as HTMLElement
  const $containerWidth = $container.offsetWidth
  const tagList = Array.from($container.querySelectorAll('.tag')) as HTMLElement[]

  let firstTag = tagList[0]
  let lastTag = tagList[tagList.length - 1]

  if (firstTag === currentTag) {
    scrollWrapper.value.scrollLeft = 0
  } else if (lastTag === currentTag) {
    scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollWidth - $containerWidth
  } else {
    const currentIndex = tagList.findIndex((tag) => tag === currentTag)
    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]

    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing

    if (afterNextTagOffsetLeft > scrollWrapper.value.scrollLeft + $containerWidth) {
      scrollWrapper.value.scrollLeft = afterNextTagOffsetLeft - $containerWidth
    } else if (beforePrevTagOffsetLeft < scrollWrapper.value.scrollLeft) {
      scrollWrapper.value.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}

onMounted(() => {
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener('scroll', emitScroll, true)
  }
})

onBeforeUnmount(() => {
  if (scrollWrapper.value) {
    scrollWrapper.value.removeEventListener('scroll', emitScroll)
  }
})
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;

  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
