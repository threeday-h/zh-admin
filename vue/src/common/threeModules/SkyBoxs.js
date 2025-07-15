import * as THREE from "three"

const skyboxType = {
	day: 'day',
	dusk: 'dusk',
	night: 'night'
}

export default class SkyBoxs {
	constructor(viewer) {
		this.viewer = viewer
	}

	setSkybox(type = skyboxType.day) {
		const loaderbox = new THREE.CubeTextureLoader() // 加载贴图
		const cubeTexture = loaderbox.load([
			`/images/skybox/${type}/posx.jpg`,
			`/images/skybox/${type}/negx.jpg`,
			`/images/skybox/${type}/posy.jpg`,
			`/images/skybox/${type}/negy.jpg`,
			`/images/skybox/${type}/posz.jpg`,
			`/images/skybox/${type}/negz.jpg`
		])
		this.viewer.scene.background = cubeTexture
	}
}
