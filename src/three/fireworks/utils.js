import * as THREE from 'three'

const textureSize = 12.80

export const getRandomNum = (max = 0, min = 0) => Math.floor(Math.random() * (max + 1 - min)) + min
export const getPointMesh = (num, vels, type) => {
  // geometry
  const bufferGeometry = new THREE.BufferGeometry()
  const vertices = []
  const velocities = []
  const colors = []
  const adjustSizes = []
  const masses = []
  const colorType = Math.random() > 0.3 ? 'single' : 'multiple'
  const singleColor = getRandomNum(100, 20) * 0.01
  const multipleColor = () => getRandomNum(100, 1) * 0.01
  let rgbType
  const rgbTypeDice = Math.random()
  if (rgbTypeDice > 0.66) {
    rgbType = 'red'
  } else if (rgbTypeDice > 0.33) {
    rgbType = 'green'
  } else {
    rgbType = 'blue'
  }
  for (let i = 0; i < num; i++) {
    const pos = new THREE.Vector3(0, 0, 0)
    vertices.push(pos.x, pos.y, pos.z)
    velocities.push(vels[i].x, vels[i].y, vels[i].z)
    if (type === 'seed') {
      let size
      if (type === 'trail') {
        size = Math.random() * 0.1 + 0.1
      } else {
        size = Math.random() * 0.1 + 0.1
      }
      if (i === 0) size *= 1.1
      adjustSizes.push(size)
      masses.push(size * 0.017)
      colors.push(1.0, 1.0, 1.0, 1.0)
    } else {
      const size = getRandomNum(10, 10) * 0.001
      adjustSizes.push(0.5)
      masses.push(size * 0.017)
      if (colorType === 'multiple') {
        colors.push(multipleColor(), multipleColor(), multipleColor(), 1.0)
      } else {
        switch (rgbType) {
          case 'red':
            colors.push(singleColor, 0.1, 0.1, 1.0)
            break
          case 'green':
            colors.push(0.1, singleColor, 0.1, 1.0)
            break
          case 'blue':
            colors.push(0.1, 0.1, singleColor, 1.0)
            break
          default:
            colors.push(singleColor, 0.1, 0.1, 1.0)
        }
      }
    }
  }
  bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage))
  bufferGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3).setUsage(THREE.DynamicDrawUsage))
  bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4).setUsage(THREE.DynamicDrawUsage))
  bufferGeometry.setAttribute('adjustSize', new THREE.Float32BufferAttribute(adjustSizes, 1).setUsage(THREE.DynamicDrawUsage))
  bufferGeometry.setAttribute('mass', new THREE.Float32BufferAttribute(masses, 1).setUsage(THREE.DynamicDrawUsage))
  // material
  const shaderMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      size: {
        type: 'f',
        value: textureSize
      },
      texture: {
        type: 't',
        value: canvasTexture
      }
    },
    transparent: true,
    // Display of "blending: THREE.AdditiveBlending" does not work properly if "depthWrite" property is set to true.
    // Therefore, it is necessary to make it false in the case of making the image transparent by blending.
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `precision mediump float;
    attribute vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    uniform float size;
    attribute float adjustSize;
    uniform vec3 cameraPosition;
    varying float distanceCamera;
    attribute vec3 velocity;
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
        vColor = color;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * adjustSize ;
        gl_Position = projectionMatrix * modelViewPosition;
    }`,
    fragmentShader: `precision mediump float;
    uniform sampler2D texture;
    varying vec4 vColor;
    void main() {
        vec4 color = vec4(texture2D(texture, gl_PointCoord));
        gl_FragColor = color * vColor;
    }`
  })

  return new THREE.Points(bufferGeometry, shaderMaterial)
}

export const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
  ctx.save()
  const gradient = ctx.createRadialGradient(canvasRadius, canvasRadius, 0, canvasRadius, canvasRadius, canvasRadius)
  gradient.addColorStop(0.0, 'rgba(255,255,255,1.0)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.restore()
}

export const getTexture = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const diameter = textureSize
  canvas.width = diameter
  canvas.height = diameter
  const canvasRadius = diameter / 2

  /* gradation circle
    ------------------------ */
  drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height)
  const texture = new THREE.Texture(canvas)
  texture.type = THREE.FloatType
  texture.needsUpdate = true
  return texture
}

export const canvasTexture = getTexture()

export const getOffsetXYZ = i => {
  const offset = 3
  const index = i * offset
  const x = index
  const y = index + 1
  const z = index + 2
  return { x, y, z }
}

export const getOffsetRGBA = i => {
  const offset = 4
  const index = i * offset
  const r = index
  const g = index + 1
  const b = index + 2
  const a = index + 3
  return { r, g, b, a }
}
