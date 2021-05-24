/* eslint-disable no-var, no-unused-vars, new-cap, no-useless-return */
import * as THREE from 'three'
import { TreeMaterial } from './treeMaterial'
import { Tree } from './tree'
import { PathSimplification } from './pathSimplification'

function createBranchGeometry (pts, sides) {
  const geometry = new THREE.BufferGeometry()

  const vectors = computeVectors(pts)

  const vertices = computeVertices(pts, vectors.vas, vectors.vbs, sides)
  const ids = computeIds(vertices.positions, sides)
  const uvs = computeUvs(vertices.positions, sides)
  const levels = getLevels(pts, sides)

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices.positions, 3)
  )
  geometry.setAttribute(
    'center',
    new THREE.BufferAttribute(vertices.centers, 3)
  )
  geometry.setAttribute('level', new THREE.BufferAttribute(levels, 1))
  geometry.setAttribute('index', new THREE.BufferAttribute(ids, 1))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  geometry.computeFaceNormals()
  geometry.computeVertexNormals()
  return {
    geom: geometry,
    vectors: vectors
  }
}

function computeVectors (pts) {
  const n = pts.length
  const tans = []
  const vas = []
  const vbs = []
  const v0 = norm(sub(pts[1], pts[0]))
  tans[0] = v0
  vas[0] = norm(perp(v0))
  vbs[0] = norm(cross(v0, vas[0]))
  for (var i = 1; i < n - 1; i++) {
    const p0 = pts[i - 1]
    // const p1 = pts[i]
    const p2 = pts[i + 1]

    const tan = norm(sub(p2, p0))
    tans[i] = tan
    vas[i] = neg(norm(cross(tan, vbs[i - 1])))
    vbs[i] = norm(cross(tan, vas[i]))
  }
  const vn = norm(sub(pts[n - 1], pts[n - 2]))
  tans[n - 1] = vn
  vas[n - 1] = neg(norm(cross(vn, vbs[n - 2])))
  vbs[n - 1] = norm(cross(vn, vas[i]))
  return {
    tans: tans,
    vas: vas,
    vbs: vbs
  }
}

function computeVertices (pts, vas, vbs, sides) {
  const n = pts.length
  const positions = new Float32Array(n * sides * 3)
  const centers = new Float32Array(n * sides * 3)
  const angRatio = (2 * Math.PI) / sides
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const va = vas[i]
    const vb = vbs[i]
    const pid = i * sides * 3
    for (let j = 0; j < sides; j++) {
      const ang = j * angRatio
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      const vid = pid + 3 * j
      positions[vid] = p.x + p.radius * va.x * ca + p.radius * vb.x * sa
      positions[vid + 1] = p.y + p.radius * va.y * ca + p.radius * vb.y * sa
      positions[vid + 2] = p.z + p.radius * va.z * ca + p.radius * vb.z * sa
      centers[vid] = p.x
      centers[vid + 1] = p.y
      centers[vid + 2] = p.z
    }
  }
  return {
    positions: positions,
    centers: centers
  }
}

function computeIds (vertices, sides) {
  const n = vertices.length / 3
  const ids = new Uint16Array((n - 1) * 6)
  for (let i = 0; i < n - sides; i++) {
    const id = 6 * i
    const nextId = (i + 1) % sides === 0 ? i - (sides - 1) : i + 1

    ids[id] = i
    ids[id + 1] = nextId + sides
    ids[id + 2] = nextId

    ids[id + 3] = i
    ids[id + 4] = i + sides
    ids[id + 5] = nextId + sides
  }
  return ids
}

function computeUvs (vertices, sides) {
  const n = vertices.length / 3
  const uvs = new Float32Array(2 * n)
  const nLevels = n / (sides + 1)
  for (let i = 0; i < n; i++) {
    uvs[2 * i] = (i % sides) / sides
    uvs[2 * i + 1] = i / sides / nLevels
  }
  return uvs
}

function getLevels (pts, sides) {
  const nPts = pts.length
  const levels = new Float32Array(sides * nPts)
  for (let i = 0; i < nPts; i++) {
    const p = pts[i]
    for (let j = 0; j < sides; j++) {
      levels[sides * i + j] = p.level
    }
  }
  return levels
}

// v3

function v3 (x, y, z, o) {
  o = o || {}
  o.x = x
  o.y = y
  o.z = z
  return o
}

