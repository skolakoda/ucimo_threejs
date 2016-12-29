/* eslint-env node */
var renderer
var scene
var camera
var control
var stats

var scale = chroma.scale(['white', 'blue', 'red']).domain([0, 20])

var pm = new THREE.ParticleBasicMaterial()
pm.map = THREE.ImageUtils.loadTexture('../../assets/teksture/ball.png')
pm.transparent = true
pm.opacity = 0.4
pm.size = 0.9
pm.vertexColors = true

var particleWidth = 100

var spacing = 0.26

var centerParticle

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
  renderer.setClearColor(0xffffff, 1.0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMapEnabled = true

  // position and point the camera to the center of the scene
  camera.position.x = 200
  camera.position.y = 200
  camera.position.z = 200
  camera.lookAt(scene.position)

  //    setupParticleSystem(particleWidth,particleWidth);

  // setup the control object for the control gui
  control = new function () {
    this.rotationSpeed = 0.001
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
  render()

  create3DTerrain(100, 100, 2.5, 2.5, 10)
  setupSound()
  loadSound('../../assets/audio/wagner-short.ogg')
}

function getHighPoint (geometry, face) {
  var v1 = geometry.vertices[face.a].y
  var v2 = geometry.vertices[face.b].y
  var v3 = geometry.vertices[face.c].y

  return Math.max(v1, v2, v3)
}

function create3DTerrain (width, depth, spacingX, spacingZ, height) {
  var date = new Date()
  noise.seed(date.getMilliseconds())

  // first create all the individual vertices
  var geometry = new THREE.Geometry()
  for (var z = 0; z < depth; z++) {
    for (var x = 0; x < width; x++) {
      //            var yValue = Math.abs(noise.perlin2(x/7, z/7) * height*2);
      var yValue = 0
      var vertex = new THREE.Vector3(x * spacingX, yValue, z * spacingZ)
      geometry.vertices.push(vertex)
    }
  }

  // next we need to define the faces. Which are triangles
  // we create a rectangle between four vertices, and we do
  // that as two triangles.
  for (let z = 0; z < depth - 1; z++) {
    for (let x = 0; x < width - 1; x++) {
      // we need to point to the position in the array
      // a - - b
      // |  x  |
      // c - - d
      var a = x + z * width
      var b = (x + 1) + (z * width)
      var c = x + ((z + 1) * width)
      var d = (x + 1) + ((z + 1) * width)

      // define the uvs for the vertices we just created.
      var uva = new THREE.Vector2(x / (width - 1), 1 - z / (depth - 1))
      var uvb = new THREE.Vector2((x + 1) / (width - 1), 1 - z / (depth - 1))
      var uvc = new THREE.Vector2(x / (width - 1), 1 - (z + 1) / (depth - 1))
      var uvd = new THREE.Vector2((x + 1) / (width - 1), 1 - (z + 1) / (depth - 1))

      var face1 = new THREE.Face3(b, a, c)
      var face2 = new THREE.Face3(c, d, b)

      face1.color = new THREE.Color(scale(getHighPoint(geometry, face1)).hex())
      face2.color = new THREE.Color(scale(getHighPoint(geometry, face2)).hex())

      geometry.faces.push(face1)
      geometry.faces.push(face2)

      geometry.faceVertexUvs[0].push([uvb, uva, uvc])
      geometry.faceVertexUvs[0].push([uvc, uvd, uvb])
    }
  }

  centerParticle = getCenterParticle()

  // compute the normals
  geometry.computeVertexNormals(true)
  geometry.computeFaceNormals()

  // setup the material
  var mat = new THREE.MeshBasicMaterial()
  //    mat.wireframe = true;
  mat.map = THREE.ImageUtils.loadTexture('../../assets/teksture/wood_1-1024x1024.png')

  // create the mesh
  var groundMesh = new THREE.Mesh(geometry, mat)
  groundMesh.translateX(-width * spacingX / 2)
  groundMesh.translateZ(-depth * spacingZ / 2)
  groundMesh.translateY(50)
  groundMesh.name = 'terrain'

  scene.add(groundMesh)
}

function addControlGui (controlObject) {
  var gui = new dat.GUI()
  gui.add(controlObject, 'rotationSpeed', -0.01, 0.01)
  //    gui.add(controlObject, 'opacity', 0.1, 1);
  //        gui.addColor(controlObject, 'color');
}

function addStatsObject () {
  stats = new Stats()
  stats.setMode(0)

  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0px'
  stats.domElement.style.top = '0px'

  document.body.appendChild(stats.domElement)
}

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

  if (scene.getObjectByName('terrain')) {
    scene.getObjectByName('terrain').geometry.verticesNeedUpdate = true
    scene.getObjectByName('terrain').geometry.computeVertexNormals(true)
    scene.getObjectByName('terrain').geometry.computeFaceNormals()
  }

  // render using requestAnimationFrame
  window.requestAnimationFrame(render)
}

var context
var sourceNode
var analyser
var javascriptNode

