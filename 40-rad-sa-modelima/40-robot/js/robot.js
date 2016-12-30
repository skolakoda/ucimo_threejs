var container,
  stats

var camera,
  scene,
  renderer
var particleLight
var dae

var kinematics
var kinematicsTween
var tweenParameters = {}

var loader = new THREE.ColladaLoader()
loader.options.convertUpAxis = true
loader.load('modeli/robot.dae', function (collada) {
  dae = collada.scene

  dae.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.geometry.computeFaceNormals()
      child.material.shading = THREE.FlatShading
    }
  })

  dae.scale.x = dae.scale.y = dae.scale.z = 10.0
  dae.updateMatrix()

  kinematics = collada.kinematics

  init()
  animate()
})

function init () {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
  camera.position.set(2, 2, 3)

  scene = new THREE.Scene()

  // Grid

  var size = 14,
    step = 1

  var geometry = new THREE.Geometry()
  var material = new THREE.LineBasicMaterial({color: 0x303030})

  for (var i = -size; i <= size; i += step) {
    geometry.vertices.push(new THREE.Vector3(-size, -0.04, i))
    geometry.vertices.push(new THREE.Vector3(size, -0.04, i))

    geometry.vertices.push(new THREE.Vector3(i, -0.04, -size))
    geometry.vertices.push(new THREE.Vector3(i, -0.04, size))
  }

  var line = new THREE.Line(geometry, material, THREE.LinePieces)
  scene.add(line)

  // Add the COLLADA

  scene.add(dae)

  particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({color: 0xffffff}))
  scene.add(particleLight)

  // Lights

  var directionalLight = new THREE.HemisphereLight(0xffeeee, 0x111122)
  directionalLight.position.x = Math.random() - 0.5
  directionalLight.position.y = Math.random() - 0.5
  directionalLight.position.z = Math.random() - 0.5
  directionalLight.position.normalize()
  scene.add(directionalLight)

  var pointLight = new THREE.PointLight(0xffffff, 0.5)
  particleLight.add(pointLight)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  stats = new Stats()
  setupTween()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  container.appendChild(stats.domElement)

  //

  window.addEventListener('resize', onWindowResize, false)
}

function setupTween () {
  var duration = getRandomInt(1000, 5000)
  var target = {}

  for (var i = 0; i < kinematics.joints.length; i++) {
    var joint = kinematics.joints[i]
    var old = tweenParameters[i]
    var position = old || joint.zeroPosition
    tweenParameters[i] = position
    target[i] = getRandomInt(joint.limits.min, joint.limits.max)
  }

  kinematicsTween = new TWEEN.Tween(tweenParameters).to(target, duration).easing(TWEEN.Easing.Quadratic.Out)

  kinematicsTween.onUpdate(function () {
    for (var i = 0; i < kinematics.joints.length; i++) {
      kinematics.setJointValue(i, this[i])
    }
  })
  kinematicsTween.start()
  setTimeout(setupTween, duration)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

function animate () {
  requestAnimationFrame(animate)
  render()
  stats.update()
  TWEEN.update()
}

function render () {
  var timer = Date.now() * 0.0001

  camera.position.x = Math.cos(timer) * 17
  camera.position.y = 10
  camera.position.z = Math.sin(timer) * 17

  camera.lookAt(scene.position)

  particleLight.position.x = Math.sin(timer * 4) * 3009
  particleLight.position.y = Math.cos(timer * 5) * 4000
  particleLight.position.z = Math.cos(timer * 4) * 3009

  renderer.render(scene, camera)
}

// Returns a random integer between min (inclusive) and max (inclusive)
// Using Math.round() will give you a non-uniform distribution!

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
