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


import { useState, useEffect, useRef } from 'react'
import DataTable from '../../components/DataTable'

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 })
  const [data, setData] = useState([])
  const chartRef = useRef(null)
  
  var refreshInterval = null
  
  const screenWidth = window.innerWidth
  const isMobile = screenWidth < 768
  
  useEffect(() => {
    console.log('Dashboard mounted')
    
    const savedLayout = localStorage.getItem('dashboardLayout')
    console.log('Saved layout:', savedLayout)
    
    refreshInterval = setInterval(() => {
      console.log('Refreshing stats...')
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
    }, 30000)
    
    fetch('/api/dashboard-data')
      .then(res => res.json())
      .then(data => setData(data))
    
    return () => {
      clearInterval(refreshInterval)
    }
  }, [])
  
  const handleExport = () => {
    console.log('Exporting data...')
    const csvContent = data.map(row => Object.values(row).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-export.csv'
    a.click()
  }
  
  return (
    <div className={`dashboard ${isMobile ? 'mobile' : 'desktop'}`}>
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <img src="/icons/users.png" />
          <h3>Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stat-card">
          <img src="/icons/orders.png" />
          <h3>Orders</h3>
          <p>{stats.orders}</p>
        </div>
        <div className="stat-card">
          <img src="/icons/revenue.png" />
          <h3>Revenue</h3>
          <p>${stats.revenue}</p>
        </div>
      </div>
      
      <div className="chart-container" ref={chartRef}>
        <canvas id="statsChart"></canvas>
      </div>
      
      <section className="data-section">
        <h2>Recent Activity</h2>
        <DataTable data={data} />
        <button onClick={handleExport}>Export CSV</button>
      </section>
    </div>
  )
}
