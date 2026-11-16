import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Layers,
  Orbit,
  Target,
  Zap,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BESCOM_FEEDERS } from '../engine/dbscan';
import type { CriticalSite, FaultIncident, Language } from '../types/lumenops';

interface GridTwin3DProps {
  lang: Language;
  incidents: FaultIncident[];
  criticalSites: CriticalSite[];
  showAllFeeders: boolean;
  showCriticalSites: boolean;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

type CameraPreset = 'overview' | 'focus' | 'topdown';

interface HoverReadout {
  title: string;
  subtitle: string;
}

interface IncidentVisual {
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  spireMesh: THREE.Mesh;
  crystalMesh: THREE.Mesh;
  reticleMesh: THREE.Mesh;
  orbGroup: THREE.Group;
  crewVan: THREE.Group | null;
  crewStart: THREE.Vector3;
  crewTarget: THREE.Vector3;
  hasAssignedCrew: boolean;
  priority: FaultIncident['priority'];
  status: FaultIncident['status'];
}

interface EnergyLink {
  curve: THREE.CatmullRomCurve3;
  tubeMesh: THREE.Mesh;
  feederId: string;
  packetOffsets: number[];
}

// Module-level reusable math helpers (Zero GC inside animation loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scaleVec = new THREE.Vector3(1, 1, 1);
const _upVec = new THREE.Vector3(0, 1, 0);

const BLR_CENTER_LAT = 12.9716;
const BLR_CENTER_LNG = 77.5946;

/**
 * Projects lat/lng onto a balanced 3D BESCOM grid plane so core Bengaluru feeders
 * remain richly spread while regional circle substations sit cleanly on outer corridors.
 */
function projectToGrid(lat: number, lng: number): { x: number; z: number } {
  const dxRaw = (lng - BLR_CENTER_LNG) * 76;
  const dzRaw = -(lat - BLR_CENTER_LAT) * 86;
  const dist = Math.hypot(dxRaw, dzRaw);
  if (dist < 0.001) return { x: 0, z: 0 };

  // Soft radial compression beyond Bengaluru core (radius > 11)
  const mappedDist = dist <= 11 ? dist : 11 + Math.log1p(dist - 11) * 2.55;
  const scale = mappedDist / dist;
  return {
    x: dxRaw * scale,
    z: dzRaw * scale,
  };
}

function getPriorityHex(priority: FaultIncident['priority'], status: FaultIncident['status']): number {
  if (status === 'Restored') return 0x0ea5e9;
  if (priority === 'HIGH') return 0xef4444;
  if (priority === 'MEDIUM') return 0xf59e0b;
  return 0x10b981;
}

function createGridFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#071326';
    ctx.fillRect(0, 0, size, size);

