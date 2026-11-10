// Lightweight rotating GLB viewer.
// Usage: <div class="viewer" data-model="model.glb"></div>
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function initViewer(el) {
  const url = el.dataset.model;
  const loading = document.createElement("div");
  loading.className = "viewer-loading";
  loading.textContent = "loading model…";
  el.appendChild(loading);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 5000);

  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x0a1830, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(1.2, 2, 1.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fb6ff, 1.4);
  rim.position.set(-1.5, 1, -1.8);
  scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.6;
  controls.enablePan = false;

  // stop auto-rotation while the user drags, resume after a pause
  let resumeTimer;
  controls.addEventListener("start", () => { controls.autoRotate = false; clearTimeout(resumeTimer); });
  controls.addEventListener("end", () => { resumeTimer = setTimeout(() => (controls.autoRotate = true), 3000); });

  function resize() {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(el);
  resize();

  // Models are stored as JSON {"glb": "<base64>"} so they load on any static host,
  // including sandboxes that block data: URLs. A plain .glb also works.
  const loadModel = (onLoad, onError) => {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return url.endsWith(".glb") ? r.arrayBuffer() : r.json();
      })
      .then((d) => {
        let buf = d;
        if (!(d instanceof ArrayBuffer)) {
          const bin = atob(d.glb);
          const u8 = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          buf = u8.buffer;
        }
        new GLTFLoader().parse(buf, "", onLoad, onError);
      })
      .catch(onError);
  };

  loadModel(
    (gltf) => {
      const model = gltf.scene;
      const converted = new WeakSet();
      model.traverse((o) => {
        if (o.isMesh) {
          const c = o.material.color ? o.material.color.clone() : new THREE.Color(0xc0c8d8);
          const vc = !!o.geometry.attributes.color;
          if (vc && !converted.has(o.geometry.attributes.color)) {
            // colours were exported as sRGB bytes; three.js expects linear vertex colours.
            // Repeated parts share one colour buffer, so convert each buffer only once.
            const a = o.geometry.attributes.color, col = new THREE.Color();
            converted.add(a);
            for (let i = 0; i < a.count; i++) {
              col.setRGB(a.getX(i), a.getY(i), a.getZ(i), THREE.SRGBColorSpace);
              a.setXYZ(i, col.r, col.g, col.b);
            }
            a.needsUpdate = true;
          }
          o.material = new THREE.MeshStandardMaterial({ color: vc ? 0xffffff : c, vertexColors: vc, metalness: 0.05, roughness: 0.55, flatShading: false });
          if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        }
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);

      // soft floor disc under the model
      const r = Math.max(size.x, size.z) * 0.62;
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(r, 64),
        new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.07 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -size.y / 2 - 0.5;
      scene.add(floor);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r * 0.995, r, 96),
        new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = floor.position.y + 0.01;
      scene.add(ring);

      const dist = Math.max(size.x, size.y, size.z) * 2.1;
      camera.position.set(dist * 0.75, dist * 0.45, dist * 0.75);
      camera.near = dist / 100;
      camera.far = dist * 20;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.minDistance = dist * 0.4;
      controls.maxDistance = dist * 2.5;
      controls.update();
      loading.remove();
    },
    () => {
      loading.remove();
      renderer.domElement.remove();
      const e = document.createElement("div");
      e.className = "viewer-empty";
      e.innerHTML = el.dataset.empty || "3D model coming soon";
      el.appendChild(e);
    }
  );

  // pause rendering when the viewer is off-screen
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  })();
}

document.querySelectorAll(".viewer[data-model]").forEach(initViewer);
