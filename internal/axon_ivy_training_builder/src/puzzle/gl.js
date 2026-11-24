/**
 * The puzzle's three.js stage: one WebGL canvas, a scene measured in stage pixels (x to the
 * right, y down, as on a page) and a perspective camera placed so that the plane z = 0 is
 * shown 1:1. Flat things lie on that plane; the board can tilt back and what stands on it
 * comes towards the camera (z up).
 *
 * A Node is what the game moves: x, y, z, s (scale), r (turn in the plane, radians, clockwise),
 * rx (tilt about its x axis), o (opacity: 0 hides it, and it carries over to what is in it).
 * It has the same shape as a film's actor, so the films' timeline (src/timeline.js) can play
 * it. Nothing tests depth: what has the higher `order` (its layer) lies on top, and inside a
 * layer what was made later; node.front() brings a node to the top of its layer.
 *
 *   stage.sprite(image, o)        an image painted by src/puzzle/paint.js
 *   stage.quad(color, w, h, o)    a plain rectangle (top left at the node's position)
 *   stage.tiled(image, w, h)      an image repeated over w × h (the canvas' dot grid)
 *   stage.line(o)                 a line of points with an arrow head (a connector)
 *   stage.confetti(n)             a burst of coloured dots; its p goes from 0 to 1
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture, SRGBColorSpace,
  RepeatWrapping, AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, Color
} from 'three';

const FOV = 32;

/** What lies over what on the stage: a sprite's `order`. */
export const LAYER = { bg: 0, panel: 10, grid: 20, shadow: 30, link: 40, el: 50, port: 60, mark: 70, run: 80, ui: 100, over: 200, top: 300 };

export class Node {
  constructor(props = {}) {
    this.obj = new Group();
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.s = 1;
    this.r = 0;
    this.rx = 0;
    this.o = 1;
    this.kids = [];
    this.parent = null;
    this.mats = []; // this node's own materials: [material, its opacity when the node is fully shown]
    this.owned = []; // what to free with the node
    this.binds = [];
    this.last = {};
    this.eff = -1;
    Object.assign(this, props);
    this.apply();
  }

  add(...kids) {
    for (const k of kids) {
      if (!k) continue;
      if (k.parent) k.parent.remove(k);
      k.parent = this;
      this.kids.push(k);
      this.obj.add(k.obj);
      k.eff = -1;
      k.apply();
    }
    return this;
  }

  remove(kid) {
    const i = this.kids.indexOf(kid);
    if (i >= 0) this.kids.splice(i, 1);
    this.obj.remove(kid.obj);
    kid.parent = null;
    return this;
  }

  /** Takes everything out of the node and frees it. */
  clear() {
    for (const k of [...this.kids]) k.dispose();
    return this;
  }

  /** Runs fn(value) whenever property `key` changes. */
  bind(key, fn) {
    this.binds.push([key, fn]);
    fn(this[key]);
    this.last[key] = this[key];
    return this;
  }

  set(props) {
    Object.assign(this, props);
    this.apply();
    return this;
  }

  apply() {
    const s = Math.max(1e-4, this.s);
    this.obj.position.set(this.x, -this.y, this.z);
    this.obj.scale.set(s, s, 1);
    this.obj.rotation.set(this.rx, 0, -this.r);
    const own = Math.max(0, Math.min(1, this.o));
    const eff = own * (this.parent ? Math.max(0, this.parent.eff) : 1);
    this.obj.visible = own > 0.004;
    if (eff !== this.eff) {
      this.eff = eff;
      for (const [mat, base] of this.mats) mat.opacity = eff * base;
      for (const k of this.kids) k.apply();
    }
    for (const [key, fn] of this.binds) {
      if (this[key] !== this.last[key]) {
        fn(this[key]);
        this.last[key] = this[key];
      }
    }
  }

  dispose() {
    for (const k of [...this.kids]) k.dispose();
    if (this.parent) this.parent.remove(this);
    for (const thing of this.owned) thing.dispose();
    this.owned = [];
    this.mats = [];
  }
}

