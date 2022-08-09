import '../styles/app.css'
import * as THREE from 'three'
import Pipeline from './Experience/Pipeline'

const onxrloaded = () => {
  window.THREE = THREE

  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.

    Pipeline.initModule(), // Create Three.js scene and camera.

    XR8.XrController.pipelineModule(), // Enables SLAM tracking.
    // XR8.XrController.pipelineModule({
    //   name: 'request-gyro',
    //   requiredPermissions: () => [
    //     XR8.XrPermissions.permissions().DEVICE_ORIENTATION,
    //   ],
    // }),

    XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
    XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
    XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
    XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
  ])

  // Open the camera and start running the camera run loop.
  XR8.run({ canvas: document.getElementById('experience') })

  console.log('✅', 'XR8 running')
}

window.onload = () => {
  window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
}
