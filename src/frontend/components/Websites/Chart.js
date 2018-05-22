import React from 'react'
import ReactDOM from 'react-dom'
import { get } from 'lodash'

import { getStandardDeviation, getAverage } from '../util/average'
import Chartist from 'chartist'

export default class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.drawChart = this.drawChart.bind(this)
  }

  render() {
    const { id, website } = this.props
    if (!website) {
      return null
    }
    return <div className="website__chart" id={id} />
  }

  componentDidMount() {
    this.drawChart()
  }

  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const { id, website, view } = this.props

    if (!website) {
      return null
    }

    const now = Date.now()
    const websiteData = website.data.filter(x => x.stamp > now - 30 * 60 * 1000)
    const allMetric = websiteData.map(x => get(x, 'timing.firstByte', 0))
    const standardDeviation = getStandardDeviation(allMetric)
    const average = getAverage(allMetric)

    const liveMetric = websiteData.map(x => (x.live ? get(x, 'timing.firstByte', 0) : null))
    const downMetric = websiteData.map(x => (!x.live ? get(x, 'timing.firstByte', 0) : null))
    const spikeMetric = websiteData.map(x => {
      const firstByte = get(x, 'timing.firstByte', 0)
      return x.live && firstByte >= average + standardDeviation ? firstByte : null
    })

    const chartPadding =
      view === 'small'
        ? {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        : {
            top: 5,
            right: 10,
            bottom: 10,
            left: 0
          }

    new Chartist.Bar(
      `#${id}`,
      {
        labels: websiteData.map(({ stamp }, index) => {
          if (index % 28 === 0) {
            const minute = Math.round((Date.now() - stamp) / 1000 / 60)
            if (!minute) {
              return 'now'
            }
            return `-${minute}min`
          }
          return ''
        }),
        series: [liveMetric, downMetric, spikeMetric]
      },
      {
        showPoint: false,
        showGridBackground: false,
        seriesBarDistance: 0,
        chartPadding,
        axisX: {
          showLabel: false,
          showGrid: false,
          position: 'end',
          offset: 0
        },
        axisY: {
          showLabel: false,
          offset: 0,
          labelInterpolationFnc: value => `${value} ms`,
          showGrid: view === 'small' ? false : true,
          position: 'start'
        }
      },
      [
        [
          '(min-width: 480px)',
          {
            axisY: {
              showLabel: view === 'small' ? false : true,
              offset: view === 'small' ? 0 : 60
            }
          }
        ],
        [
          '(min-width: 768px)',
          {
            axisX: {
              showLabel: view === 'small' ? false : true,
              offset: view === 'small' ? 0 : 10
            }
          }
        ]
      ]
    )
  }
}