export function makeStage(canvas, { dpr = 1, background = '#0f1116' } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'default' });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(new Color(background), 1);
  renderer.sortObjects = true;
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 1, 10000);
  const root = new Node();
  scene.add(root.obj);
  const plane = new PlaneGeometry(1, 1);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let order = 0;
  // what is drawn over what: by layer (o.order), and inside a layer by when it was made
  const layerOrder = layer => (layer || 0) + (++order % 90000) * 1e-5;
  let width = 1;
  let height = 1;

  const textureOf = image => {
    const tex = new CanvasTexture(image.canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = anisotropy;
    return tex;
  };

  /**
   * An image as a flat sprite. Its point ax, ay (its middle unless the image says otherwise)
   * sits at the node's position. o: order (drawn over what has a lower one), glow (adds its
   * light instead of covering), plus the node's own properties.
   */
  function sprite(image, o = {}) {
    const { order: ord, glow, ...props } = o;
    const node = new Node(props);
    const mat = new MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false });
    if (glow) mat.blending = AdditiveBlending;
    const mesh = new Mesh(plane, mat);
    mesh.renderOrder = layerOrder(ord);
    node.obj.add(mesh);
    node.mesh = mesh;
    node.mats.push([mat, 1]);
    node.owned.push(mat);
    /** Shows another image (an element in another state, a text that changed). */
    node.show = img => {
      if (node.image === img) return node;
      if (mat.map) {
        const old = mat.map;
        node.owned = node.owned.filter(t => t !== old);
        old.dispose();
      }
      mat.map = textureOf(img);
      mat.needsUpdate = true;
      node.owned.push(mat.map);
      node.image = img;
      const ax = img.ax ?? img.w / 2;
      const ay = img.ay ?? img.h / 2;
      mesh.scale.set(img.w, img.h, 1);
      mesh.position.set(img.w / 2 - ax, -(img.h / 2 - ay), 0);
      return node;
    };
    node.show(image);
    node.front = () => {
      mesh.renderOrder = layerOrder(ord);
      return node;
    };
    node.eff = -1;
    node.apply();
    return node;
  }

  /** A plain rectangle of w × h, its top left at the node's position. */
  function quad(color, w, h, o = {}) {
    const { order: ord, alpha = 1, ...props } = o;
    const node = new Node(props);
    const mat = new MeshBasicMaterial({ color: new Color(color), transparent: true, depthTest: false, depthWrite: false });
    const mesh = new Mesh(plane, mat);
    mesh.renderOrder = layerOrder(ord);
    mesh.scale.set(w, h, 1);
    mesh.position.set(w / 2, -h / 2, 0);
    node.obj.add(mesh);
    node.mats.push([mat, alpha]);
    node.owned.push(mat);
    node.eff = -1;
    node.apply();
    return node;
  }

  /** An image repeated over w × h, its top left at the node's position. */
  function tiled(image, w, h, o = {}) {
    const { order: ord, ...props } = o;
    const node = new Node(props);
    const tex = textureOf(image);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(w / image.w, h / image.h);
    tex.offset.set(0, 1 - ((h / image.h) % 1)); // the pattern starts at the top left
    const mat = new MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    const mesh = new Mesh(plane, mat);
    mesh.renderOrder = layerOrder(ord);
    mesh.scale.set(w, h, 1);
    mesh.position.set(w / 2, -h / 2, 0);
    node.obj.add(mesh);
    node.mats.push([mat, 1]);
    node.owned.push(mat, tex);
    node.eff = -1;
    node.apply();
    return node;
  }

  /**
   * A line through points, with an open arrow head at its end: a connector. node.points(pts)
   * moves it, node.color(c) recolours it. o: width, color, head (the head's size; 0: none).
   */
  function line(o = {}) {
    const { order: ord, width = 1, color = '#ffffff', head = 6.5, ...props } = o;
    const node = new Node(props);
    const mat = new MeshBasicMaterial({ color: new Color(color), transparent: true, depthTest: false, depthWrite: false });
    node.mats.push([mat, 1]);
    node.owned.push(mat);
    const myOrder = layerOrder(ord);
    const pool = [];
    const seg = i => {
      if (!pool[i]) {
        pool[i] = new Mesh(plane, mat);
        pool[i].renderOrder = myOrder;
        node.obj.add(pool[i]);
      }
      pool[i].visible = true;
      return pool[i];
    };
    const put = (mesh, ax, ay, bx, by, cap) => {
      const len = Math.hypot(bx - ax, by - ay);
      mesh.scale.set(len + cap, node.width, 1);
      mesh.position.set((ax + bx) / 2, -(ay + by) / 2, 0);
      mesh.rotation.z = -Math.atan2(by - ay, bx - ax);
    };
    node.width = width;
    node.points = pts => {
      let n = 0;
      for (let i = 1; i < pts.length; i++) put(seg(n++), pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, i < pts.length - 1 ? node.width : 0);
      if (head && pts.length > 1) {
        const end = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
        for (const side of [-0.5, 0.5]) put(seg(n++), end.x - head * Math.cos(angle + side), end.y - head * Math.sin(angle + side), end.x, end.y, 0);
      }
      for (let i = n; i < pool.length; i++) pool[i].visible = false;
      node.pts = pts;
      return node;
    };
    node.color = c => {
      mat.color.set(c);
      return node;
    };
    node.eff = -1;
    node.apply();
    return node;
  }

  /**
   * A burst of n coloured dots from the node's position: its property p goes from 0 (all in
   * the middle) to 1 (fallen and faded). image is the dot.
   */
  function confetti(image, n = 70, colors = ['#5dc36a', '#eac45a', '#7aa2ff', '#f08bb4', '#ffffff']) {
    const node = new Node({ p: 0 });
    const from = new Float32Array(n * 3);
    const tint = new Float32Array(n * 3);
    const speed = [];
    const col = new Color();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 + ((i * 7) % 5) * 0.21;
      const far = 60 + ((i * 37) % 100) * 1.5;
      speed.push([Math.cos(angle) * far, Math.sin(angle) * far - 60, 30 + ((i * 13) % 40)]);
      col.set(colors[i % colors.length]);
      tint.set([col.r, col.g, col.b], i * 3);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(from, 3));
    geo.setAttribute('color', new Float32BufferAttribute(tint, 3));
    const tex = textureOf(image);
    const mat = new PointsMaterial({ size: 9 * dpr, map: tex, vertexColors: true, transparent: true, depthTest: false, depthWrite: false, sizeAttenuation: false });
    const points = new Points(geo, mat);
    points.frustumCulled = false;
    points.renderOrder = 1e6;
    node.obj.add(points);
    node.owned.push(geo, mat, tex);
    node.bind('p', p => {
      const pos = geo.getAttribute('position');
      const ease = 1 - Math.pow(1 - p, 3);
      for (let i = 0; i < n; i++) pos.setXYZ(i, speed[i][0] * ease, -(speed[i][1] * ease + 150 * p * p), speed[i][2] * ease);
      pos.needsUpdate = true;
      mat.opacity = p <= 0 || p >= 1 ? 0 : 1 - Math.pow(p, 3);
      points.visible = mat.opacity > 0;
    });
    return node;
  }

  function resize(w, h) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    renderer.setSize(width, height, false);
    const d = height / 2 / Math.tan((FOV * Math.PI) / 360);
    camera.aspect = width / height;
    camera.near = d / 20;
    camera.far = d * 4;
    camera.position.set(width / 2, -height / 2, d);
    camera.lookAt(width / 2, -height / 2, 0);
    camera.updateProjectionMatrix();
  }

  return {
    root, sprite, quad, tiled, line, confetti, resize,
    render: () => renderer.render(scene, camera),
    get width() { return width; },
    get height() { return height; },
    dispose() {
      root.dispose();
      plane.dispose();
      renderer.dispose();
      // give the context back at once: a page may open the puzzle many times
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    }
  };
}

/** Whether this browser can draw the puzzle at all. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}
