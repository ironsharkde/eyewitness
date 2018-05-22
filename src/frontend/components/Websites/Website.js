import React from 'react'
import ReactDOM from 'react-dom'
import { get, entries, pick, mapValues, isNaN } from 'lodash'

import { getAverage, getStandardDeviation } from '../util/average'
import Chart from './Chart'
import Uptime from './Uptime'
import DeleteButton from '../DeleteButton'

function getTimingString(time) {
  const output = isNaN(time) ? '-' : Math.ceil(time)
  return `Ø ${output}ms`
}

function getUptimeString(percentage, decimal = 0) {
  const output = isNaN(percentage)
    ? '-'
    : decimal > 0
      ? percentage.toFixed(decimal)
      : Math.ceil(percentage)
  return `${output}%`
}

export default class Website extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartId: `chart-${props.website.url.replace(/[^a-zA-Z0-9]/g, '')}`,
      uptimeChartId: `uptime-chart-${props.website.url.replace(/[^a-zA-Z0-9]/g, '')}`,
      showConfirm: false
    }
    this.onToggleConfirm = this.onToggleConfirm.bind(this)
    this.onDelete = this.onDelete.bind(this)
  }

  onToggleConfirm(show = false) {
    this.setState({
      ...this.state,
      showConfirm: show
    })
  }

  onDelete(url) {
    this.props.deleteWebsite(url)
    this.onToggleConfirm(false)
  }

  render() {
    const { website, view } = this.props
    const hasData = Boolean(get(website, 'data', []).length)
    const { live, status, error, timing } = get(website, `data[${website.data.length - 1}]`, {})
    const averageTiming = {
      tcp: getAverage(website.data.map(x => get(x, 'timing.tcp', 0))),
      firstByte: getAverage(website.data.map(x => get(x, 'timing.firstByte', 0))),
      total: getAverage(website.data.map(x => get(x, 'timing.total', 0)))
    }

    const allMetric = website.data.map(x => get(x, 'timing.firstByte', 0))
    const standardDeviation = getStandardDeviation(allMetric)
    const average = getAverage(allMetric)

    const downtimeEntries = website.data.filter(x => !x.live).length
    const spikesEntries = website.data.filter(
      x => (x.live ? get(x, 'timing.firstByte', 0) >= average + standardDeviation : false)
    ).length
    const uptimeEntries = website.data.length - downtimeEntries - spikesEntries

    const uptimeMetrik = {
      live: uptimeEntries / website.data.length * 100.0,
      spikes: spikesEntries / website.data.length * 100.0,
      down: downtimeEntries / website.data.length * 100.0
    }

    return (
      <li
        className={`website ${live ? 'website--live' : 'website--down'} ${
          !hasData ? 'website--nodata' : ''
        }`}
      >
        <h3 className="website__headline">
          {hasData && <span className="website__icon">{live ? '✅' : `⛔`}</span>}
          <a href={website.url} target="_blank">
            {website.url}
          </a>
          {(status || error) && (
            <span className="website__status">{status ? status : error}</span>
          )}
        </h3>
        <div className="website__info">
          <div className="website__stats">
            {entries(averageTiming).map((x, i) => (
              <span key={`time-${i}`}>
                {`${i === 0 ? '' : ' | '}${x[0]}: `}
                <b>{getTimingString(x[1])}</b>
              </span>
            ))}
            <br />
            {entries(uptimeMetrik).map((x, i) => (
              <span key={`up-${i}`}>
                {`${i === 0 ? '' : ' | '}${x[0]}: `}
                <b className={`website__stat--${x[0]}`}>{getUptimeString(x[1], i)}</b>
              </span>
            ))}
          </div>
          <DeleteButton
            showConfirm={this.state.showConfirm}
            onToggleConfirm={this.onToggleConfirm}
            onDelete={() => this.onDelete(website.url)}
          />
        </div>
        <div className="website__charts">
          <Chart id={this.state.chartId} website={website} view={view} />
          <Uptime
            id={this.state.uptimeChartId}
            website={website}
            uptimeMetrik={uptimeMetrik}
            view={view}
          />
        </div>
      </li>
    )
  }
}
