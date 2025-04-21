<template>
  <div class="container">
    <div ref="webglContainer" class="webgl-container"></div>
    <div class="control-panel">
      <el-button type="primary" @click="toggleExplode" class="toggle-button">
        {{ explodeValue > 0 ? "合并" : "爆炸" }}
      </el-button>
      <el-slider v-model="explodeValue" :min="0" :max="2" :step="0.01" @input="onExplodeChange"></el-slider>
      <div class="slider-label">爆炸效果: {{ explodeValue.toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup>
import * as THREE from "three"
import { ref, onMounted, onUnmounted } from "vue"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import gsap from "gsap"

let scene, camera, renderer, controls
let modelObject = null
const webglContainer = ref(null)
const explodeValue = ref(0)

function initExplodeModel(modelObject) {
  if (!modelObject) return

  const explodeBox = new THREE.Box3() // 爆炸盒
  explodeBox.setFromObject(modelObject) // 设置爆炸盒
  const explodeCenter = getWorldCenterPosition(explodeBox) // 获取爆炸中心

  const meshBox = new THREE.Box3() // 网格盒

  modelObject.traverse(function (value) {
    if (value.isMark || value.isMarkChild || value.isLine || value.isSprite) return // 如果物体是标记、标记子对象、线或精灵则返回
    if (value.isMesh) {
      meshBox.setFromObject(value)

      const meshCenter = getWorldCenterPosition(meshBox) // 获取网格中心
      value.userData.worldDir = new THREE.Vector3().subVectors(meshCenter, explodeCenter).normalize() // 计算世界方向
      value.userData.worldDistance = new THREE.Vector3().subVectors(meshCenter, explodeCenter)
      value.userData.originPosition = value.getWorldPosition(new THREE.Vector3()) // 获取原始世界位置
      value.userData.meshCenter = meshCenter.clone() // 克隆网格中心
      value.userData.explodeCenter = explodeCenter.clone() // 克隆爆炸中心
    }
  })
}

function getWorldCenterPosition(box, scalar = 0.5) {
  return new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(scalar)
}

function explodeModel(model, scalar, animate = true) {
  if (!model) return

  // 动画持续时间
  const duration = animate ? 1 : 0

  model.traverse(function (value) {
    if (!value.isMesh || !value.userData.originPosition) return

    // 当scalar为0时，直接使用原始位置
    if (scalar <= 0.001) {
      // 获取原始世界坐标并转换为本地坐标
      const originalWorldPos = value.userData.originPosition.clone()
      const localPosition = value.parent?.worldToLocal(originalWorldPos)

      if (localPosition && animate) {
        // 使用GSAP动画过渡回原始位置
        gsap.to(value.position, {
          x: localPosition.x,
          y: localPosition.y,
          z: localPosition.z,
          duration: duration,
          ease: "power2.inOut"
        })
      } else if (localPosition) {
        value.position.copy(localPosition)
      }
      return
    }

    // 常规爆炸效果计算
    const distance = value.userData.worldDir.clone().multiplyScalar(value.userData.worldDistance.length() * scalar)
    const offset = new THREE.Vector3().subVectors(value.userData.meshCenter, value.userData.originPosition)
    const center = value.userData.explodeCenter
    const newPos = new THREE.Vector3().copy(center).add(distance).sub(offset) // 计算新位置
    const localPosition = value.parent?.worldToLocal(newPos.clone()) // 转换为本地坐标

    if (localPosition && animate) {
      // 使用GSAP动画过渡到新位置
      gsap.to(value.position, {
        x: localPosition.x,
        y: localPosition.y,
        z: localPosition.z,
        duration: duration, // 动画持续时间
        ease: "power2.out" // 缓动函数
      })
    } else if (localPosition) {
      value.position.copy(localPosition) // 复制本地坐标到物体位置
    }
  })
}

function loadModel() {
  // 添加地面平面
  const planeGeometry = new THREE.PlaneGeometry(30, 30) // 平面几何
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 333333 }) // 平面材质
  const plane = new THREE.Mesh(planeGeometry, planeMaterial) // 平面
  plane.rotation.x = -Math.PI / 2 // 旋转
  plane.receiveShadow = true // 接收阴影
  scene.add(plane) // 添加到场景

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  // 加载汽车模型
  const loader = new GLTFLoader()

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")
  loader.setDRACOLoader(dracoLoader)

  const modelPath = "/models/car.glb"
  // const modelPath = '/models/ship_2.glb';
  // const modelPath = '/models/123.glb';
  // gl
  const gl = "/models/gtr-module/scene.gltf?url"

  loader.load(gl, gltf => {
    console.log(gltf)

    modelObject = gltf.scene
    console.log(modelObject)

    // 调整模型大小和位置
    const box = new THREE.Box3().setFromObject(modelObject) // 获取模型包围盒
    const size = box.getSize(new THREE.Vector3()) // 获取包围盒大小
    const maxDim = Math.max(size.x, size.y, size.z) // 获取最大维度
    const scale = 5 / maxDim // 计算缩放比例
    modelObject.scale.set(scale, scale, scale) // 设置缩放

    // 将模型放置在场景中心且稍微抬高
    const center = box.getCenter(new THREE.Vector3())
    modelObject.position.x = -center.x * scale
    modelObject.position.y = -center.y * scale + 1.5
    modelObject.position.z = -center.z * scale

    // 使模型中的所有物体可投射和接收阴影
    modelObject.traverse(node => {
      // 遍历模型中的所有物体
      if (node.isMesh) {
        // 如果物体是网格
        node.castShadow = true // 投射阴影
        node.receiveShadow = true // 接收阴影
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => {
              mat.side = THREE.DoubleSide // 设置材质为双面
              mat.needsUpdate = true
            })
          } else {
            node.material.side = THREE.DoubleSide // 设置材质为双面
            node.material.needsUpdate = true
          }
        }
      }
    })

    // 初始化爆炸数据
    initExplodeModel(modelObject)

    // 添加到场景
    scene.add(modelObject)

    // 调整相机查看位置
    controls.target.set(0, 1, 0)
    controls.update()
  })
}

