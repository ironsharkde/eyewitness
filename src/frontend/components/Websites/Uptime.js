import React from 'react'
import ReactDOM from 'react-dom'
import { get } from 'lodash'

import { getStandardDeviation, getAverage } from '../util/average'
import Chartist from 'chartist'

export default class Uptime extends React.Component {
  constructor(props) {
    super(props)
    this.drawChart = this.drawChart.bind(this)
  }

  render() {
    const { id, website } = this.props
    if (!website) {
      return null
    }
    return <div className="website__uptime" id={id} />
  }

  componentDidMount() {
    this.drawChart()
  }

  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const { id, uptimeMetrik, website, view } = this.props

    if (!website) {
      return null
    }

    new Chartist.Pie(
      `#${id}`,
      {
        series: [uptimeMetrik.live, uptimeMetrik.spikes, uptimeMetrik.down]
      },
      {
        donut: true,
        donutWidth: 3,
        donutSolid: true,
        startAngle: 0,
        showLabel: false,
        chartPadding: 0
      },
      [
        ['(min-width: 480px)', { donutWidth: view === 'small' ? 3 : 4 }],
        ['(min-width: 768px)', { donutWidth: view === 'small' ? 3 : 5 }]
      ]
    )
  }
}