    // Subtle radial gradient at city core
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      20,
      size / 2,
      size / 2,
      size * 0.48
    );
    grad.addColorStop(0, 'rgba(30, 58, 138, 0.28)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.14)');
    grad.addColorStop(1, 'rgba(6, 16, 33, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Fine coordinate grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
    ctx.lineWidth = 1;
    const step = size / 32;
    for (let i = 0; i <= 32; i++) {
      const p = i * step;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    // Concentric Bengaluru Ring Road / Bescom Circle contours
    const rings = [size * 0.13, size * 0.24, size * 0.36, size * 0.46];
    rings.forEach((r, idx) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 1 ? 'rgba(245, 158, 11, 0.22)' : 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = idx === 1 ? 2 : 1.25;
      if (idx % 2 === 1) ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.restore();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(2, 6, 23, 0.65)');
    grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.25)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Composite 7-part procedural BESCOM 66/11kV substation & transformer unit.
 * Grounded at bottom-center (Y = 0).
 */
function createSubstationGroup(
  materials: {
    concrete: THREE.MeshStandardMaterial;
    steel: THREE.MeshStandardMaterial;
    fins: THREE.MeshStandardMaterial;
    ceramic: THREE.MeshStandardMaterial;
    copper: THREE.MeshStandardMaterial;
    shadowMat: THREE.MeshBasicMaterial;
  },
  isMajorHub: boolean
): { group: THREE.Group; beaconMat: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();
  const scale = isMajorHub ? 1.18 : 0.92;

  // Soft contact shadow plane slightly above floor (Y = 0.025)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75 * scale, 1.75 * scale),
    materials.shadowMat
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.022;
  group.add(shadowPlane);

  // 1. Matte Concrete Plinth
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(1.05 * scale, 0.14, 0.85 * scale),
    materials.concrete
  );
  plinth.position.y = 0.07;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // 2. Beveled Transformer Tank Hull (ExtrudeGeometry)
  const shape = new THREE.Shape();
  const hw = 0.34 * scale;
  const hd = 0.24 * scale;
  shape.moveTo(-hw, -hd);
  shape.lineTo(hw, -hd);
  shape.lineTo(hw, hd);
  shape.lineTo(-hw, hd);
  shape.closePath();

  const tankGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42 * scale,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  tankGeo.rotateX(-Math.PI / 2);
  const tank = new THREE.Mesh(tankGeo, materials.steel);
  tank.position.y = 0.14;
  tank.castShadow = true;
  tank.receiveShadow = true;
  group.add(tank);

  // 3. Cooling Radiator Fin Banks
  for (let i = -1; i <= 1; i++) {
    const finL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * scale, 0.34 * scale, 0.06 * scale),
      materials.fins
    );
    finL.position.set(-0.41 * scale, 0.34 * scale, i * 0.14 * scale);
    finL.castShadow = true;
    group.add(finL);

    const finR = finL.clone();
    finR.position.x = 0.41 * scale;
    group.add(finR);
  }

  // 4. LatheGeometry Ceramic HV Bushing Insulators (3 phases)
  const lathePts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.045, 0.0),
    new THREE.Vector2(0.045, 0.06),
    new THREE.Vector2(0.06, 0.09),
    new THREE.Vector2(0.03, 0.12),
    new THREE.Vector2(0.055, 0.16),
    new THREE.Vector2(0.025, 0.2),
    new THREE.Vector2(0.045, 0.24),
    new THREE.Vector2(0.015, 0.29),
    new THREE.Vector2(0.0, 0.31),
  ];
  const bushingGeo = new THREE.LatheGeometry(lathePts, 12);

  for (let p = -1; p <= 1; p++) {
    const bushing = new THREE.Mesh(bushingGeo, materials.ceramic);
    bushing.position.set(p * 0.18 * scale, 0.56 * scale, 0);
    bushing.scale.setScalar(scale);
    bushing.castShadow = true;
    group.add(bushing);
  }

  // 5. Overhead Busbar Gantry Frame
  const poleGeo = new THREE.CylinderGeometry(0.025 * scale, 0.035 * scale, 0.95 * scale, 8);
  const poleL = new THREE.Mesh(poleGeo, materials.steel);
  poleL.position.set(-0.42 * scale, 0.61 * scale, -0.22 * scale);
  poleL.castShadow = true;
  group.add(poleL);

  const poleR = new THREE.Mesh(poleGeo, materials.steel);
  poleR.position.set(0.42 * scale, 0.61 * scale, -0.22 * scale);
  poleR.castShadow = true;
  group.add(poleR);

  const crossArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.98 * scale, 0.05 * scale, 0.06 * scale),
    materials.copper
  );
  crossArm.position.set(0, 1.08 * scale, -0.22 * scale);
  crossArm.castShadow = true;
  group.add(crossArm);

  // 6. Status Indicator Beacon Cap
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.2,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 12, 12), beaconMat);
  beacon.position.set(0, 1.18 * scale, -0.22 * scale);
  group.add(beacon);

  return { group, beaconMat };
}

/**
 * Composite 5-part Critical Facility architectural marker (Hospital / Water / Metro).
 */
function createCriticalLandmarkGroup(
  site: CriticalSite,
  shadowMat: THREE.MeshBasicMaterial
): THREE.Group {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.024;
  group.add(shadow);

  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.15,
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.1, 16), plinthMat);
  plinth.position.y = 0.05;
  group.add(plinth);

  if (site.type === 'Hospital nearby') {
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.1,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });

    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.58, 0.42), wingMat);
    tower.position.y = 0.39;
    tower.castShadow = true;
    group.add(tower);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), plinthMat);
    pad.position.y = 0.7;
    group.add(pad);

    // 3D Medical Cross emblem
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.07), accentMat);
    crossV.position.y = 0.92;
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.07), accentMat);
    crossH.position.y = 0.92;
    group.add(crossV, crossH);
  } else if (site.type === 'Water pumping') {
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.35,
      metalness: 0.55,
    });
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8,
    });

    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.52, 18), tankMat);
    cylinder.position.y = 0.36;
    cylinder.castShadow = true;
    group.add(cylinder);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      pipeMat
    );
    dome.position.y = 0.62;
    group.add(dome);

    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.32, 0.48, 0),
      new THREE.Vector3(0.46, 0.44, 0),
      new THREE.Vector3(0.46, 0.12, 0),
    ]);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 12, 0.045, 8, false), pipeMat);
    group.add(pipe);
  } else {
    // Public transit / Metro
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.65,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.75,
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.36), railMat);
    deck.position.y = 0.32;
    deck.castShadow = true;
    group.add(deck);

    const pierL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.24), plinthMat);
    pierL.position.set(-0.22, 0.16, 0);
    const pierR = pierL.clone();
    pierR.position.x = 0.22;
    group.add(pierL, pierR);

    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.045, 8, 16, Math.PI),
      canopyMat
    );
    arch.position.set(0, 0.38, 0);
    group.add(arch);
  }

  return group;
}

