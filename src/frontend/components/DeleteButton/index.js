import React from 'react'
import ReactDOM from 'react-dom'

export default function DeleteButton({ showConfirm, onToggleConfirm, onDelete }) {
  if (showConfirm) {
    return (
      <div>
        <span className="delete-button-confirm">really?</span>
        <button
          className="delete-button delete-button--confirm"
          onClick={() => {
            onDelete()
          }}
        >
          yep, delete it!
        </button>
        <button className="delete-button" onClick={() => onToggleConfirm(false)}>
          nope!
        </button>
      </div>
    )
  }
  return (
    <div>
      <button className="delete-button" onClick={() => onToggleConfirm(true)}>
        Delete
      </button>
    </div>
  )
}
