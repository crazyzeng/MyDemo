/**
 * 通过指定概率获得true
 * 若概率设为0.8则本函数有80%可能性返回true，若设为1则100%返回true
 * @param {Number} probability 概率
 */
export const getTrueByProbability = function (probability) {
  probability = probability * 100 || 1
  var odds = Math.floor(Math.random() * 100)
  if (probability === 1) {
    return true
  }
  if (odds < probability) {
    return true
  } else {
    return false
  }
}
