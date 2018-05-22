// taken from https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/

export function getStandardDeviation(values) {
  var avg = getAverage(values)

  var squareDiffs = values.map(value => {
    var diff = value - avg
    var sqrDiff = diff * diff
    return sqrDiff
  })

  var avgSquareDiff = getAverage(squareDiffs)

  var stdDev = Math.sqrt(avgSquareDiff)
  return stdDev
}

export function getAverage(data) {
  var sum = data.reduce((sum, value) => {
    return sum + value
  }, 0)

  var avg = sum / data.length
  return avg
}
