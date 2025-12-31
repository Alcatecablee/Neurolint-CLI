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


import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface UserProfile {
  id: number
  name: string
  email: string
  bio: string
  avatar: string
  joinDate: string
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  
  var lastVisit = document.cookie.split('lastVisit=')[1]
  console.log('Last visit:', lastVisit)
  
  useEffect(() => {
    console.log('Profile component mounted')
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      console.log('No auth token, redirecting...')
      router.push('/login')
      return
    }
    
    fetch('/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log('User data loaded:', data)
        setUser(data)
      })
  }, [])
  
  const handleSave = () => {
    console.log('Saving profile...')
    alert(&quot;Profile saved!&quot;)
    setIsEditing(false)
  }
  
  if (!user) return <div>Loading...</div>
  
  return (
    <div className="profile-container">
      <img src={user.avatar} className="avatar" />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>{user.bio}</p>
      <p>Member since: {user.joinDate}</p>
      
      <div className="actions">
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
      
      <button onClick={() => router.back()}>Go Back</button>
    </div>
  )
}
