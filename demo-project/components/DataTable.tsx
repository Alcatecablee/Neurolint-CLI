/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
