
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon';

const generateHypersphere = (radius, dimensions, segments) => {
  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const theta = i * Math.PI / segments;
    for (let j = 0; j <= segments; j++) {
      const phi = j * 2 * Math.PI / segments;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      vertices.push(new THREE.Vector3(x, y, z));
    }
  }
  return vertices;
};

const hypersphereVertices = generateHypersphere(1, 4, 32);
const hypersphereGeometry = new THREE.BufferGeometry().setFromPoints(hypersphereVertices);

let scene, camera, renderer, lines;
let threeMesh;
let threeGeometry = new THREE.BufferGeometry();
let initialTime = Date.now();
let growthRate = 0.001;

// rest of your code...

  
  
  const vertices = [];
  const edges = [];
  const world = new CANNON.World();
  world.gravity.set(0, +0.32, 0);
  const sphereShape = new CANNON.Sphere(1); 
  const sphereBody = new CANNON.Body({
      mass: 1, 
      shape: sphereShape
  });

  function onWindowResize() {
    // Update the camera's aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    console.log("Window resized");
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
      camera.position.z = 5;
  
      // Initialize threeGeometry and threeMesh here
      const threeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
      threeMesh = new THREE.Mesh(threeGeometry, threeMaterial);

      scene.add(threeMesh); 
      sphereBody.position.copy(threeMesh.position);
      sphereBody.quaternion.copy(threeMesh.quaternion);
      world.addBody(sphereBody);
  
      for (let w = -1; w <= 1; w += 2) {
          for (let z = -1; z <= 1; z += 2) {
              for (let y = -1; y <= 1; y += 2) {
                  for (let x = -1; x <= 1; x += 2) {
                      vertices.push([x, y, z, w]);
                  }
              }
          }
      }
  
      for (let i = 0; i < vertices.length; i++) {
          for (let j = i + 1; j < vertices.length; j++) {
              let diff = vertices[i].reduce((sum, v, idx) => sum + Math.abs(v - vertices[j][idx]), 0);
              if (diff === 2) {
                  edges.push([i, j]);
              }
          }
      }
      
     
      
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      lines = new THREE.LineSegments(geometry, material);
      scene.add(lines);
      
      // THREE.SphereGeometry(1, 32, 32);
      const controls = new OrbitControls(camera, renderer.domElement);
    
      window.addEventListener('resize', onWindowResize);

      animate();
  }
  
  function animate() {
      requestAnimationFrame(animate);
  
      const angle = 0.01;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
  
      let currentTime = Date.now();
      let elapsedTime = currentTime - initialTime;
      let newRadius = 1 + growthRate * elapsedTime;
  
      sphereShape.radius = newRadius;
      sphereBody.updateBoundingRadius();
  
      if (threeMesh) {
          threeGeometry.dispose();
          threeGeometry = new THREE.SphereGeometry(newRadius, 32, 32);
          threeMesh.geometry = threeGeometry;
      }
  
      const rotatedVertices = vertices.map(vertex => {
          const [x, y, z, w] = vertex;
          return [
              cosAngle * x - sinAngle * w,
              y,
              z,
              sinAngle * x + cosAngle * w
          ];
      });
  
      const projectedVertices = rotatedVertices.map(vertex => {
          const [x, y, z, w] = vertex;
          const scale = 2 / (2 + w);
          return [scale * x, scale * y, scale * z];
      });
  
      const geometryVertices = [];
      for (const [start, end] of edges) {
          geometryVertices.push(...projectedVertices[start], ...projectedVertices[end]);
      }
  
      lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(geometryVertices, 3));
      lines.geometry.attributes.position.needsUpdate = true;
  
      world.step(1 / 60);
  
      threeMesh.position.copy(sphereBody.position);
      threeMesh.quaternion.copy(sphereBody.quaternion);
  
      for (let i = 0; i < vertices.length; i++) {
          vertices[i] = rotatedVertices[i];
      }
  
      renderer.render(scene, camera);
  }
  
  init();
  
  