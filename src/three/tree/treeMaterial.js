import * as THREE from 'three'

const phong = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.specularmap,
    THREE.UniformsLib.envmap,
    THREE.UniformsLib.aomap,
    THREE.UniformsLib.lightmap,
    THREE.UniformsLib.emissivemap,
    THREE.UniformsLib.bumpmap,
    THREE.UniformsLib.normalmap,
    THREE.UniformsLib.displacementmap,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.lights,

    {
      wrapRGB: {
        type: 'v3',
        value: new THREE.Vector3(1, 1, 1)
      }
    }
  ]),

  vertexShader: [
    '#define PHONG',

    'varying vec3 vViewPosition;',

    '#ifndef FLAT_SHADED',

    'varying vec3 vNormal;',

    '#endif',

    `#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>`,

    'uniform float time;',
    'attribute vec3 center;',
    'attribute float level;',

    'void main() {',

    `#include <uv_vertex>
     #include <uv2_vertex>
     #include <color_vertex>
   
     #include <beginnormal_vertex>
     #include <morphnormal_vertex>
     #include <skinbase_vertex>
     #include <skinnormal_vertex>
     #include <defaultnormal_vertex>`,

    '#ifndef FLAT_SHADED', // Normal computed with derivatives when FLAT_SHADED

    'vNormal = normalize( transformedNormal );',

    '#endif',

    'float timeRatio = 1.0 - smoothstep(0.0, 20.0, 0.5 * time - level);',

    // "gl_Position = projectionMatrix * mvPosition;",

    `#include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <displacementmap_vertex>
      #include <project_vertex>`,
    '#ifdef USE_SKINNING',

    'vec4 pPosition = vec4(mix(skinned.xyz, center, timeRatio), skinned.w);',
    'mvPosition = modelViewMatrix * pPosition;',

    '#elif defined( USE_MORPHTARGETS )',

    'vec3 pPosition = mix(morphed, center, timeRatio);',
    'mvPosition = modelViewMatrix * vec4( pPosition, 1.0 );',

    '#else',

    'vec3 pPosition = mix(position.xyz, center, timeRatio);',
    'mvPosition = modelViewMatrix * vec4( pPosition, 1.0 );',

    '#endif',
    `
     gl_Position = projectionMatrix * mvPosition;`,
    `
      #include <logdepthbuf_vertex>
      #include <clipping_planes_vertex>`,

    'vViewPosition = -mvPosition.xyz;',

    `#include <worldpos_vertex>
      #include <envmap_vertex>
      #include <shadowmap_vertex>
      #include <fog_vertex>`,

    '}'
  ].join('\n'),

  fragmentShader: [
    '#define PHONG',

    'uniform vec3 diffuse;',
    'uniform vec3 emissive;',
    'uniform vec3 specular;',
    'uniform float shininess;',
    'uniform float opacity;',

    `
      #include <common>
      #include <packing>
      #include <dithering_pars_fragment>
      #include <color_pars_fragment>
      #include <uv_pars_fragment>
      #include <uv2_pars_fragment>
      #include <map_pars_fragment>
      #include <alphamap_pars_fragment>
      #include <aomap_pars_fragment>
      #include <lightmap_pars_fragment>
      #include <emissivemap_pars_fragment>
      #include <envmap_common_pars_fragment>
      #include <envmap_pars_fragment>
      #include <cube_uv_reflection_fragment>
      #include <fog_pars_fragment>
      #include <bsdfs>
      #include <lights_pars_begin>
      #include <lights_phong_pars_fragment>
      #include <shadowmap_pars_fragment>
      #include <bumpmap_pars_fragment>
      #include <normalmap_pars_fragment>
      #include <specularmap_pars_fragment>
      #include <logdepthbuf_pars_fragment>
      #include <clipping_planes_pars_fragment>`,

    'void main() {',
    `#include <clipping_planes_fragment>
ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
vec3 totalEmissiveRadiance = emissive;`,

    'vec4 diffuseColor = vec4( diffuse, opacity );',
    `

#include <logdepthbuf_fragment>
#include <map_fragment>
#include <color_fragment>
#include <alphamap_fragment>
#include <alphatest_fragment>
#include <specularmap_fragment>
#include <normal_fragment_begin>
#include <normal_fragment_maps>
#include <emissivemap_fragment>

// accumulation
#include <lights_phong_fragment>
#include <lights_fragment_begin>
#include <lights_fragment_maps>
#include <lights_fragment_end>

// modulation
#include <aomap_fragment>

//vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
vec3 outgoingLight = vec3( 0.0 ); // outgoing light does not have an alpha, the surface does
#include <envmap_fragment>



#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
#include <premultiplied_alpha_fragment>
#include <dithering_fragment>`, // TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects
    'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
    '}'
  ].join('\n')
}

// var phong = THREE.ShaderLib["phong"];
const vertexSrc = phong.vertexShader
const fragmentSrc = phong.fragmentShader
export class TreeMaterial extends THREE.ShaderMaterial {
  constructor () {
    super({
      uniforms: THREE.UniformsUtils.merge([
        phong.uniforms,
        {
          emissive: {
            type: 'c',
            value: new THREE.Color(0x000000)
          },
          specular: {
            type: 'c',
            value: new THREE.Color(0x000000)
          },
          shininess: {
            type: 'f',
            value: 1
          },
          time: {
            type: 'f',
            value: 0.0
          }
        }
      ]),

      attributes: {
        center: {
          type: 'v3',
          value: null
        },
        level: {
          type: 'f',
          value: null
        }
      },
      vertexShader: vertexSrc,
      fragmentShader: fragmentSrc,
      shading: THREE.SmoothShading,
      lights: true
    })
  }
}
