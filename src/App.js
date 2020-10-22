import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import { longText } from './longText'

const pages = [1, 2, 3, 4, 5]

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    const handler = (event) => {
      console.log(event)
      event.preventDefault()
      event.cancelBubble = true
    }
    window.addEventListener('wheel', handler, { passive: false })
    window.addEventListener('touchmove', handler, { passive: false })
    return () => {
      window.removeEventListener('touchmove', handler)
      window.removeEventListener('wheel', handler)
    }
  }, [])
  const currentContentRef = useRef()
  return (
    <div className="card-form-slides">
      <div className="card-form-actions">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          up
        </button>
        <button
          disabled={currentPage === 5}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          down
        </button>
      </div>
      {pages.map((page) => {
        let status
        if (page === currentPage) {
          status = 'is-current'
        } else if (page < currentPage) {
          status = 'before-current'
        } else {
          status = 'after-current'
        }

        return (
          <div key={page} className={`card-form-slide ${status}`}>
            <div
              ref={status === 'is-current' ? currentContentRef : undefined}
              className="card-form-slide-content"
            >
              <div>page{page}</div>
              {page === 3 && (
                <div>
                  <div>{longText}</div>
                  <input />
                </div>
              )}
              {page === 2 && <input />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
