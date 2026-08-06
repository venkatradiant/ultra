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
 * failed to shift it. This scene is static apart from one orbiting camera, so
 * R3F's declarative syntax was buying almost nothing while costing a
 * reconciler-compatibility risk on every React upgrade. One `useEffect` that
 * builds, renders and disposes is the whole thing.
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
import { resolveColors } from '../../lib/resolveColor';

/**
 * Project lon/lat to local metres, centred on the fixture's own bounds.
 *
 * Also returns the scene's half-extent in metres, so the camera can be placed
 * from the geometry rather than from a constant — a fixture with a second unit
 * or a bigger drum then frames itself instead of overflowing the viewport.
 */
function projector(features) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]);
      return;
    }
    c.forEach(visit);
  };
  features.forEach((f) => visit(f.geometry.coordinates));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const mPerLat = 110574;
  const mPerLon = 111320 * Math.cos((cy * Math.PI) / 180);
  const project = ([lon, lat]) => [(lon - cx) * mPerLon, (lat - cy) * mPerLat];
  project.extent = Math.max((maxX - minX) * mPerLon, (maxY - minY) * mPerLat) / 2;
  return project;
}

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
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    const node = holder.current;
    if (!node || !indoor) return undefined;

    const colors = resolveColors({
      bg: 'var(--color-surface-2)',
      wall: 'var(--color-surface)',
      brand: 'var(--color-brand)',
    });

    const project = projector(indoor.features);
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
        const [x, z] = project(f.geometry.coordinates);
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
        const [x, z] = project(f.geometry.coordinates);
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

    let raf = 0;
    let angle = 0.7;
    let last = performance.now();
    const tick = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      if (!pausedRef.current) {
        angle += delta * 0.16;
        bobbers.forEach((b, i) => {
          b.position.y = 3.2 + Math.sin(now / 700 + i) * 0.1;
        });
      }
      const r = extent * 2.0;
      camera.position.set(Math.cos(angle) * r, extent * 1.3, Math.sin(angle) * r);
      camera.lookAt(0, 3, 0);
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
      <p className="absolute bottom-2 left-3 text-[10px] text-text-subtle bg-surface/85 rounded px-1.5 py-0.5 border border-border-subtle pointer-events-none">
        {paused ? 'Rotation paused' : 'Auto-rotating'} · hover to hold · authored geometry, not a scan
      </p>
    </div>
  );
}