/**
 * Composite 7-part BESCOM Rapid Response Crew Utility Truck.
 */
function createCrewVanGroup(): THREE.Group {
  const van = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.75,
    metalness: 0.4,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.3,
    metalness: 0.25,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.85,
  });
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  // 1. Chassis frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.92), chassisMat);
  chassis.position.y = 0.12;
  van.add(chassis);

  // 2. Utility cargo box
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.3, 0.58), bodyMat);
  cargo.position.set(0, 0.31, -0.14);
  cargo.castShadow = true;
  van.add(cargo);

  // 3. Cab + Glass Windshield
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.28), bodyMat);
  cab.position.set(0, 0.28, 0.29);
  cab.castShadow = true;
  van.add(cab);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.04), glassMat);
  windshield.position.set(0, 0.32, 0.43);
  van.add(windshield);

  // 4. Rooftop Ladder Rack
  const rack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.56), chassisMat);
  rack.position.set(0, 0.48, -0.12);
  van.add(rack);

  // 5. Amber Emergency Lightbar
  const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.08), beaconMat);
  lightbar.position.set(0, 0.43, 0.28);
  van.add(lightbar);

  // 6-9. 4 Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions: Array<[number, number, number]> = [
    [-0.24, 0.1, 0.26],
    [0.24, 0.1, 0.26],
    [-0.24, 0.1, -0.28],
    [0.24, 0.1, -0.28],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wheelGeo, chassisMat);
    w.position.set(wx, wy, wz);
    van.add(w);
  });

  van.scale.setScalar(0.95);
  return van;
}

