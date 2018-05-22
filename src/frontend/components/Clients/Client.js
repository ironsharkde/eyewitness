import React from 'react'
import ReactDOM from 'react-dom'

import DeleteButton from '../DeleteButton'

export default class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showConfirm: false
    }
  }

  render() {
    const { client, onDelete } = this.props
    return (
      <div className="clients__entry">
        <div className="clients__entry-text">{client.name}</div>
        <div className="clients__entry-text clients__entry-token">
          <span>{client.token}</span>
        </div>
        <div>
          <DeleteButton
            showConfirm={this.state.showConfirm}
            onToggleConfirm={show => {
              this.setState({
                showConfirm: show
              })
            }}
            onDelete={() => onDelete(client.token)}
          />
        </div>
      </div>
    )
  }
}
