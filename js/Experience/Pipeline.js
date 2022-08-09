import Experience from './Experience'

class _Pipeline {
  initModule() {
    const device = XR8.XrDevice.deviceEstimate()
    const needsPrerenderFinish =
      device.os === 'iOS' && parseFloat(device.osVersion) >= 15.4

    return {
      name: 'threejsinitscene',
      // onStart is called once when the camera feed begins.
      onStart: (args) => Experience.init(args),
      onAttach: (args) => Experience.init(args),
      onUpdate: (args) => Experience.update(args),
      onCanvasSizeChange: (args) => Experience.resize(args),
      onDetach: () => Experience.detatch(),
      onRender: () => Experience.render({ needsPrerenderFinish }),
      xrScene: () => Experience.xrScene(),
    }
  }
}

const Pipeline = new _Pipeline()
export default Pipeline
