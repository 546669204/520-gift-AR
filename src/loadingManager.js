import * as THREE from 'three'

const loadingDom = document.createElement('div')
loadingDom.style.cssText = `
display: flex;
align-items: center;
height: 100vh;
justify-content: center;
`
export const manager = new THREE.LoadingManager()
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  document.body.appendChild(loadingDom)
  loadingDom.textContent =
    '加载文件: ' +
    url +
    '.\n已加载 ' +
    itemsLoaded +
    '个 总文件 ' +
    itemsTotal +
    ' 个.'
}

manager.onLoad = function () {
  loadingDom.textContent = 'Loading complete!'
  document.body.removeChild(loadingDom)
}

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  loadingDom.textContent =
    '加载文件: ' +
    url +
    '.\n已加载 ' +
    itemsLoaded +
    '个 总文件 ' +
    itemsTotal +
    ' 个.'
}

manager.onError = function (url) {
  loadingDom.textContent = 'There was an error loading ' + url
}
