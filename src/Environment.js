import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import BaseConfig from './baseConfig'
import { ARButton } from './ARButton.js'

export class Environment extends BaseConfig {
  constructor (config) {
    super()

    this._onSelect = config.onSelect || function () {}
    this.reticleMesh = config.reticleMesh || null

    this.hitTestSource = null
    this.hitTestSourceRequested = false

    const container = document.createElement('div')
    document.body.appendChild(container)

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      20
    )
    this.camera.position.set(-1.8, 0.6, 2.7)

    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1000, 1000, 0.25)
    this.scene.add(light)
    // const helper = new THREE.DirectionalLightHelper(light, 5);
    // scene.add(helper);

    // var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    // light.position.set(0.5, 1, 0.25);
    // this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff))

    if (!this.xr) {
    // 坐标系
      const axesHelper = new THREE.AxesHelper(5)
      this.scene.add(axesHelper)

      // 格子
      const size = 10
      const divisions = 10

      const gridHelper = new THREE.GridHelper(size, divisions)
      this.scene.add(gridHelper)

      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    if (this.xr) {
      this.renderer.xr.enabled = true
    }

    container.appendChild(this.renderer.domElement)

    if (this.xr) {
      // 创建 AR 按钮 用于授权和进入 AR 模式
      document.body.appendChild(
        ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] })
      )

      // 绑定点击事件
      const controller = this.renderer.xr.getController(0)
      controller.addEventListener('select', () => {
        if (this.reticle.visible) {
          this._onSelect && this._onSelect()
        }
      })
      this.scene.add(controller)

      // 添加 AR 准星 默认不可见 当通过AR API获取到平面时出现
      this.reticle = this.reticleMesh
      this.reticle.matrixAutoUpdate = false
      this.reticle.visible = false
      this.scene.add(this.reticle)
    } else {
      const controls = new OrbitControls(this.camera, this.renderer.domElement)
      // controls.addEventListener('change', this.render) // 因设置了AnimationLoop 所有可以不监听 change
      controls.minDistance = 2
      controls.maxDistance = 10
      controls.target.set(0, 0, -0.2)
      controls.update()
    }
    // 监听 resize 事件 修改three画布的分辨率
    window.addEventListener('resize', this.onWindowResize.bind(this))
    // 动画轮询
    this.renderer.setAnimationLoop((timestamp, frame) => {
      config.animationLoop && config.animationLoop()
      this.stats && this.stats.update()
      // eslint-disable-next-line no-useless-call
      this.render.call(this, timestamp, frame)
    })
  }

  onWindowResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  render (timestamp, frame) {
    if (this.xr && frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace()
      const session = this.renderer.xr.getSession()

      if (this.hitTestSourceRequested === false) {
        // 观察者参考空间
        session.requestReferenceSpace('viewer').then(referenceSpace => {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then(source => {
              // 获取碰撞检测源 以观察点为参考空间
              this.hitTestSource = source
            })
        })

        session.addEventListener('end', () => {
          this.hitTestSourceRequested = false
          this.hitTestSource = null
        })

        this.hitTestSourceRequested = true
      }

      if (this.hitTestSource) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource)

        if (hitTestResults.length) {
          const hit = hitTestResults[0]

          this.reticle.visible = true
          // 获取碰撞检测目标点的矩阵
          this.reticle.matrix.fromArray(
            hit.getPose(referenceSpace).transform.matrix
          )
        } else {
          this.reticle.visible = false
        }
      }
    }
    this.renderer && this.renderer.render(this.scene, this.camera)
  }
}
