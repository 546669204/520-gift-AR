import Base from './base'
import tetx520 from './520text'
import fireWorks from './fireWorks'
import flowerPoints from './flowerPoints'
import flowerSea from './flowerSea'
import tree from './tree'

export default class FlowSea extends Base {
  // 混入的 组件 将会按照顺序执行内部方法
  mixed = [flowerSea, tree, tetx520, flowerPoints, fireWorks];
  constructor (props) {
    super(props)
    this.mixed = this.mixed.map(C => {
      return new C(props)
    })
  }

  onSelect () {
    this.mixed.forEach(it => it.onSelect())
  }

  animationLoop () {
    this.mixed.forEach(it => it.animationLoop())
  }

  destroy () {
    this.mixed.forEach(it => it.destroy())
    this.mixed = null
  }
}
