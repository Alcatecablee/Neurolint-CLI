import React, { useState, useEffect } from 'react'

interface DataItem {
  id: number
  name: string
  value: number
  category: string
}

export default function DataTable({ data }: { data: DataItem[] }) {
  var sortedData = [...data]
  var filterText = ''
  const [loading, setLoading] = useState(true)
  
  const screenSize = window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop'
  
  useEffect(() => {
    console.log('DataTable: Loading data...')
    const savedFilter = sessionStorage.getItem('filter')
    if (savedFilter) {
      filterText = savedFilter
      console.log('Restored filter:', filterText)
    }
    setLoading(false)
  }, [])
  
  const handleSort = (column: string) => {
    console.log('Sorting by:', column)
    sortedData.sort((a, b) => {
      if (column === 'name') return a.name.localeCompare(b.name)
      if (column === 'value') return a.value - b.value
      return 0
    })
  }
  
  if (loading) {
    return <div>Loading data...</div>
  }
  
  return (
    <div className={`table-container ${screenSize}`}>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('value')}>Value</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(item => (
            <tr>
              <td>{item.name}</td>
              <td>{item.value}</td>
              <td>{item.category}</td>
              <td>
                <button onClick={() => console.log('Edit', item.id)}>Edit</button>
                <button onClick={() => console.log('Delete', item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <img src="/table-footer.png" />
    </div>
  )
}
