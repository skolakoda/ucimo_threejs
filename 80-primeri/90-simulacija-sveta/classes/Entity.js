import * as THREE from '/node_modules/three/build/three.module.js'
import Machine from '../libs/Machine.js'

export default class Entity {
  constructor(game, position, color = 0xffffff) {
    this.game = game
    this.destination = new THREE.Vector3(0, 0, 0)
    this.vel = new THREE.Vector3(0, 0, 0)
    this.rotation = new THREE.Euler(0, 0, 0)
    this.machine = new Machine()
    this.timeMult = 1
    this.speed = 0
    this.remove = false
    this.shadow = false
    this.state = null
    this.color = color
    this.createMesh()
    this.mesh.position.copy(position)
  }

  get pos() {
    return this.mesh.position
  }

  set pos(newPos) {
    this.mesh.position.copy(newPos)
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(10, 10, 10)
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
  }

  update(delta) {
    // rotate to target location
    const deltaX = this.destination.x - this.mesh.position.x
    const deltaZ = this.destination.z - this.mesh.position.z

    const dv = new THREE.Vector3()
    dv.subVectors(this.destination, this.mesh.position)
    dv.multiplyScalar(this.speed * .001)
    this.vel = dv
    this.rotation.y = (Math.atan2(deltaX, deltaZ))

    this.mesh.position.x += this.vel.x * delta * this.timeMult
    this.mesh.position.y += this.vel.y * delta * this.timeMult
    this.mesh.position.z += this.vel.z * delta * this.timeMult

    this.mesh.rotation.x = this.rotation.x
    this.mesh.rotation.y = this.rotation.y
    this.mesh.rotation.z = this.rotation.z
  }
}
