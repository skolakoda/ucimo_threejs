// global variables
var renderer
var scene
var camera
var control
var stats

/**
 * Initializes the scene, camera and objects. Called when the window is
 * loaded by using window.onload (see below)
 */
function init () {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new THREE.Scene()

    // create a camera, which defines where we're looking at.
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)

    // create a render, sets the background color and the size
  renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(0x000000, 1.0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMapEnabled = true

    // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(80, 80)
  var planeMaterial = new THREE.MeshPhongMaterial({color: 0x3333ff})
  var plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.receiveShadow = true

    // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 0
  plane.position.y = -2
  plane.position.z = 0

    // add the plane to the scene
  scene.add(plane)

    // create a cube
  var cubeGeometry = new THREE.BoxGeometry(3, 6, 3, 15, 25, 15)

  var pm = new THREE.ParticleBasicMaterial()
  pm.map = THREE.ImageUtils.loadTexture('teksture/particle.png')
  pm.blending = THREE.AdditiveBlending
  pm.transparent = true
  pm.size = 1.0
  var ps = new THREE.ParticleSystem(cubeGeometry, pm)
  ps.sortParticles = true
  ps.name = 'cube'
  ps.position.x = 1.75
  scene.add(ps)

  var pm2 = pm.clone()
  pm2.map = THREE.ImageUtils.loadTexture('teksture/particle2.png')
  var ps2 = new THREE.ParticleSystem(cubeGeometry, pm2)
  ps2.name = 'cube2'
  ps2.position.x = -1.75
  scene.add(ps2)

//        cube.name='cube';
//        cube.castShadow = true;

    // add the cube to the scene
//        scene.add(cube);

    // position and point the camera to the center of the scene
  camera.position.x = 10
  camera.position.y = 14
  camera.position.z = 10
  camera.lookAt(scene.position)

    // add spotlight for the shadows
  var spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(10, 20, 20)
  spotLight.shadowCameraNear = 20
  spotLight.shadowCameraFar = 50
  spotLight.castShadow = true

  scene.add(spotLight)

    // setup the control object for the control gui
  control = new function () {
    this.rotationSpeed = 0.005
    this.opacity = 0.6
//            this.color = cubeMaterial.color.getHex();
  }()

    // add extras
  addControlGui(control)
  addStatsObject()

    // add the output of the renderer to the html element
  document.body.appendChild(renderer.domElement)

  console.log('Log statement from the init function')
//        console.log(cube);

    // call the render function, after the first render, interval is determined
    // by requestAnimationFrame
  setupSound()
  render()

  loadSound('../../assets/audio/wagner-short.ogg')
}

function addControlGui (controlObject) {
  var gui = new dat.GUI()
  gui.add(controlObject, 'rotationSpeed', -0.01, 0.01)
}

function addStatsObject () {
  stats = new Stats()
  stats.setMode(0)

  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0px'
  stats.domElement.style.top = '0px'

  document.body.appendChild(stats.domElement)
}

var context
var sourceNode
var analyser
var analyser2

/**
 * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
 * for future renders
 */
function render () {
    // update the camera
  var rotSpeed = control.rotationSpeed
  camera.position.x = camera.position.x * Math.cos(rotSpeed) + camera.position.z * Math.sin(rotSpeed)
  camera.position.z = camera.position.z * Math.cos(rotSpeed) - camera.position.x * Math.sin(rotSpeed)
  camera.lookAt(scene.position)

    // update stats
  stats.update()

    // and render the scene
  renderer.render(scene, camera)

  updateCubes()

    // render using requestAnimationFrame
  requestAnimationFrame(render)
}

function updateCubes () {
    // get the average for the first channel
  var array = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(array)
  var average = getAverageVolume(array)

    // get the average for the second channel
  var array2 = new Uint8Array(analyser2.frequencyBinCount)
  analyser2.getByteFrequencyData(array2)
  var average2 = getAverageVolume(array2)

    // clear the current state
  if (scene.getObjectByName('cube')) {
    var cube = scene.getObjectByName('cube')
    var cube2 = scene.getObjectByName('cube2')
    cube.scale.y = average / 20
    cube2.scale.y = average2 / 20
  }
}

function setupSound () {
  if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
      alert('no audiocontext found')
    }
    window.AudioContext = window.webkitAudioContext
  }
  context = new AudioContext()

    // setup a analyzer
  analyser = context.createAnalyser()
  analyser.smoothingTimeConstant = 0.4
  analyser.fftSize = 1024

  analyser2 = context.createAnalyser()
  analyser2.smoothingTimeConstant = 0.4
  analyser2.fftSize = 1024

    // create a buffer source node
  sourceNode = context.createBufferSource()
  var splitter = context.createChannelSplitter()

    // connect the source to the analyser and the splitter
  sourceNode.connect(splitter)

    // connect one of the outputs from the splitter to
    // the analyser
  splitter.connect(analyser, 0)
  splitter.connect(analyser2, 1)

    // and connect to destination
  sourceNode.connect(context.destination)

  context = new AudioContext()
}

function getAverageVolume (array) {
  var values = 0
  var average

  var length = array.length

    // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    values += array[i]
  }

  average = values / length
  return average
}

function playSound (buffer) {
  sourceNode.buffer = buffer
  sourceNode.start(0)
}

// load the specified sound
function loadSound (url) {
  var request = new XMLHttpRequest()
  request.open('GET', url, true)
  request.responseType = 'arraybuffer'

    // When loaded decode the data
  request.onload = function () {
        // decode the data
    context.decodeAudioData(request.response, function (buffer) {
            // when the audio is decoded play the sound
      playSound(buffer)
    }, onError)
  }
  request.send()
}

function onError (e) {
  console.log(e)
}

/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// calls the init function when the window is done loading.
window.onload = init
// calls the handleResize function when the window is resized
window.addEventListener('resize', handleResize, false)
