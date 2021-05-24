import * as THREE from 'three';
import { manager } from './loadingManager';
import Resource from './allLoaderResource';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const _GLTFLoader = new GLTFLoader(manager);
const _FontLoader = new THREE.FontLoader(manager);
const _TextureLoader = new THREE.TextureLoader(manager);
export default async function () {
  return Promise.all(
    Object.keys(Resource).map(key => {
      let loader = null;
      if (Resource[key].type == 'gltf') {
        loader = _GLTFLoader;
      } else if (Resource[key].type == 'font') {
        loader = _FontLoader;
      } else if (Resource[key].type == 'texture') {
        loader = _TextureLoader;
      }
      return loader.loadAsync(Resource[key].url).then(res => {
        Resource[key] = res;
      });
    })
  );
}

export { Resource };
