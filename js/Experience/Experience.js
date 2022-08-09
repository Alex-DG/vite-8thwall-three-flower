import * as THREE from 'three'
import ParticleMaterial from './ParticleMaterial'

class _Experience {
  constructor() {
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
    this.engaged = false
  }

  /**
   * Experience setup
   */
  init(options) {
    if (!options) return
    if (this.engaged) return

    const { canvas, canvasWidth, canvasHeight, GLctx } = options

    this.count = options.count || 3000

    this.bind()

    this.setLight()
    this.setSizes({ canvasWidth, canvasHeight })
    this.setRenderer({ canvas, GLctx })
    this.setCamera()
    this.setMarker()
    // this.setCube()
    // this.setParticleSystem()

    this.engaged = true

    console.log('🤖', 'Experience initialized')
  }

  bind() {
    this.update = this.update.bind(this)
    this.render = this.render.bind(this)
    this.resize = this.resize.bind(this)
    this.detatch = this.detatch.bind(this)
    this.xrScene = this.xrScene.bind(this)
  }

  //////////////////////////////////////////////////////////////////////////////

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
  }

  setSizes({ canvasWidth, canvasHeight }) {
    this.sizes = {
      width: canvasWidth,
      height: canvasHeight,
    }
  }

  setCamera() {
    // Base camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )

    this.camera.position.y = 3
    this.camera.position.z = 3

    XR8.XrController.updateCameraProjectionMatrix({
      origin: this.camera.position,
      facing: this.camera.quaternion,
    })

    this.scene.add(this.camera)
  }

  setRenderer({ canvas, GLctx }) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: GLctx,
      antialias: true,
      alpha: true,
    })
    this.renderer.autoClear = false
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    // this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  setMarker() {
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    })
    const markerGeometry = new THREE.RingBufferGeometry(0.4, 0.5, 36).rotateX(
      -Math.PI / 2
    )

    this.marker = new THREE.Mesh(markerGeometry, markerMaterial)
    // this.marker.position.y = 0.5
    // this.marker.position.z = -2

    this.marker.matrixAutoUpdate = false
    this.scene.add(this.marker)
  }

  setCube() {
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    )
    this.cube.position.z = -4
    this.cube.position.y = 2

    this.scene.add(this.cube)
  }

  setParticleSystem() {
    const count = this.count
    this.particleMaterial = new ParticleMaterial()
    const particleGeometry = new THREE.BufferGeometry()
    const positionArray = new Float32Array(count * 3)
    const scaleArray = new Float32Array(count) // add scale randomness

    for (let i = 0; i < count; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 20
      positionArray[i * 3 + 1] = Math.random() * 30
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 20
      scaleArray[i] = Math.random()
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    )
    particleGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(scaleArray, 1)
    )

    this.particles = new THREE.Points(particleGeometry, this.particleMaterial)

    this.scene.add(this.particles)
  }

  //////////////////////////////////////////////////////////////////////////////

  xrScene() {
    const { scene, camera, renderer } = this
    return { scene, camera, renderer }
  }

  detatch() {
    this.engaged = false
  }

  resize({ canvasWidth, canvasHeight }) {
    if (!this.engaged) return

    this.renderer.setSize(canvasWidth, canvasHeight)
  }

  //////////////////////////////////////////////////////////////////////////////

  updateCube() {
    if (this.cube) {
      this.cube.rotation.x += 0.01
      this.cube.rotation.z += 0.01
    }
  }

  updateParticleSystem() {
    if (this.particleMaterial) {
      const time = this.clock.getElapsedTime() * 1000
      this.particleMaterial.uniforms.uTime.value = time
    }
  }

  render(options) {
    if (!this.engaged) return

    const { needsPrerenderFinish } = options

    this.renderer.clearDepth()
    if (needsPrerenderFinish) {
      this.renderer.getContext().finish()
    }

    this.updateCube()
    this.updateParticleSystem()

    this.renderer.render(this.scene, this.camera)
  }

  update(options) {
    if (!this.engaged) return

    const { processCpuResult } = options

    console.log('update', { options })

    const realitySource =
      processCpuResult.reality || processCpuResult.facecontroller

    if (!realitySource) return

    const { rotation, position, intrinsics } = realitySource

    for (let i = 0; i < 16; i++) {
      this.camera.projectionMatrix.elements[i] = intrinsics[i]
    }

    // Fix for broken raycasting in r103 and higher. Related to:
    //   https://github.com/mrdoob/three.js/pull/15996
    // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before setting
    // the inverse
    if (this.camera.projectionMatrixInverse) {
      if (this.camera.projectionMatrixInverse.invert) {
        // THREE 123 preferred version
        this.camera.projectionMatrixInverse
          .copy(this.camera.projectionMatrix)
          .invert()
      } else {
        // Backwards compatible version
        this.camera.projectionMatrixInverse.invert(camera.projectionMatrix)
      }
    }

    if (this.marker) {
      // this.marker.matrix.fromArray(intrinsics)
      // this.marker.position.set(position.x, 0.3, position.z * -1)
    }

    if (rotation) {
      this.camera.setRotationFromQuaternion(rotation)
    }

    if (position) {
      this.camera.position.set(position.x, position.y, position.z)
    }
  }
}

const Experience = new _Experience()
export default Experience