export default function GridTwin3D({
  lang,
  incidents,
  criticalSites,
  showAllFeeders,
  showCriticalSites,
  selectedIncidentId,
  onSelectIncident,
}: GridTwin3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [preset, setPreset] = useState<CameraPreset>('overview');
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [energyFlow, setEnergyFlow] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [hoverReadout, setHoverReadout] = useState<HoverReadout | null>(null);

  // Mutable refs so scene loop accesses latest props/settings without tearing down WebGL
  const incidentsRef = useRef(incidents);
  incidentsRef.current = incidents;

  const selectedIdRef = useRef(selectedIncidentId);
  selectedIdRef.current = selectedIncidentId;

  const onSelectIncidentRef = useRef(onSelectIncident);
  onSelectIncidentRef.current = onSelectIncident;

  const showFeedersRef = useRef(showAllFeeders);
  showFeedersRef.current = showAllFeeders;

  const showCriticalRef = useRef(showCriticalSites);
  showCriticalRef.current = showCriticalSites;

  const autoOrbitRef = useRef(autoOrbit);
  autoOrbitRef.current = autoOrbit;

  const energyFlowRef = useRef(energyFlow);
  energyFlowRef.current = energyFlow;

  const explodeTargetRef = useRef(explodeFactor);
  explodeTargetRef.current = explodeFactor;

  const presetTriggerRef = useRef<{ preset: CameraPreset; version: number }>({
    preset: 'overview',
    version: 0,
  });

  const syncIncidentsRef = useRef<(() => void) | null>(null);
  const syncVisibilityRef = useRef<(() => void) | null>(null);

  // Sync dynamic incidents whenever React state changes
  useEffect(() => {
    syncIncidentsRef.current?.();
  }, [incidents, selectedIncidentId]);

  useEffect(() => {
    syncVisibilityRef.current?.();
  }, [showAllFeeders, showCriticalSites]);

  // Keyboard shortcut 'H' to toggle Cinema/Zen bottom dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const triggerPreset = (nextPreset: CameraPreset) => {
    setPreset(nextPreset);
    presetTriggerRef.current = {
      preset: nextPreset,
      version: presetTriggerRef.current.version + 1,
    };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL probe (affects cost settings only — identical scene/layout/logic)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) ?? '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x061021;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.0155);

    // Mandatory studio environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 180);
    camera.position.set(16, 17.5, 22);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 48;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.target.set(0, 0.4, 0);

    // Cancel camera preset flight immediately if user drags/zooms manually
    let activePresetTransition = false;
    let lastHandledPresetVersion = 0;
    const onControlsStart = () => {
      activePresetTransition = false;
    };
    controls.addEventListener('start', onControlsStart);

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4d6, 1.55);
    keyLight.position.set(18, 28, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 75;
    const d = 24;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-18, 14, -20);
    scene.add(rimLight);

    // Layer Groups for architectural Explode Layers slider
    const terrainLayer = new THREE.Group();
    const substationLayer = new THREE.Group();
    const corridorLayer = new THREE.Group();
    const incidentLayer = new THREE.Group();
    const criticalLayer = new THREE.Group();
    scene.add(terrainLayer, substationLayer, corridorLayer, incidentLayer, criticalLayer);

    // Procedural Topographic Base Plane
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const floorTex = createGridFloorTexture(maxAniso);
    const contactTex = createContactShadowTexture();

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.18,
    });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(54, 44), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    terrainLayer.add(floorMesh);

    // Subtle elevated Bengaluru Outer Ring Road architectural ring
    const ringGeo = new THREE.RingGeometry(10.8, 11.15, 72);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x92400e,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const orrRing = new THREE.Mesh(ringGeo, ringMat);
    orrRing.rotation.x = -Math.PI / 2;
    orrRing.position.y = 0.02;
    terrainLayer.add(orrRing);

    // Shared Substation Materials (roughness delta >= 0.25 between matte concrete/ceramic & steel)
    const sharedSubMats = {
      concrete: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92, metalness: 0.05 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.42, metalness: 0.78 }),
      fins: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.65 }),
      ceramic: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.16, metalness: 0.08 }),
      copper: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.88 }),
      shadowMat: new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      }),
    };

    // Clickable Raycast Targets (Layer 1)
    const clickableMeshes: THREE.Object3D[] = [];
    const feederPositions = new Map<string, THREE.Vector3>();
    const feederBeacons = new Map<string, THREE.MeshStandardMaterial>();

    BESCOM_FEEDERS.forEach((feeder) => {
      const { x, z } = projectToGrid(feeder.lat, feeder.lng);
      feederPositions.set(feeder.feederId, new THREE.Vector3(x, 0, z));

      const isRegional = feeder.circle === 'Regional Circles';
      const { group, beaconMat } = createSubstationGroup(sharedSubMats, isRegional);
      group.position.set(x, 0, z);
      substationLayer.add(group);
      feederBeacons.set(feeder.feederId, beaconMat);

      // Invisible simplified raycast hit box on layer 1
      const hitProxy = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.8, 1.3),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitProxy.position.set(x, 0.9, z);
      hitProxy.layers.enable(1);
      hitProxy.userData = {
        type: 'feeder',
        feederId: feeder.feederId,
        title: `${feeder.area} (${feeder.feederId})`,
        subtitle: `${feeder.substation} · ${feeder.connectedConsumers.toLocaleString()} consumers`,
      };
      substationLayer.add(hitProxy);
      clickableMeshes.push(hitProxy);
    });

    // Critical Facilities (8 landmarks)
    criticalSites.forEach((site) => {
      const { x, z } = projectToGrid(site.lat, site.lng);
      const landmark = createCriticalLandmarkGroup(site, sharedSubMats.shadowMat);
      // Offset slightly from parent substation so both are crisp
      landmark.position.set(x + 0.65, 0, z + 0.55);
      criticalLayer.add(landmark);

      const hitProxy = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.2, 1.0),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitProxy.position.set(x + 0.65, 0.6, z + 0.55);
      hitProxy.layers.enable(1);
      hitProxy.userData = {
        type: 'critical',
        feederId: site.feederId,
        title: site.name,
        subtitle: `${site.type} · ${site.feederId}`,
      };
      criticalLayer.add(hitProxy);
      clickableMeshes.push(hitProxy);
    });

    // Curved 11kV Transmission Corridors connecting central hub & feeder neighbors
    const energyLinks: EnergyLink[] = [];
    const centralHubPos = feederPositions.get('FDR-SHV-01') ?? new THREE.Vector3(0, 0, 0);

    BESCOM_FEEDERS.forEach((feeder, idx) => {
      const targetPos = feederPositions.get(feeder.feederId);
      if (!targetPos || feeder.feederId === 'FDR-SHV-01') return;

      // Connect radial spokes to central UG substation & neighbor ring links
      const midX = (centralHubPos.x + targetPos.x) * 0.5;
      const midZ = (centralHubPos.z + targetPos.z) * 0.5;
      const archHeight = 0.45 + (idx % 3) * 0.14;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(centralHubPos.x, 0.25, centralHubPos.z),
        new THREE.Vector3(midX, archHeight, midZ),
        new THREE.Vector3(targetPos.x, 0.25, targetPos.z),
      ]);

      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.036, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.5,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      corridorLayer.add(tubeMesh);

      energyLinks.push({
        curve,
        tubeMesh,
        feederId: feeder.feederId,
        packetOffsets: [(idx * 0.17) % 1, (idx * 0.17 + 0.5) % 1],
      });
    });

    // InstancedMesh for animated energy pulse packets traveling along grid lines
    const totalPackets = energyLinks.length * 2;
    const packetGeo = new THREE.SphereGeometry(0.085, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, totalPackets);
    packetInstanced.frustumCulled = false;
    corridorLayer.add(packetInstanced);

    // Dynamic Incident Visuals Management
    const incidentVisuals = new Map<string, IncidentVisual>();
    const incidentHitProxies: THREE.Object3D[] = [];

    const clearIncidentLayer = () => {
      incidentVisuals.forEach((vis) => {
        vis.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        incidentLayer.remove(vis.group);
      });
      incidentVisuals.clear();
      incidentHitProxies.length = 0;
    };

    const rebuildIncidents = () => {
      clearIncidentLayer();

      const currentIncidents = incidentsRef.current;
      const activeSelectedId = selectedIdRef.current;
      const incidentByFeeder = new Map<string, FaultIncident>();
      currentIncidents.forEach((inc) => {
        incidentByFeeder.set(inc.feederId, inc);
      });

      // Update feeder beacons & transmission line colors based on incident status
      BESCOM_FEEDERS.forEach((feeder) => {
        const inc = incidentByFeeder.get(feeder.feederId);
        const beacon = feederBeacons.get(feeder.feederId);
        if (beacon) {
          if (!inc || inc.status === 'Restored') {
            beacon.color.setHex(0x38bdf8);
            beacon.emissive.setHex(0x0284c7);
            beacon.emissiveIntensity = 0.7;
          } else {
            const hex = getPriorityHex(inc.priority, inc.status);
            beacon.color.setHex(hex);
            beacon.emissive.setHex(hex);
            beacon.emissiveIntensity = 1.4;
          }
        }
      });

      energyLinks.forEach((link) => {
        const inc = incidentByFeeder.get(link.feederId);
        const mat = link.tubeMesh.material as THREE.MeshStandardMaterial;
        if (inc && inc.status !== 'Restored') {
          const hex = getPriorityHex(inc.priority, inc.status);
          mat.color.setHex(hex);
          mat.emissive.setHex(hex);
          mat.emissiveIntensity = 0.65;
        } else {
          mat.color.setHex(0x0284c7);
          mat.emissive.setHex(0x0369a1);
          mat.emissiveIntensity = 0.45;
        }
      });

      // Create 3D multi-part outage beacons + DBSCAN rings + crew vans
      currentIncidents.forEach((inc) => {
        const { x, z } = projectToGrid(inc.lat, inc.lng);
        const hex = getPriorityHex(inc.priority, inc.status);
        const isSelected = inc.id === activeSelectedId;
        const heightScale = THREE.MathUtils.clamp(1.2 + inc.score.totalScore / 34, 1.4, 4.4);

        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // 1. Ground DBSCAN 1.2 km cluster radius disc + outer perimeter ring
        const discMat = new THREE.MeshBasicMaterial({
          color: hex,
          transparent: true,
          opacity: inc.status === 'Restored' ? 0.12 : 0.22,
          side: THREE.DoubleSide,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        });
        const discMesh = new THREE.Mesh(new THREE.CircleGeometry(1.35, 32), discMat);
        discMesh.rotation.x = -Math.PI / 2;
        discMesh.position.y = 0.03;
        group.add(discMesh);

        const ringMat = new THREE.MeshBasicMaterial({
          color: hex,
          transparent: true,
          opacity: isSelected ? 0.95 : 0.65,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.26, 1.4, 36), ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.035;
        group.add(ringMesh);

        // 2. Vertical holographic priority spire
        const spireMat = new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: inc.status === 'Restored' ? 0.3 : 0.9,
          transparent: true,
          opacity: inc.status === 'Restored' ? 0.45 : 0.72,
          roughness: 0.2,
          metalness: 0.3,
        });
        const spireMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.18, heightScale, 12),
          spireMat
        );
        spireMesh.position.y = heightScale * 0.5 + 0.04;
        group.add(spireMesh);

        // 3. Rotating faceted priority crystal apex
        const crystalMat = new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: 1.15,
          roughness: 0.15,
          metalness: 0.6,
        });
        const crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), crystalMat);
        crystalMesh.position.y = heightScale + 0.42;
        group.add(crystalMesh);

        // 4. Selection reticle ring
        const reticleMat = new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          transparent: true,
          opacity: isSelected ? 0.95 : 0.0,
          side: THREE.DoubleSide,
        });
        const reticleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 8, 28), reticleMat);
        reticleMesh.rotation.x = Math.PI / 2;
        reticleMesh.position.y = heightScale + 0.42;
        group.add(reticleMesh);

        // 5. Orbiting duplicate citizen complaint nodes (up to 12)
        const orbGroup = new THREE.Group();
        orbGroup.position.y = 0.45;
        const orbCount = Math.min(12, Math.max(1, inc.reportCount));
        const orbGeo = new THREE.SphereGeometry(0.085, 8, 8);
        const orbMat = new THREE.MeshStandardMaterial({
          color: 0xfef3c7,
          emissive: hex,
          emissiveIntensity: 0.7,
          roughness: 0.3,
        });
        for (let k = 0; k < orbCount; k++) {
          const angle = (k / orbCount) * Math.PI * 2;
          const r = 0.78 + (k % 2) * 0.22;
          const orb = new THREE.Mesh(orbGeo, orbMat);
          orb.position.set(Math.cos(angle) * r, (k % 3) * 0.14, Math.sin(angle) * r);
          orbGroup.add(orb);
        }
        group.add(orbGroup);

        // 6. Dispatched Crew Van (if assigned)
        let crewVan: THREE.Group | null = null;
        const crewStart = new THREE.Vector3(
          centralHubPos.x * 0.4,
          0.02,
          centralHubPos.z * 0.4
        );
        const crewTarget = new THREE.Vector3(0, 0.02, 0.85);
        if (inc.status === 'Crew assigned') {
          crewVan = createCrewVanGroup();
          crewVan.position.copy(crewTarget);
          group.add(crewVan);
        }

        // 7. Invisible hit cylinder for raycasting
        const hitProxy = new THREE.Mesh(
          new THREE.CylinderGeometry(1.1, 1.1, heightScale + 1.0, 10),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        hitProxy.position.y = (heightScale + 1.0) * 0.5;
        hitProxy.layers.enable(1);
        hitProxy.userData = {
          type: 'incident',
          incidentId: inc.id,
          feederId: inc.feederId,
          title: `Incident ${inc.label} — ${inc.area}`,
          subtitle: `${inc.priority} · ${inc.reportCount} merged reports · Score ${inc.score.totalScore.toFixed(1)}`,
        };
        group.add(hitProxy);
        incidentHitProxies.push(hitProxy);

        incidentLayer.add(group);
        incidentVisuals.set(inc.id, {
          group,
          ringMesh,
          spireMesh,
          crystalMesh,
          reticleMesh,
          orbGroup,
          crewVan,
          crewStart,
          crewTarget,
          hasAssignedCrew: inc.status === 'Crew assigned',
          priority: inc.priority,
          status: inc.status,
        });
      });
    };

    syncIncidentsRef.current = rebuildIncidents;
    rebuildIncidents();

    const syncVisibility = () => {
      substationLayer.visible = showFeedersRef.current;
      criticalLayer.visible = showCriticalRef.current;
    };
    syncVisibilityRef.current = syncVisibility;
    syncVisibility();

    // Pre-warm shaders on GPU devices
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster & throttled pointer interaction
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let lastMoveCheck = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const getHit = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      const targets = [...incidentHitProxies, ...clickableMeshes];
      const hits = raycaster.intersectObjects(targets, false);
      return hits[0]?.object ?? null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveCheck < 50) return;
      lastMoveCheck = now;

      updatePointer(e);
      const hit = getHit();
      if (hit) {
        renderer.domElement.style.cursor = 'pointer';
        setHoverReadout({
          title: String(hit.userData.title ?? ''),
          subtitle: String(hit.userData.subtitle ?? ''),
        });
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoverReadout((prev) => (prev ? null : prev));
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moved > 6) return; // Dragged camera, not a click

      updatePointer(e);
      const hit = getHit();
      if (!hit) return;

      const userData = hit.userData;
      if (userData.type === 'incident' && typeof userData.incidentId === 'string') {
        onSelectIncidentRef.current(userData.incidentId);
        triggerPreset('focus');
      } else if (typeof userData.feederId === 'string') {
        const match = incidentsRef.current.find((i) => i.feederId === userData.feederId);
        if (match) {
          onSelectIncidentRef.current(match.id);
          triggerPreset('focus');
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // WebGL context loss safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // ResizeObserver for crisp responsive sizing
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation loop with software WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let currentExplode = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // 1. Handle smooth camera preset flights (using THREE.MathUtils.damp)
      if (presetTriggerRef.current.version !== lastHandledPresetVersion) {
        lastHandledPresetVersion = presetTriggerRef.current.version;
        const p = presetTriggerRef.current.preset;
        activePresetTransition = true;
        if (p === 'overview') {
          _targetCamPos.set(16, 17.5, 22);
          _targetLookAt.set(0, 0.4, 0);
        } else if (p === 'topdown') {
          _targetCamPos.set(0.01, 31, 0.01);
          _targetLookAt.set(0, 0, 0);
        } else {
          const sel =
            incidentsRef.current.find((i) => i.id === selectedIdRef.current) ??
            incidentsRef.current[0];
          if (sel) {
            const pt = projectToGrid(sel.lat, sel.lng);
            _targetLookAt.set(pt.x, 1.2, pt.z);
            _targetCamPos.set(pt.x + 6.5, 6.2, pt.z + 7.5);
          } else {
            _targetCamPos.set(16, 17.5, 22);
            _targetLookAt.set(0, 0.4, 0);
          }
        }
      }

      if (activePresetTransition) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.5, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 5.5, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 5.5, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 5.5, delta);

        if (camera.position.distanceTo(_targetCamPos) < 0.08) {
          activePresetTransition = false;
        }
      }

      controls.autoRotate = !isSoftwareGl && autoOrbitRef.current;
      controls.autoRotateSpeed = 0.9;
      controls.update();

      // 2. Explode architectural grid layers smoothly via exponential damping
      currentExplode = THREE.MathUtils.damp(currentExplode, explodeTargetRef.current, 6.5, delta);
      corridorLayer.position.y = currentExplode * 1.4;
      substationLayer.position.y = currentExplode * 0.4;
      criticalLayer.position.y = currentExplode * 0.4;
      incidentLayer.position.y = currentExplode * 2.5;

      // 3. Animate Outage Clusters, Crystals, Orbiting Duplicate Nodes & Crew Vans
      incidentVisuals.forEach((vis, id) => {
        const isSelected = id === selectedIdRef.current;
        vis.crystalMesh.rotation.y += delta * (isSelected ? 1.8 : 0.9);
        vis.crystalMesh.position.y += Math.sin(elapsed * 2.4) * 0.0025;
        vis.orbGroup.rotation.y += delta * 0.65;

        const retMat = vis.reticleMesh.material as THREE.MeshBasicMaterial;
        retMat.opacity = isSelected ? 0.92 : 0;
        if (isSelected) {
          vis.reticleMesh.rotation.z -= delta * 1.5;
        }

        // Expanding radar pulse ring for active non-restored faults
        if (vis.status !== 'Restored') {
          const wave = 1 + ((elapsed * 0.55) % 1) * 0.35;
          vis.ringMesh.scale.set(wave, wave, 1);
          const rMat = vis.ringMesh.material as THREE.MeshBasicMaterial;
          rMat.opacity = (1 - ((elapsed * 0.55) % 1)) * (isSelected ? 0.85 : 0.5);
        }

        // Smooth crew van shuttle patrol near fault zone when assigned
        if (vis.crewVan && vis.hasAssignedCrew) {
          const patrolAngle = elapsed * 0.9;
          vis.crewVan.position.set(
            Math.cos(patrolAngle) * 1.05,
            0.02,
            Math.sin(patrolAngle) * 1.05
          );
          vis.crewVan.rotation.y = -patrolAngle;
        }
      });

      // 4. Animate InstancedMesh power flow packets along transmission curves
      let instanceIdx = 0;
      const showFlow = energyFlowRef.current;
      for (let i = 0; i < energyLinks.length; i++) {
        const link = energyLinks[i];
        for (let p = 0; p < link.packetOffsets.length; p++) {
          if (!showFlow) {
            _scaleVec.set(0, 0, 0);
            _mat4.compose(_vec3A.set(0, -10, 0), _quat, _scaleVec);
          } else {
            const t = (link.packetOffsets[p] + elapsed * 0.24) % 1;
            link.curve.getPointAt(t, _vec3A);
            link.curve.getTangentAt(t, _vec3B);
            _vec3C.copy(_vec3A).add(_vec3B);
            _quat.setFromUnitVectors(_upVec, _vec3B.normalize());
            _scaleVec.set(1, 1, 1);
            _mat4.compose(_vec3A, _quat, _scaleVec);
          }
          packetInstanced.setMatrixAt(instanceIdx++, _mat4);
        }
      }
      packetInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      clearIncidentLayer();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      floorTex.dispose();
      contactTex.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [criticalSites]);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) ?? incidents[0] ?? null;

  const selectedFeederMeta = selectedIncident
    ? BESCOM_FEEDERS.find((f) => f.feederId === selectedIncident.feederId)
    : undefined;

  const selectedAreaDisplay =
    selectedIncident && lang === 'kn' && selectedFeederMeta
      ? selectedFeederMeta.areaKn
      : selectedIncident?.area;

  return (
    <div className="relative w-full h-[440px] sm:h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-[#061021] select-none">
      {/* Isolated WebGL Mount Container (never shares React children with HUD) */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top-Left Minimal Semantic Readout (solid rgba, zero backdrop-blur, zero pulsing dots) */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 max-w-[85%] sm:max-w-md space-y-1.5">
        <div className="rounded-lg bg-[#08152B]/90 border border-slate-700/80 px-3 py-2 text-xs text-white shadow-lg">
          <p className="font-display font-bold text-amber-400">
            {lang === 'kn'
              ? '3D ಬೆಸ್ಕಾಂ ಗ್ರಿಡ್ ಡಿಜಿಟಲ್ ಟ್ವಿನ್'
              : '3D BESCOM Grid Digital Twin'}
          </p>
          {selectedIncident && (
            <p className="text-[11px] text-slate-200 mt-0.5 truncate tabular-nums">
              Incident {selectedIncident.label} · {selectedAreaDisplay} ·{' '}
              {selectedIncident.reportCount} {lang === 'kn' ? 'ದೂರುಗಳು' : 'reports'} · Score{' '}
              {selectedIncident.score.totalScore.toFixed(1)}
            </p>
          )}
        </div>

        {hoverReadout && (
          <div className="rounded-lg bg-slate-950/92 border border-amber-400/50 px-3 py-1.5 text-[11px] text-white shadow-md">
            <p className="font-semibold text-amber-300">{hoverReadout.title}</p>
            <p className="text-slate-300">{hoverReadout.subtitle}</p>
          </div>
        )}
      </div>

      {/* WebGL Context Lost Graceful Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#061021] text-white p-6 text-center space-y-2">
          <p className="font-display text-base font-bold text-amber-400">
            3D WebGL Context Paused
          </p>
          <p className="text-xs text-slate-300 max-w-sm">
            Switch to 2D GIS Map or reload the viewport to restore hardware acceleration.
          </p>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Mid-Screen Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[94%] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg rounded-b-sm bg-[#08152B]/95 border border-slate-700 text-[11px] font-semibold text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'kn' ? 'ನಿಯಂತ್ರಣ ತೋರಿಸಿ (H)' : 'Show 3D Controls (H)'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'kn' ? 'ನಿಯಂತ್ರಣ ಅಡಗಿಸಿ (H)' : 'Hide Controls (H)'}</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="rounded-xl bg-[#08152B]/94 border border-slate-700/90 px-3 py-2 shadow-xl flex flex-wrap items-center justify-center gap-2 text-xs text-white">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/70">
              <button
                type="button"
                onClick={() => triggerPreset('overview')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  preset === 'overview'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3 h-3" aria-hidden="true" />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => triggerPreset('focus')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  preset === 'focus'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Target className="w-3 h-3" aria-hidden="true" />
                <span>Focus Selected</span>
              </button>
              <button
                type="button"
                onClick={() => triggerPreset('topdown')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  preset === 'topdown'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" aria-hidden="true" />
                <span>Top-Down</span>
              </button>
            </div>

            {/* Auto-Orbit + Energy Flow Toggles */}
            <button
              type="button"
              onClick={() => setAutoOrbit((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                autoOrbit
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/60'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Orbit className="w-3 h-3" aria-hidden="true" />
              <span>Auto-Orbit</span>
            </button>

            <button
              type="button"
              onClick={() => setEnergyFlow((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                energyFlow
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" aria-hidden="true" />
              <span>Energy Flow</span>
            </button>

            {/* Exploded Architecture Slider */}
            <label className="inline-flex items-center gap-2 px-2 py-1 bg-slate-900/90 border border-slate-700 rounded-lg text-[11px] text-slate-200 whitespace-nowrap">
              <Layers className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span>Explode</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(Number(e.target.value))}
                aria-label="Explode 3D grid layers"
                className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
