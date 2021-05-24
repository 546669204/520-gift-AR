import * as THREE from 'three'
import Base from './base'
import { Resource } from '../allLoader'
// 文字组件
export default class Text520 extends Base {
  onSelect () {
    const env = this.env

    const matLite = new THREE.MeshBasicMaterial({
      color: 0x006699,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    })
    const message = '爱你宝贝'
    const fontCfg = {
      // font资源是 typeface.js 类型的 需要将正常的字体转换 (https://gero3.github.io/facetype.js/)
      font: Resource.fontMesh,
      size: 0.1,
      height: 0.02
      // curveSegments: 12,
      // bevelEnabled: true,
      // bevelThickness: 10,
      // bevelSize: 8,
      // bevelSegments: 5
    }
    // 建立文本几何形状
    const geometry = new THREE.TextGeometry(message, fontCfg)

    geometry.computeBoundingBox()

    // 居中操作
    const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)

    geometry.translate(xMid, 0, 0)
    const text = new THREE.Mesh(geometry, matLite)
    env.reticle && text.position.setFromMatrixPosition(env.reticle.matrix)

    text.position.y += 1
    env.scene.add(text)
  }
}
