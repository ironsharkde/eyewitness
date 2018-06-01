import React from 'react'
import ReactDOM from 'react-dom'
import { isArray } from 'lodash'

import { adminToken, density } from '../../../backend/config'
import AddWebsite from './AddWebsite'
import Website from './Website'

const auth = {
  'x-auth': adminToken
}

export default class Websites extends React.Component {
  constructor(props) {
    super(props)

    const view = localStorage.getItem('view') || 'large'

    this.state = {
      loading: true,
      websites: null,
      websitesFiltered: [],
      showAddDialog: false,
      query: '',
      view
    }

    localStorage.setItem('view', view)

    this.filter = this.filter.bind(this)
    this.fetchWebsites = this.fetchWebsites.bind(this)
    this.addWebsite = this.addWebsite.bind(this)
    this.showAddDialog = this.showAddDialog.bind(this)
    this.renderList = this.renderList.bind(this)
    this.toggleView = this.toggleView.bind(this)

    setInterval(this.fetchWebsites, density)
    this.fetchWebsites()
  }

  fetchWebsites() {
    const request = new Request(`api/v1/siteInfo?fromOffset=${8 * 60 * 60 * 1000}`, {
      headers: new Headers({
        ...auth
      })
    })
    fetch(request)
      .then(x => x.json())
      .then(websites => {
        this.setState({
          websites: isArray(websites) ? websites : []
        })
        this.filter(this.state.query)
      })
  }

  addWebsite(url) {
    const request = new Request(`api/v1/url`, {
      headers: new Headers({
        ...auth,
        'Content-Type': 'application/json'
      })
    })

    fetch(request, {
      method: 'POST',
      body: JSON.stringify({ url })
    }).then(() => {
      this.fetchWebsites()
    })
  }

  deleteWebsite(url) {
    const request = new Request(`api/v1/url`, {
      headers: new Headers({
        ...auth,
        'Content-Type': 'application/json'
      })
    })

    fetch(request, {
      method: 'DELETE',
      body: JSON.stringify({ url })
    }).then(() => {
      this.fetchWebsites()
    })
  }

  showAddDialog(show = true) {
    this.setState({
      ...this.state,
      showAddDialog: show
    })
  }

  filter(query) {
    if (!query.length) {
      return this.setState({
        websitesFiltered: this.state.websites
      })
    }
    this.setState({
      websitesFiltered: this.state.websites.filter(x => {
        return x.url.indexOf(query) !== -1
      })
    })
  }

  toggleView() {
    if (this.state.view === 'small') {
      this.setState({
        view: 'large'
      })
      localStorage.setItem('view', 'large')
    } else {
      this.setState({
        view: 'small'
      })
      localStorage.setItem('view', 'small')
    }
  }

  renderList() {
    if (!this.state.websites) {
      return null
    }

    if (!this.state.websites.length) {
      return (
        <ul className="websites__list">
          <li className="websites__list-empty">
            <p>Eyewitness currently not watching any Websites...</p>
            <button
              className="websites__list-empty-add-button"
              onClick={() => this.showAddDialog(true)}
            >
              Add Website
            </button>
          </li>
        </ul>
      )
    }

    if (this.state.websites.length && !this.state.websitesFiltered.length) {
      return (
        <ul className="websites__list">
          <li className="websites__list-empty">
            <p>Your search has no results...</p>
            <button
              onClick={() => {
                this.setState({
                  query: ''
                })
                this.filter('')
              }}
            >
              Reset Search
            </button>
          </li>
        </ul>
      )
    }

    return (
      <ul className="websites__list">
        {this.state.websitesFiltered.map(website => (
          <Website
            key={website.url}
            website={website}
            fetchWebsites={this.fetchWebsites}
            deleteWebsite={this.deleteWebsite}
            view={this.state.view}
          />
        ))}
      </ul>
    )
  }

  render() {
    return (
      <div className={`websites websites--${this.state.view}`}>
        <div className="websites__toolbar">
          <input
            type="search"
            autoComplete="off"
            placeholder="🔍 Search"
            className="websites__toolbar-search"
            value={this.state.query}
            onChange={evt => {
              this.filter(evt.target.value)
              this.setState({
                query: evt.target.value
              })
            }}
          />
          <div className="websites__toolbar-buttons">
            <button className="websites__toolbar-add" onClick={this.showAddDialog}>
              Add Website
            </button>
            <button className="websites__toolbar-reload" onClick={this.fetchWebsites}>
              <img className="websites__toolbar-button-image" src="images/refresh.svg" />
            </button>
            <button onClick={this.toggleView}>
              {this.state.view === 'small' ? (
                <img className="websites__toolbar-button-image" src="images/expand.svg" />
              ) : (
                <img className="websites__toolbar-button-image" src="images/compress.svg" />
              )}
            </button>
          </div>
        </div>

        {this.state.showAddDialog && (
          <AddWebsite
            onSubmit={url => {
              this.addWebsite(url)
              this.showAddDialog(false)
            }}
            onClose={() => this.showAddDialog(false)}
          />
        )}

        {this.renderList()}
      </div>
    )
  }
}
