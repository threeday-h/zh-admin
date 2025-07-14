<template>
  <div class="container-main" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Water } from "three/examples/jsm/objects/Water2"
// 模型解压
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"
// 场景
const scene = new THREE.Scene()
// 相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
camera.position.set(-50, 50, 130)
camera.aspect = window.innerWidth / window.innerHeight
camera.updateProjectionMatrix()
scene.add(camera)

// 渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 抗锯齿
  logarithmicDepthBuffer: true // 对数深度缓存
})

// 环境编码
renderer.setSize(window.innerWidth, window.innerHeight)

const render = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

const container = ref()

onMounted(() => {
  const controls = new OrbitControls(camera, renderer.domElement) // 添加控制器
  controls.enableDamping = true // 阻尼效果
  createVideo()
  container.value.appendChild(renderer.domElement) // 将渲染器添加到容器
  render() // 开始渲染
})

// 创建天空球
const skyGeo = new THREE.SphereGeometry(1000, 60, 60)
const skyTex = new THREE.TextureLoader().load("/images/sky.jpg")
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex })
// 视角进入球体内部
skyGeo.scale(1, 1, -1) // 翻转
const sky = new THREE.Mesh(skyGeo, skyMat) // 创建天空
scene.add(sky)

// 视频纹理
const createVideo = () => {
  const video = document.createElement("video")
  video.src = "/video/sky.mp4"
  video.loop = true // 循环播放
  window.addEventListener("click", () => {
    if (video.paused) {
      video.play()
      const texture = new THREE.VideoTexture(video) // 创建纹理
      skyMat.map = texture // 设置纹理
      skyMat.needsUpdate = true // 更新
    }
  })
}

// 载入环境纹理
const hdrLoader = new RGBELoader() // 环境纹理
hdrLoader.loadAsync("/hdr/050.hdr").then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping // 设置环境纹理
  scene.background = texture // 设置环境纹理
  scene.environment = texture // 设置环境纹理
})

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(-100, 100, 10)
scene.add(light)

// 创建水面
const waterGeo = new THREE.CircleGeometry(300, 64) // 水面
const waterTexLoader = new THREE.TextureLoader() // 水面纹理
const waterMat = new Water(waterGeo, {
  // 水面材质
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 2,
  normalMap0: waterTexLoader.load("/images/Water_1_M_Normal.jpg"),
  normalMap1: waterTexLoader.load("/images/Water_2_M_Normal.jpg")
})
// 水平面抬高3米淹没石头
waterMat.position.y = 3
// 水面旋转至水平
waterMat.rotation.x = -Math.PI / 2
scene.add(waterMat)

// 添加模型
const loader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
// 添加draco载入库
dracoLoader.setDecoderPath("/js/draco/")
loader.setDRACOLoader(dracoLoader) // 设置draco载入库

loader.load("/glb/island2.glb", gltf => {
  const isLand = gltf.scene
  scene.add(isLand)
})
</script>

<style scoped>
.container-main {
  width: 100%;
  height: 100%;
  height: calc(100vh - 7rem);
  background-color: #fff;
}
</style>
