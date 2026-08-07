/**
 * IndoorScene3D — the coker drum deck, in three dimensions.
 *
 * Lazily loaded. This is the only module in the app that pulls three.js, and it
 * resolves only when someone presses the 3D toggle.
 *
 * **Vanilla three.js, deliberately not React Three Fiber.** R3F 9.7 ships its
 * own reconciler that reads React internals through `its-fine`, and against
 * React 19.2 it threw "Invalid hook call … more than one copy of React" and
 * rendered nothing — `resolve.dedupe`, a cleared dep cache and a full reload all
 * failed to shift it. The geometry here is static and the only moving parts are
 * the camera and two bobbing entrants, so R3F's declarative syntax was buying
 * almost nothing while costing a reconciler-compatibility risk on every React
 * upgrade. One `useEffect` that builds, renders and disposes is the whole thing.
 *
 * The camera is a real one: drag to orbit, right-drag to pan, scroll to zoom.
 * It turns on its own until someone takes hold of it and not afterwards — see
 * the note on `controlled` below.
 *
 * Built from the *same* IMDF fixture the 2D plan renders, by extruding the unit
 * polygons — so the two views cannot disagree, and adding a room to the fixture
 * adds it to both. The scene is honest about what it is: authored geometry at
 * demo fidelity, not a scan or a BIM model.
 *
 * What 3D earns that the plan cannot: a confined space is a vessel you climb
 * into. Seeing the entrants *below* the deck, with the standby person above at
 * the manway, is the spatial relationship the whole permit is about.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCcw } from 'lucide-react';
import { resolveColors } from '../../lib/resolveColor';
import projector from '../../lib/geoProject';

/** Height in metres for each IMDF unit category. */
function heightOf({ restricted, category }) {
  if (restricted) return 11;      // the drum itself
  if (category === 'walkway') return 1.2;
  if (category === 'stairs') return 8;
  if (category === 'room') return 3;
  return 0.6;                     // laydown and other flat areas
}

