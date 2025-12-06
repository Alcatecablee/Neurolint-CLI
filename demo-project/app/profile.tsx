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
