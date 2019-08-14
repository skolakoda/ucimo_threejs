const SCREEN_WIDTH = window.innerWidth
const SCREEN_HEIGHT = window.innerHeight
const FLOOR = -1000

let container

let camera
let scene
let webglRenderer

const render_gl = 1
let has_gl = 0

let r = 0

let cubeMesh
let textureCube
let waterMesh

function addMesh(geometry, scale, x, y, z, rx, ry, rz, material) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.scale.x = mesh.scale.y = mesh.scale.z = scale
  mesh.position.x = x
  mesh.position.y = y
  mesh.position.z = z
  mesh.rotation.x = rx
  mesh.rotation.y = ry
  mesh.rotation.z = rz
  mesh.overdraw = true
  mesh.doubleSided = false
  mesh.updateMatrix()
  scene.addObject(mesh)
  return mesh
}

function init() {
  container = document.createElement('div')
  document.body.appendChild(container)

  const aspect = SCREEN_WIDTH / SCREEN_HEIGHT

  camera = new THREE.Camera(75, aspect, 1, 100000)
  camera.position.z = 650
  camera.position.x = 0
  camera.position.y = FLOOR + 2750

  scene = new THREE.Scene()

  scene.fog = new THREE.Fog(0x34583e, 0, 10000)

  // LIGHTS
  const ambient = new THREE.AmbientLight(0xffffff)
  scene.addLight(ambient)

  const path = 'textures/'
  const format = '.jpg'
  const urls = [
    path + 'px' + format, path + 'nx' + format,
    path + 'py' + format, path + 'ny' + format,
    path + 'pz' + format, path + 'nz' + format
  ]

  const images = ImageUtils.loadArray(urls)
  textureCube = new THREE.Texture(images)

  SceneUtils.addPanoramaCubeWebGL(scene, 10000, textureCube)

  const cube = new Cube(1, 1, 1, 1, 1)
  cubeMesh = addMesh(cube, 1, 0, FLOOR, 0, 0, 0, 0, new THREE.MeshLambertMaterial({ color: 0xFF3333 }))
  cubeMesh.visible = false
  camera.target = cubeMesh

  // terrain
  const img = new Image()
  img.onload = function() {
    const data = getHeightData(img)
    // plane
    plane = new Plane(100, 100, 127, 127)

    for (let i = 0, l = plane.vertices.length; i < l; i++)
      plane.vertices[i].position.z = data[i]

    const planeMesh = addMesh(plane, 100, 0, FLOOR, 0, -1.57, 0, 0, getTerrainMaterial())
    waterMesh.visible = true
  }
  img.src = 'heightmap_128.jpg'

  const water = new Plane(100, 100, 1, 1)
  for (let i = 0; i < water.uvs.length; i++) {
    const uvs = water.uvs[i]
    for (j = 0, jl = uvs.length; j < jl; j++) {
      uvs[j].u *= 10
      uvs[j].v *= 10
    }
  }
  waterMesh = addMesh(water, 63, -1000, FLOOR + 620, 1000, -1.57, 0, 0, getWaterMaterial())
  waterMesh.visible = false

  webglRenderer = new THREE.WebGLRenderer({ scene, clearColor: 0x34583e, clearAlpha: 0.5 })
  webglRenderer.setFaceCulling(0)
  webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
  container.appendChild(webglRenderer.domElement)
  has_gl = 1
}

function getHeightData(img) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')

  const size = 128 * 128, data = new Float32Array(size)

  context.drawImage(img, 0, 0)

  for (var i = 0; i < size; i++)
    data[i] = 0

  const imgd = context.getImageData(0, 0, 128, 128)
  const pix = imgd.data

  let j = 0
  for (var i = 0, n = pix.length; i < n; i += (4)) {
    const all = pix[i] + pix[i + 1] + pix[i + 2]
    data[j++] = all / 30
  }

  return data
}

function getWaterMaterial() {
  const waterMaterial = new THREE.MeshPhongMaterial({ map: new THREE.Texture(null, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping), ambient: 0x666666, specular: 0xffffff, env_map: textureCube, combine: THREE.Mix, reflectivity: 0.15, opacity: 0.8, shininess: 10, shading: THREE.SmoothShading })

  const img = new Image()
  waterMaterial.map.image = img
  img.onload = function() {
    waterMaterial.map.image.loaded = 1
  }
  img.src = 'water.jpg'

  return waterMaterial
}

function getTerrainMaterial() {
  const terrainMaterial = new THREE.MeshPhongMaterial({ map: new THREE.Texture(null, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping), ambient: 0xaaaaaa, specular: 0xffffff, shininess: 0, shading: THREE.SmoothShading })

  const img = new Image()
  terrainMaterial.map.image = img
  img.onload = function() {
    terrainMaterial.map.image.loaded = 1
  }
  img.src = 'terrain.jpg'

  return terrainMaterial
}

function animate() {
  requestAnimationFrame(animate)
  loop()
}

function loop() {
  const dist = 4000

  camera.position.x = dist * Math.cos(r)
  camera.position.z = dist * Math.sin(r)

  cubeMesh.position.y = FLOOR + 1500 - (Math.sin(r * 5) * 1000)
  cubeMesh.position.x = 500 - (Math.cos(r * 5) * 1000)
  cubeMesh.position.z = 500 - (Math.sin(r * 5) * 1000)

  r += 0.005

  if (render_gl && has_gl)
    webglRenderer.render(scene, camera)

}

init(), animate()
