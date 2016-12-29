var container, scene, camera, renderer, controls, stats;
var cube;

init();
animate();

// FUNCTIONS
function init() {
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);
    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 150, 100);
    scene.add(light);
    // FLOOR
    var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    var floorMaterial = new THREE.MeshBasicMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    // SKYBOX/FOG
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    var skyBoxMaterial = new THREE.MeshBasicMaterial({
        color: 0x9999ff,
        side: THREE.BackSide
    });
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    // scene.add(skyBox);
    scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

    ////////////
    // CUSTOM //
    ////////////

    // Spheres
    //   Note: a standard flat rectangular image will look distorted,
    //   a "spherical projection" image will look "normal".

    // radius, segmentsWidth, segmentsHeight
    var sphereGeom = new THREE.SphereGeometry(40, 32, 16);

    var light2 = new THREE.AmbientLight(0x444444);
    scene.add(light2);

    // basic lava ball
    var lavaTexture = THREE.ImageUtils.loadTexture('images/lava.jpg');
    var lavaMaterial = new THREE.MeshBasicMaterial({
        map: lavaTexture
    });
    var lavaBall = new THREE.Mesh(sphereGeom.clone(), lavaMaterial);
    lavaBall.position.set(-100, 50, 0);
    scene.add(lavaBall);

    // texture repeated twice in each direction
    var lavaTexture = THREE.ImageUtils.loadTexture('images/lava.jpg');
    lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set(2, 2);
    var lavaMaterial = new THREE.MeshBasicMaterial({
        map: lavaTexture
    });
    var lavaBall = new THREE.Mesh(sphereGeom.clone(), lavaMaterial);
    lavaBall.position.set(0, 50, 0);
    scene.add(lavaBall);

    // texture repeated thrice in each direction
    var lavaTexture = THREE.ImageUtils.loadTexture('images/lava.jpg');
    lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
    lavaTexture.repeat.set(3, 3);
    var lavaMaterial = new THREE.MeshBasicMaterial({
        map: lavaTexture
    });
    var lavaBall = new THREE.Mesh(sphereGeom.clone(), lavaMaterial);
    lavaBall.position.set(100, 50, 0);
    scene.add(lavaBall);

    // Cubes
    //   Note: when using a single image, it will appear on each of the faces.

    var cubeGeometry = new THREE.CubeGeometry(85, 85, 85);

    var crateTexture = new THREE.ImageUtils.loadTexture('images/crate.gif');
    var crateMaterial = new THREE.MeshBasicMaterial({
        map: crateTexture
    });
    var crate = new THREE.Mesh(cubeGeometry.clone(), crateMaterial);
    crate.position.set(-60, 50, -100);
    scene.add(crate);

    var crateTexture = new THREE.ImageUtils.loadTexture('images/crate.gif');
    crateTexture.wrapS = crateTexture.wrapT = THREE.RepeatWrapping;
    crateTexture.repeat.set(5, 5);
    var crateMaterial = new THREE.MeshBasicMaterial({
        map: crateTexture
    });
    var crate = new THREE.Mesh(cubeGeometry.clone(), crateMaterial);
    crate.position.set(60, 50, -100);
    scene.add(crate);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    controls.update();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}
