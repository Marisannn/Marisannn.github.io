import '../style.css'
import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as dat from 'dat.gui';

//Scene
const scene = new THREE.Scene();

const directionalLight = new THREE.DirectionalLight('#fff', 1)
directionalLight.position.z = 2
scene.add(directionalLight)

const spotLight = new THREE.SpotLight(0xffa95c,4);
spotLight.position.set(-50,50,50);
spotLight.castShadow = true;
scene.add( spotLight );

//Debugging
// const gui = new dat.GUI();

let sceneObject;

function modelPositionPerAnchor(destination) {
  if(destination.anchor === 'anchor1') {
    gsap.to(sceneObject.position, { duration: 2, x: -6.9});
    gsap.to(sceneObject.position, { duration: 2, y: 14.8});
    gsap.to(sceneObject.position, { duration: 2, z: -7.9});
    gsap.to(sceneObject.rotation, { duration: 2, x: -0.72});
    gsap.to(sceneObject.rotation, { duration: 2, y: 2.1});
  } else if(destination.anchor === 'anchor2') {
    gsap.to(sceneObject.position, { duration: 2, x: -2.5});
    gsap.to(sceneObject.position, { duration: 2, y: 10.5});
    gsap.to(sceneObject.position, { duration: 2, z: 2.9});
    gsap.to(sceneObject.rotation, { duration: 2, x: -0.29});
    gsap.to(sceneObject.rotation, { duration: 2, y: 1.66});
  } else if(destination.anchor === 'anchor3') {
    gsap.to(sceneObject.position, { duration: 2, x: -2.5});
    gsap.to(sceneObject.position, { duration: 2, y: 11.06});
    gsap.to(sceneObject.position, { duration: 2, z: 2.9});
    gsap.to(sceneObject.rotation, { duration: 2, x: -0.29});
    gsap.to(sceneObject.rotation, { duration: 2, y: -2.02});
  }
}

const manager = new THREE.LoadingManager()
const loader = document.querySelector('.js-loader')

manager.onLoad = function ( ) {
  setTimeout(() => {
    loader.classList.add('hidden')
  }, 1000)

  new fullpage('.js-fullpage', {
    anchors: ['anchor1', 'anchor2', 'anchor3'],
    autoScrolling: true,
    responsive: true,
    beforeLeave: (origin, destination) => {
      modelPositionPerAnchor(destination)
    },
    afterLoad: (origin, destination) => {
      let activeSlider = destination.item.querySelector('.init-anim')
      let previousActiveSlider = origin.item.querySelector('.init-anim')

      if(activeSlider) {
        activeSlider.classList.add('animate')
      }

      if(origin.item !== destination.item) {
        if(previousActiveSlider) {
          previousActiveSlider.classList.remove('animate')
        }
      }

      modelPositionPerAnchor(destination)
    }
  })
}

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
  let percentage = Math.round(itemsLoaded / itemsTotal * 100)

  loader.innerHTML = percentage + '%'
}

manager.onError = function ( url ) {
  console.log( 'There was an error loading ' + url )
}

const gltfLoader = new GLTFLoader( manager )
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load('models/nier_automata.glb', glb => {
  sceneObject = glb.scene
  sceneObject.scale.set(10, 10, 10)
  sceneObject.position.set(-6.9, 14.8, -7.9)
  sceneObject.rotation.set(-0.72, 2.1, 0)

  sceneObject.traverse(n => { if ( n.isMesh ) {
    n.castShadow = true
    n.receiveShadow = true
    if(n.material.map) n.material.map.anisotropy = 16;
  }})

  // gui.add(sceneObject.rotation, 'x').min(-10).max(10).step(0.01).name('X Rotation');
  // gui.add(sceneObject.rotation, 'y').min(-10).max(10).step(0.01).name('Y Rotation');
  // gui.add(sceneObject.rotation, 'z').min(-10).max(10).step(0.01).name('Z Rotation');
  // gui.add(sceneObject.position, 'x').min(-50).max(50).step(0.1).name('X position');
  // gui.add(sceneObject.position, 'y').min(-50).max(50).step(0.1).name('Y position');
  // gui.add(sceneObject.position, 'z').min(-50).max(50).step(0.1).name('Z position');
  scene.add(sceneObject)
})

//Resizing
window.addEventListener('resize', () => {
  //Update Size
  aspect.width = window.innerWidth;
  aspect.height = window.innerHeight;

  //New Aspect Ratio
  camera.aspect = aspect.width / aspect.height;
  camera.updateProjectionMatrix();

  //New RendererSize
  renderer.setSize(aspect.width, aspect.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
const aspect = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(75, aspect.width / aspect.height);
camera.position.set( 5, 2, 8 );
scene.add(camera);

const lastPoint = {x: null, y: null}
window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(e) {
  const leftOrRight = (
    e.clientX > lastPoint.x ? 'right'
    : e.clientX < lastPoint.x ? 'left'
    : 'none'
  )
  const upOrDown = (
    e.clientY > lastPoint.y ? 'down'
    : e.clientY < lastPoint.y ? 'up'
    : 'none'
  )

  if(sceneObject) {
    if(leftOrRight === 'right') {
      sceneObject.position.x += 0.0001
    }

    if(leftOrRight === 'left') {
      sceneObject.position.x -= 0.0001
    }

    if(upOrDown === 'up') {
      sceneObject.position.y += 0.0001
    }

    if(upOrDown === 'down') {
      sceneObject.position.y -= 0.0001
    }
  }

  lastPoint.x = e.clientX
  lastPoint.y = e.clientY
}

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})

const starVertices = []

for(let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = (Math.random() - 0.5) * 2000
  starVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

//Renderer
const canvas = document.querySelector('.draw')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2.3
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(aspect.width, aspect.height)
renderer.shadowMap.enabled = true

//OrbitControls
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true
orbitControls.enableZoom = false

//Clock Class
const clock = new THREE.Clock();
let previousTime = 0

const animate = () => {
  //GetElapsedTime
  const elapsedTime = clock.getElapsedTime();
  const frameTime = elapsedTime - previousTime
  previousTime = elapsedTime

  stars.rotation.x += frameTime * 0.01

  spotLight.position.set( 
    camera.position.x + 10,
    camera.position.y + 10,
    camera.position.z + 10,
  );

  //Update Controls
  orbitControls.update();

  //Renderer
  renderer.render(scene, camera);

  //RequestAnimationFrame
  window.requestAnimationFrame(animate);
};

animate();
