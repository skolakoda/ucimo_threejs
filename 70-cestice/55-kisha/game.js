import * as THREE from '/node_modules/three/build/three.module.js'
import {scene, camera, renderer, createOrbitControls} from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'

const drops = createRain()
scene.add(...drops)

createOrbitControls()

/* FUNCTIONS */

function createRain(dropsNum = 1000) {
  const drops = []
  for (let i = 0; i < dropsNum; i++) {
    const geometry = new THREE.SphereGeometry(Math.random() * 5)
    const material = new THREE.MeshBasicMaterial({
      color: 0x9999ff,
      transparent: true,
      opacity: 0.6,
    })
    const drop = new THREE.Mesh(geometry, material)
    drop.scale.set(0.1, 1, 0.1)
    drop.position.x = randomInRange(-500, 500)
    drop.position.y = randomInRange(-500, 500)
    drop.position.z = randomInRange(-500, 500)
    drop.velocity = randomInRange(5, 10)
    drops.push(drop)
  }
  return drops
}

function updateRain() {
  drops.forEach(drop => {
    drop.position.y -= drop.velocity
    if (drop.position.y < -100) drop.position.y += 1000
  })
}

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  updateRain()
}()
