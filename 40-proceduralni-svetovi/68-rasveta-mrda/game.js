// https://threejs.org/examples/#webgl_lights_spotlights
import * as THREE from '/node_modules/three108/build/three.module.js'
import { TWEEN } from '/node_modules/three108/examples/jsm/libs/tween.module.min.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { randomInCircle, createFloor } from '/utils/helpers.js'

const controls = createOrbitControls()

const matFloor = new THREE.MeshPhongMaterial()
const matBox = new THREE.MeshPhongMaterial({ color: 0xaaaaaa })

const geoFloor = new THREE.PlaneGeometry(2000, 2000)
const geoBox = new THREE.BoxGeometry(3, 1, 2)

const mshFloor = new THREE.Mesh(geoFloor, matFloor)
mshFloor.rotation.x = - Math.PI * 0.5
const mshBox = new THREE.Mesh(geoBox, matBox)

const ambient = new THREE.AmbientLight(0x111111)

const spotLight1 = createSpotlight(0xFF7F00)
const spotLight2 = createSpotlight(0x00FF7F)
const spotLight3 = createSpotlight(0x7F00FF)

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding

camera.position.set(46, 22, - 21)

spotLight1.position.set(15, 40, 45)
spotLight2.position.set(0, 40, 35)
spotLight3.position.set(- 15, 40, 45)

matFloor.color.set(0x808080)

mshFloor.receiveShadow = true
mshFloor.position.set(0, - 0.05, 0)

mshBox.castShadow = true
mshBox.receiveShadow = true
mshBox.position.set(0, 5, 0)

scene.add(mshFloor)
scene.add(mshBox)
scene.add(ambient)
scene.add(spotLight1, spotLight2, spotLight3)

document.body.appendChild(renderer.domElement)
onWindowResize()
window.addEventListener('resize', onWindowResize)

controls.target.set(0, 7, 0)
controls.maxPolarAngle = Math.PI / 2
controls.update()

function createSpotlight(color) {
  const newObj = new THREE.SpotLight(color, 2)

  newObj.castShadow = true
  newObj.angle = 0.3
  newObj.penumbra = 0.2
  newObj.decay = 2
  newObj.distance = 50

  return newObj
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function tween(light) {

  new TWEEN.Tween(light).to({
    angle: (Math.random() * 0.7) + 0.1,
    penumbra: Math.random() + 1
  }, Math.random() * 3000 + 2000)
    .easing(TWEEN.Easing.Quadratic.Out).start()

  new TWEEN.Tween(light.position).to({
    x: (Math.random() * 30) - 15,
    y: (Math.random() * 10) + 15,
    z: (Math.random() * 30) - 15
  }, Math.random() * 3000 + 2000)
    .easing(TWEEN.Easing.Quadratic.Out).start()

}

function moveLights() {
  tween(spotLight1)
  tween(spotLight2)
  tween(spotLight3)

  setTimeout(moveLights, 10000)
}

function render() {
  TWEEN.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

render()
moveLights()
