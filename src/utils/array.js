const arrayUtil = {
  delByVal: function (array, val) {
    if (typeof array === 'undefined') {
      console.error('array.delByVal(array, val):array不能为undefined')
      return
    }
    if (array.constructor !== Array) {
      console.error('array.delByVal(array, val):参数array类型必须是Array!')
      return
    }
    let index = array.indexOf(val)
    if (index === -1) {
      console.error('array.delByVal(array, val):', array, '中不存在元素', val, '或元素并非同一个')
      return
    }
    array.splice(index, 1)
    return array
  }
}
export default arrayUtil
