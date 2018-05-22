import React from 'react'
import ReactDOM from 'react-dom'
import { isArray } from 'lodash'

import { adminToken } from '../../../backend/config'
import AddClient from './AddClient'
import Client from './Client'

const auth = {
  'x-auth': adminToken
}

export default class Clients extends React.Component {
  constructor() {
    super()
    this.state = {
      clients: []
    }
    this.fetchClients = this.fetchClients.bind(this)
    this.deleteClient = this.deleteClient.bind(this)
    this.addClient = this.addClient.bind(this)
    this.renderList = this.renderList.bind(this)

    this.fetchClients()
  }

  fetchClients() {
    const request = new Request(`api/v1/clients`, {
      headers: new Headers({
        ...auth
      })
    })
    fetch(request)
      .then(x => x.json())
      .then(clients => {
        this.setState({
          clients: isArray(clients) ? clients : []
        })
      })
  }

  addClient(name, token) {
    const request = new Request(`api/v1/client`, {
      headers: new Headers({
        ...auth,
        'Content-Type': 'application/json'
      })
    })

    fetch(request, {
      method: 'POST',
      body: JSON.stringify({ name, token })
    }).then(() => {
      this.fetchClients()
    })
  }

  deleteClient(token) {
    const request = new Request(`api/v1/client`, {
      headers: new Headers({
        ...auth,
        'Content-Type': 'application/json'
      })
    })

    fetch(request, {
      method: 'DELETE',
      body: JSON.stringify({ token })
    }).then(() => {
      this.fetchClients()
    })
  }

  render() {
    return (
      <div className="clients__wrapper">
        <h2 className="clients__headline">🔑 Client Access</h2>
        <div className="clients">
          <div className="clients__inner">
            <AddClient addClient={this.addClient} />
          </div>
        </div>
        {this.renderList()}
      </div>
    )
  }

  renderList() {
    if (!this.state.clients.length) {
      return null
    }

    return (
      <div className="clients">
        <div className="clients__inner">
          <div className="clients__list">
            <h3 className="clients__sub-headline">List of Clients</h3>
            <div className="clients__entry clients__entry--headline">
              <div className="clients__entry-text">Name</div>
              <div className="clients__entry-text">Access Token</div>
              <div className="clients__entry-text">Delete</div>
            </div>
            {this.state.clients.map((client, index) => {
              return (
                <Client
                  key={`${index}-${client.token}`}
                  client={client}
                  onDelete={this.deleteClient}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}
