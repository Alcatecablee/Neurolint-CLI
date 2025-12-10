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


import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Settings {
  theme: string
  notifications: boolean
  language: string
  timezone: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    notifications: true,
    language: 'en',
    timezone: 'UTC'
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  var hasUnsavedChanges = false
  
  useEffect(() => {
    console.log('Settings page mounted')
    
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      console.log('Loading saved settings')
      setSettings(JSON.parse(savedSettings))
    }
    
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log('Detected timezone:', userTimezone)
    
    setLoading(false)
  }, [])
  
  const handleChange = (key: string, value: any) => {
    console.log(`Setting ${key} to ${value}`)
    hasUnsavedChanges = true
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSave = () => {
    console.log('Saving settings:', settings)
    localStorage.setItem('userSettings', JSON.stringify(settings))
    hasUnsavedChanges = false
    alert(&quot;Settings saved successfully!&quot;)
  }
  
  const handleReset = () => {
    console.log('Resetting settings to defaults')
    if (confirm(&quot;Are you sure you want to reset all settings?&quot;)) {
      localStorage.removeItem('userSettings')
      location.reload()
    }
  }
  
  if (loading) {
    return <div>Loading settings...</div>
  }
  
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="setting-row">
          <label>Theme</label>
          <select 
            value={settings.theme} 
            onChange={e => handleChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </section>
      
      <section className="settings-section">
        <h2>Notifications</h2>
        <div className="setting-row">
          <label>Enable Notifications</label>
          <input 
            type="checkbox" 
            checked={settings.notifications}
            onChange={e => handleChange('notifications', e.target.checked)}
          />
        </div>
      </section>
      
      <section className="settings-section">
        <h2>Localization</h2>
        <div className="setting-row">
          <label>Language</label>
          <select 
            value={settings.language}
            onChange={e => handleChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div className="setting-row">
          <label>Timezone</label>
          <select 
            value={settings.timezone}
            onChange={e => handleChange('timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
          </select>
        </div>
      </section>
      
      <div className="settings-actions">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={handleReset}>Reset to Defaults</button>
        <button onClick={() => router.back()}>Cancel</button>
      </div>
    </div>
  )
}
