import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './model-viewer.css';

interface Props {
  /** URL of the .obj model (served from /public) */
  src: string;
  label?: string;
}

/**
 * Interactive Three.js viewer for a Wavefront .obj model — drag to rotate,
 * matching the boxed ASIC viewer in the projects section. Palette-tinted
 * material + lighting; no auto-rotation (like the project ASIC).
 */
export default function ModelViewer({ src, label = 'Interactive 3D model' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // Lighting — neutral key/fill with a subtle gold rim (ASIC palette)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(1, 1.5, 1.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa6bfe6, 0.8); // sky-blue fill
    fill.position.set(-1.4, 0.4, -0.6);
    scene.add(fill);
    // Dual-colour rim lighting (gold + sky-blue) from behind for edge glow
    const rimGold = new THREE.DirectionalLight(0xffcf8c, 1.4);
    rimGold.position.set(-0.9, -0.7, -1.3);
    scene.add(rimGold);
    const rimBlue = new THREE.DirectionalLight(0xa6bfe6, 1.2);
    rimBlue.position.set(1.1, -0.4, -1.3);
    scene.add(rimBlue);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false; // avoid hijacking page scroll
    controls.rotateSpeed = 0.9;

    let model: THREE.Object3D | null = null;
    let raf = 0;
    let disposed = false;

    const material = new THREE.MeshStandardMaterial({
      color: 0xacafb5,
      metalness: 0.25,
      roughness: 0.62,
    });

    const loader = new OBJLoader();
    loader.load(
      src,
      (obj) => {
        if (disposed) return;
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = material;
          }
        });

        // 1. Scale to a consistent size.
        const size = new THREE.Box3()
          .setFromObject(obj)
          .getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        obj.scale.setScalar(2.4 / maxDim);

        // 2. Position the camera for the default 3/4 view.
        camera.position.set(2.6, 1.6, 3.2);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();

        // 3. Rotate the model 90° clockwise in screen space (about the view
        //    axis) so it sits upright, then pitch it slightly upward (about the
        //    camera's horizontal axis) for a more dynamic default angle.
        const viewAxis = new THREE.Vector3();
        camera.getWorldDirection(viewAxis);
        obj.rotateOnWorldAxis(viewAxis, Math.PI / 2);
        const rightAxis = new THREE.Vector3()
          .setFromMatrixColumn(camera.matrixWorld, 0)
          .normalize();
        obj.rotateOnWorldAxis(rightAxis, -0.28); // ~16° upward tilt

        // 4. Recenter using the final (scaled + rotated) bounding box. Doing
        //    this last keeps CAD/Fusion exports — whose origin is far from the
        //    geometry — from drifting out of frame.
        const center = new THREE.Box3()
          .setFromObject(obj)
          .getCenter(new THREE.Vector3());
        obj.position.sub(center);

        model = obj;
        scene.add(obj);
        controls.target.set(0, 0, 0);
        controls.update();

        setLoading(false);
      },
      undefined,
      () => {
        if (!disposed) {
          setFailed(true);
          setLoading(false);
        }
      },
    );

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const animate = () => {
      controls.update();
      // gentle idle drift only if motion is allowed and the user isn't dragging
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    void reduce; // reserved: no continuous animation, so reduced-motion needs nothing extra

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      material.dispose();
      if (model) {
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) mesh.geometry?.dispose();
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  return (
    <div className="model-viewer" aria-label={label} role="img">
      <div className="model-viewer-canvas" ref={mountRef} />
      {loading && !failed && (
        <span className="model-viewer-status">
          loading model
          <span className="loading-dots" aria-hidden="true" />
        </span>
      )}
      {failed && <span className="model-viewer-status">model unavailable</span>}
      {!loading && !failed && (
        <span className="model-viewer-hint" aria-hidden="true">
          drag to rotate
        </span>
      )}
    </div>
  );
}