function len (v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function norm (v, o) {
  o = o || {}
  const r = 1 / len(v)
  o.x = v.x * r
  o.y = v.y * r
  o.z = v.z * r
  return o
}

function add (v1, v2, o) {
  o = o || {}
  o.x = v1.x + v2.x
  o.y = v1.y + v2.y
  o.z = v1.z + v2.z
  return o
}

function sub (v1, v2, o) {
  o = o || {}
  o.x = v1.x - v2.x
  o.y = v1.y - v2.y
  o.z = v1.z - v2.z
  return o
}

function cross (v1, v2, o) {
  o = o || {}
  o.x = v1.y * v2.z - v1.z * v2.y
  o.y = v1.z * v2.x - v1.x * v2.z
  o.z = v1.x * v2.y - v1.y * v2.x
  return o
}

// renvoie un vecteur normal au vecteur donne
function perp (v, o) {
  o = o || {}
  if (v.x === 0) {
    o.x = 1
    o.y = o.z = 0
  } else {
    o.x = -(v.y + v.z) / v.x
    o.y = o.z = 1
  }
  return o
}

function arr (v) {
  return [v.x, v.y, v.z]
}

function scale (v, s, o) {
  o = o || {}
  o.x = v.x * s
  o.y = v.y * s
  o.z = v.z * s
  return o
}

function neg (v, o) {
  o = o || {}
  return scale(v, -1, o)
}

function mergeGeometries (geometries) {
  function getBufferLength (bufferName) {
    return geometries.reduce(function (n, geom) {
      return n + geom.attributes[bufferName].array.length
    }, 0)
  }

  function mergeBuffer (bufferName, bufferType, itemSize) {
    const outBuffer = new bufferType(getBufferLength(bufferName))
    geometries.reduce(
      function (outBuffer, geom) {
        const buffer = geom.attributes[bufferName].array
        const n = buffer.length
        for (let i = 0; i < n; i++) {
          outBuffer.buffer[outBuffer.indexBegin + i] = buffer[i]
        }
        outBuffer.indexBegin += n
        return outBuffer
      },
      {
        indexBegin: 0,
        buffer: outBuffer
      }
    )
    geometry.setAttribute(
      bufferName,
      new THREE.BufferAttribute(outBuffer, itemSize)
    )
  }

  function mergeIds () {
    const outBuffer = new Uint32Array(getBufferLength('index'))
    geometries.reduce(
      function (outBuffer, geom) {
        const buffer = geom.attributes.index.array
        const n = buffer.length
        for (let i = 0; i < n; i++) {
          outBuffer.buffer[outBuffer.indexBegin + i] =
            outBuffer.positionBegin + buffer[i]
        }
        outBuffer.indexBegin += n
        outBuffer.positionBegin += geom.attributes.position.array.length / 3
        return outBuffer
      },
      {
        indexBegin: 0,
        positionBegin: 0,
        buffer: outBuffer
      }
    )
    geometry.setIndex(new THREE.BufferAttribute(outBuffer, 1))
  }

  var geometry = new THREE.BufferGeometry()
  mergeBuffer('position', Float32Array, 3)
  mergeBuffer('center', Float32Array, 3)
  mergeBuffer('level', Float32Array, 1)
  mergeIds()
  mergeBuffer('uv', Float32Array, 2)
  mergeBuffer('normal', Float32Array, 3)
  return geometry
}

const shaderMaterial = new TreeMaterial()

const tree = new Tree(0, 0)

for (let i = 0; i < 200; i++) {
  tree.update()
}
const simplification = new PathSimplification(1, 1)
const branches = tree.branches.map(simplification.apply.bind(simplification))

branches.forEach(function (branch) {
  branch.forEach(function (p) {
    if (p === undefined) return
    // p.radius *= 0.3;
  })
  const lastPt = branch[branch.length - 1]
  if (lastPt !== undefined) lastPt.radius = 0
})

const radiusMax = 5
const geometries = branches
  .filter(function (branch) {
    return branch.length >= 2
  })
  .map(function (branch) {
    return createBranchGeometry(branch, 20).geom
  })

const treeGeometry = mergeGeometries(geometries)

export default function createTree () {
  return new THREE.Mesh(treeGeometry, shaderMaterial)
}

export {
  tree
}
