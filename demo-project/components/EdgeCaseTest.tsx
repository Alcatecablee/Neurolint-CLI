import React from 'react'
import ReactDOM from 'react-dom'

interface Item {
  id: number
  name: string
}

class OldComponent extends React.Component {
  myRef = "stringRef"
  
  render() {
    return (
      <div ref={this.myRef}>
        <input ref="inputRef" />
      </div>
    )
  }
}

export function LegacyRender() {
  ReactDOM.render(<OldComponent />, document.getElementById('root'))
}

export function TestListNoKeys({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <li>{item.name}</li>
      ))}
    </ul>
  )
}

export function HydrationIssues() {
  const width = window.innerWidth
  const theme = localStorage.getItem('theme')
  const now = new Date().toISOString()
  
  return (
    <div>
      <p>Width: {width}</p>
      <p>Theme: {theme}</p>
      <p>Now: {now}</p>
      <img src="/test.png" />
    </div>
  )
}
