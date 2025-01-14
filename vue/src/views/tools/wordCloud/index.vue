<template>
  <div class="page">
    <div id="main"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { onMounted } from 'vue'

onMounted(() => {
  init()
})

const init = () => {
  const myChart = echarts.init(document.getElementById('main'))
  
  // 定义颜色数组
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
    '#1ABC9C', '#F1C40F', '#E74C3C', '#2ECC71',
    '#E67E22', '#7F8C8D', '#FF69B4', '#6A5ACD',
    '#00CED1', '#FF7F50', '#8A2BE2', '#20B2AA'
  ]

  // 准备数据，为每个项目分配随机颜色
  const wordCloudData = [
    { value: 50, name: 'iPhone 13' },
    { value: 30, name: 'VIVO' },
    { value: 29, name: 'OPPO' },
    { value: 28, name: 'HONOR' },
    { value: 27, name: 'iPhone 12 pro max' },
    { value: 26, name: 'iPhone 12 pro max' },
    { value: 25, name: 'HUAWEI MATE 10' },
    { value: 24, name: 'ONEPLUS' },
    { value: 23, name: 'Lenova T470' },
    { value: 22, name: 'MacBook Air ' },
    { value: 21, name: 'SAMSUNG' },
    { value: 20, name: 'iPad mini' },
    { value: 16, name: 'BLACKBERRY' },
    { value: 14, name: 'OPPO' },
    { value: 13, name: 'SAMSUNG' },
    { value: 12, name: '361' },
    { value: 10, name: 'Lenova' }
  ].map(item => ({
    ...item,
    textStyle: {
      color: colors[Math.floor(Math.random() * colors.length)],
      shadowBlur: 4,
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    }
  }))

  myChart.setOption({
    backgroundColor: '#fff',
    title: {
      text: '词云图',
      top: '5%',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#3B3E41',
        fontWeight: 'bold'
      }
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'square',
        left: 'center',
        top: 'center',
        width: '80%',
        height: '80%',
        sizeRange: [12, 50],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 20,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
        },
        emphasis: {
        //   focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: wordCloudData
      }
    ]
  })
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

#main {
  width: 600px;
  height: 600px;
  margin: auto;
}
</style>