function setupSound () {
  if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
      console.log('no audiocontext found')
    }
    window.AudioContext = window.webkitAudioContext
  }
  context = new AudioContext()

  // setup a javascript node
  javascriptNode = context.createScriptProcessor(1024, 1, 1)
  // connect to destination, else it isn't called
  javascriptNode.connect(context.destination)
  javascriptNode.onaudioprocess = function () {
    // get the average for the first channel
    var array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)

    var lowValue = getAverageVolume(array, 0, 300)
    var midValue = getAverageVolume(array, 301, 600)
    var highValue = getAverageVolume(array, 601, 1000)

    var ps = scene.getObjectByName('terrain')
    var geom = ps.geometry

    var lowOffsets = []
    var midOffsets = []
    var highOffsets = []
    var lowRings = 10
    var midRings = 10
    var highRings = 10
    var midFrom = 12
    var highFrom = 24
    var lowVolumeDownScale = 5
    var midVolumeDownScale = 0.5
    var highVolumeDownScale = 0.5

    // calculate the rings and offsets for the low sounds, rannge from
    // 0.5 to 0 pi
    for (let i = lowRings; i > 0; i--) {
      lowOffsets.push(Math.sin(Math.PI * (0.5 * (i / lowRings))))
    }
    var lowParticles = []
    for (let i = 0; i < lowRings; i++) {
      lowParticles.push(getFallOffParticles(centerParticle, (i + 1) * spacing, i * spacing))
    }

    // calculate the rings and offsets for the mid sounds
    // range from 0 to 0.5PI to 0
    for (let i = 0; i < midRings / 2; i++) {
      midOffsets.push(Math.sin(Math.PI * (0.5 * (i / (midRings / 2)))))
    }

    for (let i = midRings / 2; i < midRings; i++) {
      midOffsets.push(Math.sin(Math.PI * (0.5 * (i / (midRings / 2)))))
    }

    var midParticles = []
    for (let i = 0; i < midRings; i++) {
      midParticles.push(getFallOffParticles(centerParticle, (i + 1 + midFrom) * spacing, (i + midFrom) * spacing))
    }

    // calculate the rings and offsets for the high sounds
    // range from 0 to 0.5PI to 0
    for (var i = 0; i < midRings / 2; i++) {
      highOffsets.push(Math.sin(Math.PI * (0.5 * (i / (highRings / 2)))))
    }

    for (let i = highRings / 2; i < highRings; i++) {
      highOffsets.push(Math.sin(Math.PI * (0.5 * (i / (highRings / 2)))))
    }

    var highParticles = []
    for (let i = 0; i < highRings; i++) {
      highParticles.push(getFallOffParticles(centerParticle, (i + 1 + highFrom) * spacing, (i + highFrom) * spacing))
    }

    // render the center ring
    renderRing(geom, [centerParticle], lowValue, 1, lowVolumeDownScale)
    // render the other rings for the lowvalue
    for (let i = 0; i < lowRings; i++) {
      renderRing(geom, lowParticles[i], lowValue, lowOffsets[i], lowVolumeDownScale)
    }

    // render the mid ring
    for (let i = 0; i < midRings; i++) {
      renderRing(geom, midParticles[i], midValue, midOffsets[i], midVolumeDownScale)
    }

    // render the high ring
    for (let i = 0; i < highRings; i++) {
      renderRing(geom, highParticles[i], highValue, highOffsets[i], highVolumeDownScale)
    }
  }

  // setup a analyzer
  analyser = context.createAnalyser()
  analyser.smoothingTimeConstant = 0.1
  analyser.fftSize = 2048

  // create a buffer source node
  sourceNode = context.createBufferSource()
  var splitter = context.createChannelSplitter()

  // connect the source to the analyser and the splitter
  sourceNode.connect(splitter)

  // connect one of the outputs from the splitter to
  // the analyser
  splitter.connect(analyser, 0, 0)

  // connect the splitter to the javascriptnode
  // we use the javascript node to draw at a
  // specific interval.
  analyser.connect(javascriptNode)

  // and connect to destination
  sourceNode.connect(context.destination)

  context = new AudioContext()
}

function renderRing (geom, particles, value, distanceOffset, volumeDownScale) {
  for (var i = 0; i < particles.length; i++) {
    if (geom.vertices[i]) {
      geom.vertices[particles[i]].y = distanceOffset * value / volumeDownScale
      geom.colors[particles[i]] = new THREE.Color(scale(distanceOffset * value).hex())
    }
  }
}

function getCenterParticle () {
  var center = Math.ceil(particleWidth / 2)
  var centerParticle = center + (center * particleWidth)

  return centerParticle
}

function getFallOffParticles (center, radiusStart, radiusEnd) {
  var result = []
  var ps = scene.getObjectByName('terrain')
  var geom = ps.geometry
  var centerParticle = geom.vertices[center]

  var dStart = Math.sqrt(radiusStart * radiusStart + radiusStart * radiusStart)
  var dEnd = Math.sqrt(radiusEnd * radiusEnd + radiusEnd * radiusEnd)

  for (var i = 0; i < geom.vertices.length; i++) {
    var point = geom.vertices[i]

    var xDistance = Math.abs(centerParticle.x - point.x)
    var zDistance = Math.abs(centerParticle.z - point.z)

    var dParticle = Math.sqrt(xDistance * xDistance + zDistance * zDistance)
    if (dParticle < dStart && dParticle >= dEnd && i !== center) {
      result.push(i)
    }
  }

  return result
}

function getAverageVolume (array, start, end) {
  var values = 0
  var average

  var length = end - start
  for (var i = start; i < end; i++) {
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
