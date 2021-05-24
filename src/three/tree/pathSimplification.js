
function getProjection (a, b, c) {
  if (a.x == b.x && a.y == b.y) {
    return {
      x: a.x,
      y: a.y
    }
  }
  const abx = b.x - a.x
  const aby = b.y - a.y
  const acx = c.x - a.x
  const acy = c.y - a.y
  const n = (acx * abx + acy * aby) / (abx * abx + aby * aby)
  return {
    x: n * abx + a.x,
    y: n * aby + a.y
  }
}
export function PathSimplification (treshold, lookAhead) {
  this.treshold = treshold * treshold
  this.lookAhead = lookAhead
}

PathSimplification.prototype = {
  apply: function (list) {
    const nList = []
    const n = list.length
    let nextId

    for (let i = 0; i < n - 1; i = nextId) {
      nList.push(list[i])
      nextId = Math.min(i + this.lookAhead, n - 1)
      let skip = false
      for (nextId; nextId > i + 1 && !skip; nextId--) {
        for (let j = i + 1; j < nextId && !skip; j++) {
          const projection = getProjection(list[i], list[nextId], list[j])
          const dx = projection.x - list[j].x
          const dy = projection.y - list[j].y
          skip = dx * dx + dy * dy < this.treshold
        }
      }
    }
    nList.push(list[n - 1])
    return nList
  }
}