export default function IndoorScene3D({ indoor, height = '380px' }) {
  const holder = useRef(null);
  const [paused, setPaused] = useState(false);
  // Auto-rotation is the opening move, not the only one. The first drag, zoom
  // or pan hands the camera over for good — a view that swung back to its own
  // orbit every time the pointer left could not be aimed at anything.
  const [controlled, setControlled] = useState(false);
  // Two separate holds, because they answer different questions: hovering
  // pauses the motion you are trying to read, while taking control ends the
  // orbit for good. The entrants keep bobbing either way — they are the live
  // part of the scene, not decoration.
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const controlledRef = useRef(false);
  controlledRef.current = controlled;
  const api = useRef(null);

  useEffect(() => {
    const node = holder.current;
    if (!node || !indoor) return undefined;

    const colors = resolveColors({
      bg: 'var(--color-surface-2)',
      wall: 'var(--color-surface)',
      brand: 'var(--color-brand)',
    });

    const project = projector(indoor.features);
    /**
     * lon/lat → scene metres, with north on −Z.
     *
     * The sign matters and used to be wrong. `rotateX(-90°)` lands an extruded
     * polygon's northing on −Z, but the point features were placed with their
     * northing straight onto +Z — so every fixture, opening and entrant was
     * mirrored north-to-south against the room it stood in. It read as
     * plausible because the drum is symmetric, but the standby post sat on the
     * wrong side of the manway, which is precisely the relationship this view
     * exists to show.
     */
    const xz = (lngLat) => { const [e, n] = project(lngLat); return [e, -n]; };
    const width = node.clientWidth || 800;
    const heightPx = node.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.bg);

    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, heightPx);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    node.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 2.0));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(22, 34, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    const disposables = [];

    const extent = project.extent || 20;

    // Ground pad, so the structure sits on something.
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(extent * 1.8, 48),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 1 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = -0.05;
    pad.receiveShadow = true;
    scene.add(pad);
    disposables.push(pad.geometry, pad.material);

    // Extrude each IMDF `unit` polygon to its category height.
    indoor.features
      .filter((f) => f.properties.kind === 'unit')
      .forEach((f) => {
        const ring = f.geometry.coordinates[0].slice(0, -1).map(project);
        const shape = new THREE.Shape();
        ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: heightOf(f.properties),
          bevelEnabled: false,
        });
        geo.rotateX(-Math.PI / 2);
        const restricted = f.properties.restricted;
        const mat = new THREE.MeshStandardMaterial({
          color: restricted ? 0xdc2626 : colors.wall,
          transparent: true,
          opacity: restricted ? 0.22 : 0.95,
          roughness: 0.85,
          side: THREE.DoubleSide,
          depthWrite: !restricted,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = !restricted;
        mesh.receiveShadow = true;
        scene.add(mesh);
        disposables.push(geo, mat);

        // A crisp outline, because a translucent volume needs an edge to read.
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({
          color: restricted ? 0x991b1b : 0x94a3b8,
        });
        scene.add(new THREE.LineSegments(edges, lineMat));
        disposables.push(edges, lineMat);
      });

    // Entrants sit below the deck — inside the drum. That vertical relationship
    // is the reason this view exists at all.
    const bodyGeo = new THREE.CapsuleGeometry(0.42, 1.1, 4, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: colors.brand, roughness: 0.6 });
    disposables.push(bodyGeo, bodyMat);
    const bobbers = [];
    indoor.features
      .filter((f) => f.properties.kind === 'occupant')
      .forEach((f) => {
        const [x, z] = xz(f.geometry.coordinates);
        const mesh = new THREE.Mesh(bodyGeo, bodyMat);
        mesh.position.set(x, 3.2, z);
        mesh.castShadow = true;
        scene.add(mesh);
        bobbers.push(mesh);
      });

    // Fixtures sit on the deck. The standby post being above the entrants at the
    // manway is the permit condition made visible.
    indoor.features
      .filter((f) => f.properties.kind === 'fixture' || f.properties.kind === 'opening')
      .forEach((f) => {
        const [x, z] = xz(f.geometry.coordinates);
        const state = f.properties.state;
        const color = f.properties.kind === 'opening'
          ? 0x334155
          : state === 'attention' ? 0xd97706 : state === 'breached' ? 0xb91c1c : 0x059669;
        const geo = new THREE.OctahedronGeometry(0.7);
        const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 2.4, z);
        mesh.castShadow = true;
        scene.add(mesh);
        disposables.push(geo, mat);
      });

    // The camera used to be driven straight from an angle each frame, which
    // looked right and meant the scene could not be touched. OrbitControls owns
    // it now: the same slow turn when nobody is holding it, and a real camera
    // the moment somebody is.
    const target = new THREE.Vector3(0, 3, 0);
    const openingShot = () => {
      const r = extent * 2.0;
      camera.position.set(Math.cos(0.7) * r, extent * 1.3, Math.sin(0.7) * r);
      camera.lookAt(target);
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = 1.45;        // never duck below the deck
    controls.minDistance = extent * 0.6;
    controls.maxDistance = extent * 6;
    // Matches the 0.16 rad/s the hand-rolled orbit used, so the scene keeps the
    // pace it was tuned to: OrbitControls counts in 2π/60 units per second.
    controls.autoRotateSpeed = 1.5;
    openingShot();
    controls.update();
    controls.addEventListener('start', () => setControlled(true));

    api.current = {
      reset: () => {
        setControlled(false);
        openingShot();
        controls.update();
      },
    };

    let raf = 0;
    const tick = (now) => {
      if (!pausedRef.current) {
        bobbers.forEach((b, i) => {
          b.position.y = 3.2 + Math.sin(now / 700 + i) * 0.1;
        });
      }
      controls.autoRotate = !pausedRef.current && !controlledRef.current;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      api.current = null;
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      // Releases the WebGL context rather than leaving it to the GC — the same
      // reason the site map freezes when it scrolls out of view.
      renderer.forceContextLoss?.();
      if (renderer.domElement.parentNode === node) node.removeChild(renderer.domElement);
    };
  }, [indoor]);

  return (
    <div
      style={{ height }}
      className="relative w-full rounded-xl border border-border-subtle overflow-hidden bg-surface-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={holder} className="absolute inset-0" />
      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
        <p className="text-[10px] text-text-subtle bg-surface/85 rounded px-1.5 py-0.5 border border-border-subtle pointer-events-none">
          {controlled ? 'Your view' : paused ? 'Rotation held' : 'Auto-rotating'}
          {' · '}
          drag to orbit, right-drag to pan, scroll to zoom
          {' · '}
          authored geometry, not a scan
        </p>
        {controlled && (
          <button
            type="button"
            onClick={() => api.current?.reset()}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted hover:text-brand bg-surface/85 rounded px-1.5 py-0.5 border border-border-subtle hover:border-brand/35 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset view
          </button>
        )}
      </div>
    </div>
  );
}