function initThree() {
  // 使用窗口尺寸
  const width = webglContainer.value.clientWidth
  const height = webglContainer.value.clientHeight

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // 添加天空盒
  addSkybox()

  // 创建相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(10, 2, 0)
  //   camera.position.set(10, 10, 10)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 抗锯齿
    alpha: true // 透明度
  })

  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio || 1) // 像素比
  renderer.shadowMap.enabled = true // 阴影

  try {
    renderer.outputColorSpace = THREE.SRGBColorSpace // 颜色空间
  } catch (e) {
    renderer.outputEncoding = THREE.sRGBEncoding // 编码
  }

  // 添加到DOM
  webglContainer.value.appendChild(renderer.domElement)

  // 设置canvas样式
  const canvas = renderer.domElement
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.style.position = "absolute"
  canvas.style.top = "0"
  canvas.style.left = "0"

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // 惯性
  controls.dampingFactor = 0.05 // 惯性系数
  controls.minDistance = 1 // 最小距离
  controls.maxDistance = 50 // 最大距离

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2) // 方向光
  directionalLight.position.set(10, 15, 10) // 位置
  directionalLight.intensity = 8.0 // 光照强度设置为13.0，非常强
  directionalLight.castShadow = true // 投射阴影
  directionalLight.shadow.mapSize.width = 1024 // 阴影宽度
  directionalLight.shadow.mapSize.height = 1024 // 阴影高度

  // 软化阴影边缘
  directionalLight.shadow.bias = -0.0005 // 减少阴影痤疮
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // 使用柔和阴影
  scene.add(directionalLight)

  const secondLight = new THREE.DirectionalLight(0xffffff, 3.5) // 方向光
  secondLight.position.set(-5, 5, -5)
  scene.add(secondLight)

  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.5)
  bottomLight.position.set(0, -5, 0)
  scene.add(bottomLight)

  // 加载模型
  loadModel()

  // 开始动画循环
  animate()
}

function animate() {
  requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function onWindowResize() {
  if (!camera || !renderer) return

  // 使用容器尺寸，而不是窗口尺寸
  const width = webglContainer.value.clientWidth
  const height = webglContainer.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const onExplodeChange = value => {
  if (modelObject) {
    // 使用精确的值，确保爆炸效果正确控制，并启用动画
    explodeModel(modelObject, Math.max(0, value), true)
  }
}

// 添加快速爆炸/合并切换功能
const toggleExplode = () => {
  if (explodeValue.value > 0) {
    // 当前已爆炸，恢复原始状态
    explodeValue.value = 0
  } else {
    // 当前是原始状态，爆炸开来
    explodeValue.value = 1.5
  }

  onExplodeChange(explodeValue.value)
}

// 添加天空盒功能
function addSkybox(skyType = "daytime") {
  const path = `/skybox/${skyType}/` // 设置路径
  const format = ".jpg" // 设定格式

  const loaderbox = new THREE.CubeTextureLoader()
  const cubeTexture = loaderbox.load([
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format
  ])

  // 使用新的色彩空间属性
  cubeTexture.colorSpace = THREE.SRGBColorSpace
  scene.background = cubeTexture
}

// 暴露切换函数到window，方便调试
onMounted(() => {
  window.toggleExplode = toggleExplode
  window.toggleSkybox = type => {
    addSkybox(type)
  }

  initThree()
  window.addEventListener("resize", onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize)
  if (renderer) renderer.dispose()
  if (controls) controls.dispose()
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.webgl-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.control-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-button {
  width: 100%;
  margin-bottom: 10px;
}

.slider-label {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
}
</style>
