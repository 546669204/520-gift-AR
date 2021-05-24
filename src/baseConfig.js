export default class BaseConfig {
  constructor () {
    this.xr = !window.location.search.includes('debug')
  }
}
