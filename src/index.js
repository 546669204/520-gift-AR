import * as THREE from 'three'
import { Environment } from './Environment'
import allLoader, { Resource } from './allLoader'
import Components from './components'
// import InstancedGroupMesh from "three-instanced-group-mesh";

const dummy = new THREE.Object3D()
const reticleGroupMesh = new THREE.Group()

let bzMesh = null;
(async function () {
  await allLoader()
  bzMesh = createTextMesh(Resource.fontMesh, '点击播种')
  reticleGroupMesh.add(Resource.reticleMesh.scene)
  bzMesh.position.y += 0.2
  reticleGroupMesh.add(bzMesh)

  let done = false
  const env = new Environment({
    reticleMesh: reticleGroupMesh,
    onSelect: () => {
      if (done) return
      done = true
      env.reticleMesh.remove(bzMesh)
      env.last_xyz = new THREE.Vector3(0, 0, 0)

      if (env.reticle) {
        dummy.position.setFromMatrixPosition(env.reticle.matrix);
        (env.last_xyz = dummy.position.clone())
      }
      _Components.onSelect()
    },
    animationLoop: () => {
      _Components.animationLoop()
    }
  })
  const _Components = new Components({ env })
  if (!env.xr) {
    env.scene.add(env.reticleMesh)
    env._onSelect()
  }
})()

function createTextMesh (font, message) {
  const matLite = new THREE.MeshBasicMaterial({
    color: 0x006699,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
  })
  const fontCfg = {
    font: font,
    size: 0.1,
    height: 0.02
    // curveSegments: 12,
    // bevelEnabled: true,
    // bevelThickness: 10,
    // bevelSize: 8,
    // bevelSegments: 5
  }
  const geometry = new THREE.TextGeometry(message, fontCfg)

  geometry.computeBoundingBox()

  const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)

  geometry.translate(xMid, 0, 0)
  const text = new THREE.Mesh(geometry, matLite)
  return text
}
