import * as THREE from '/node_modules/three108/build/three.module.js'

/* including min, not including max */
export function randomInRange(min, max, round = false) {
  const rand = Math.random() * (max - min) + min
  return round ? Math.floor(rand) : rand
}

export function randomInCircle(radius) {
  const angle = Math.random() * Math.PI * 2
  const r = Math.sqrt(Math.random()) * radius
  const x = Math.cos(angle) * r
  const z = Math.sin(angle) * r
  return { x, z }
}

export function randomInSquare(size) {
  const x = randomInRange(-size * .5, size * .5)
  const z = randomInRange(-size * .5, size * .5)
  return { x, z }
}

export function randomGrey(min = 75, max = 150) {
  const v = (randomInRange(min, max) | 0).toString(16)
  return '#' + v + v + v
}

export function generateCityTexture() {
  // beli kvadrat
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, 32, 64)
  // crno-sive nijanse
  for (let y = 2; y < 64; y += 2)
    for (let x = 0; x < 32; x += 2) {
      const value = Math.floor(Math.random() * 64)
      context.fillStyle = `rgb(${value}, ${value}, ${value})`
      context.fillRect(x, y, 2, 1)
    }

  const canvas2 = document.createElement('canvas')
  canvas2.width = 512
  canvas2.height = 1024
  const context2 = canvas2.getContext('2d')
  context2.imageSmoothingEnabled = false
  context2.drawImage(canvas, 0, 0, canvas2.width, canvas2.height)

  const texture = new THREE.Texture(canvas2)
  texture.needsUpdate = true
  return texture
}

// colorful = 0 for gray nianses only
export function randomGray({ min = .3, max = .7, colorful = .02 } = {}) {
  const gray = randomInRange(min, max)
  const color = new THREE.Color(
    gray + randomInRange(-colorful, colorful),
    gray + randomInRange(-colorful, colorful),
    gray + randomInRange(-colorful, colorful)
  )
  return color
}

export function removeTopTexture(boxGeometry) {
  boxGeometry.faceVertexUvs[0][4][0].set(0, 0)
  boxGeometry.faceVertexUvs[0][4][1].set(0, 0)
  boxGeometry.faceVertexUvs[0][4][2].set(0, 0)
  boxGeometry.faceVertexUvs[0][5][0].set(0, 0)
  boxGeometry.faceVertexUvs[0][5][1].set(0, 0)
  boxGeometry.faceVertexUvs[0][5][2].set(0, 0)
}

export function createFloor({ size = 1000, color = 0x808080, circle = true } = {}) {
  const material = new THREE.MeshPhongMaterial({ color, dithering: true, side: THREE.DoubleSide })
  const geometry = circle
    ? new THREE.CircleGeometry(size, 32)
    : new THREE.PlaneGeometry(size, size)
  geometry.rotateX(-Math.PI * 0.5)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}