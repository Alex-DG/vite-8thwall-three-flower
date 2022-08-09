import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import modelSrc from '../../assets/models/marigold.glb'

class _Experience {
  constructor() {
    this.scene = new THREE.Scene()
    this.sceneMarker = new THREE.Scene()
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.tapPosition = new THREE.Vector2()
    this.loader = new GLTFLoader()
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

    this.surface = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 1, 1),
      new THREE.ShadowMaterial({
        opacity: 0.5,
      })
    )

    this.surface.rotateX(-Math.PI / 2)
    this.surface.position.set(0, 0, 0)
    this.surface.receiveShadow = true
    this.scene.add(this.surface)

    this.setLight()
    this.setSizes({ canvasWidth, canvasHeight })
    this.setRenderer({ canvas, GLctx })
    this.setFlower()
    this.setCamera()
    this.setMarker()

    this.engaged = true

    console.log('🤖', 'Experience initialized')
  }

  bind() {
    this.placeObjectTouchHandler = this.placeObjectTouchHandler.bind(this)
    this.update = this.update.bind(this)
    this.render = this.render.bind(this)
    this.resize = this.resize.bind(this)
    this.detatch = this.detatch.bind(this)
    this.xrScene = this.xrScene.bind(this)
  }

  animateIn(pointX, pointZ, yDegrees) {
    const newFlower = this.flower.clone()
    newFlower.rotation.set(0.0, yDegrees, 0.0)
    newFlower.position.set(pointX, 0.0, pointZ)
    // newFlower.scale.set(scale.x, scale.y, scale.z)

    this.scene.add(newFlower)
  }

  placeObjectTouchHandler(e) {
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (e.touches.length === 2) {
      XR8.XrController.recenter()
    }

    if (e.touches.length > 2) {
      return
    }

    // If the canvas is tapped with one finger and hits the "surface", spawn an object.

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    this.tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    this.tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and tap position.
    this.raycaster.setFromCamera(this.tapPosition, this.camera)

    // Raycast against the "surface" object.
    const intersects = this.raycaster.intersectObject(this.surface)
    if (intersects.length > 0) {
      this.animateIn(
        intersects[0].point.x,
        intersects[0].point.z,
        Math.random() * 360
      )
    }
    console.log({ intersects })
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

    XR8.XrController.updateCameraProjectionMatrix({
      origin: this.camera.position,
      facing: this.camera.quaternion,
    })

    this.cameraMarker = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )
    this.cameraMarker.position.z = 2.5

    // this.scene.add(this.camera, this.cameraMarker)
    this.scene.add(this.camera)

    // this.sceneMarker.add(this.cameraMarker)
  }

  setRenderer({ canvas, GLctx }) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: GLctx,
      antialias: true,
      alpha: true,
    })
    this.renderer.autoClear = false
    // this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.setSize(this.sizes.width, this.sizes.height)

    canvas.addEventListener('touchstart', this.placeObjectTouchHandler, true) // Add touch listener.
    // this.canvas.addEventListener(
    //   'touchstart',
    //   (e) => {
    //     // const { clientX, clientY } = e

    //     const rect = this.renderer.domElement.getBoundingClientRect()
    //     // const coords = {
    //     //   x: ((clientX - rect.left) / rect.width) * 2 - 1,
    //     //   y: ((clientY - rect.top) / rect.height) * -2 + 1,
    //     // }
    //     // this.raycaster.setFromCamera(coords, this.cameraMarker)

    //     // // const intersects = this.raycaster.intersectObject(this.marker)
    //     // const intersects = this.raycaster.intersectObjects(
    //     //   this.sceneMarker.children,
    //     //   true
    //     // )

    //     // if (e.touches.length > 2) {
    //     //   return
    //     // }

    //     // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    //     // this.tapPosition.x = (e.touches[0].clientX / rect.width) * 2 - 1
    //     // this.tapPosition.y = -(e.touches[0].clientY / rect.height) * 2 + 1
    //     this.tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    //     this.tapPosition.y =
    //       -(e.touches[0].clientY / window.innerHeight) * 2 + 1

    //     // Update the picking ray with the camera and tap position.
    //     // this.raycaster.setFromCamera(this.tapPosition, this.cameraMarker)

    //     // // Raycast against the "surface" object.
    //     // const intersects = this.raycaster.intersectObjects(
    //     //   this.sceneMarker.children,
    //     //   true
    //     // )

    //     // console.log({ intersects })
    //   },
    //   true
    // )
  }

  setFlower() {
    this.loader.load(modelSrc, (gltf) => {
      this.flower = gltf.scene
      // this.flower.position.z = -4
      // this.flower.scale.multiplyScalar(0)

      // this.scene.add(this.flower)

      // // Update material
      // this.flower.traverse((child) => {
      //   // Sunflower mesh
      //   if (child.isMesh) {
      //     const material = child.material
      //     const map = material.map
      //     material.emissive = new THREE.Color('#FFFF00')
      //     material.emissiveIntensity = 0.5
      //     material.emissiveMap = map
      //     material.color.convertSRGBToLinear()
      //     map.encoding = THREE.sRGBEncoding
      //   }
      // })

      console.log('🌻', 'Model loaded', {
        flow: this.flower,
      })

      // this.onSceneReady()
    })
  }

  setMarker() {
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    })
    const markerGeometry = new THREE.RingBufferGeometry(0.4, 0.5, 36).rotateX(
      -Math.PI / 1.4
    )

    this.marker = new THREE.Mesh(markerGeometry, markerMaterial)
    this.marker.name = 'marker'
    this.marker.visible = false
    this.marker.position.z = -3

    this.sceneMarker.add(this.marker)
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

  updateMarkerVisibility(rotation) {
    // const angle = new THREE.Euler(rotation.x, rotation.y, rotation.z, 'XYZ')
    // const deg = THREE.MathUtils.radToDeg(angle.x)
    // this.marker.visible = Math.abs(deg) >= 15
    this.marker.visible = Math.abs(rotation.x) >= 0.15
  }

  render(options) {
    if (!this.engaged) return

    const { needsPrerenderFinish } = options

    this.renderer.clearDepth()
    if (needsPrerenderFinish) {
      this.renderer.getContext().finish()
    }

    this.renderer.render(this.scene, this.camera)

    // this.renderer.render(this.sceneMarker, this.cameraMarker)
  }

  update(options) {
    if (!this.engaged) return

    const { processCpuResult } = options

    const realitySource =
      processCpuResult.reality || processCpuResult.facecontroller

    if (!realitySource) return

    // console.log('update', { options })

    const { rotation, position, intrinsics } = realitySource

    for (let i = 0; i < 16; i++) {
      this.camera.projectionMatrix.elements[i] = intrinsics[i]
      // this.cameraMarker.projectionMatrix.elements[i] = intrinsics[i]
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
        this.camera.projectionMatrixInverse.invert(this.camera.projectionMatrix)
      }
    }

    if (rotation) {
      this.camera.setRotationFromQuaternion(rotation)
      this.updateMarkerVisibility(rotation)
    }

    if (position) {
      this.camera.position.set(position.x, position.y, position.z)
    }
  }
}

const Experience = new _Experience()
export default Experience
