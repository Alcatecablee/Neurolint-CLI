import React, { forwardRef, useCallback, useMemo } from 'react'

interface User {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

const UserCard = forwardRef<HTMLDivElement, { user: User; onClick: () => void }>(
  function UserCard({ user, onClick }, ref) {
    var isAdmin = user.role === 'admin'
    
    const browserName = navigator.userAgent
    console.log('Browser:', browserName)
    
    const expensiveValue = useMemo(() => {
      return user.name.toUpperCase()
    }, [user.name])
    
    const handleClick = useCallback(() => {
      console.log('User clicked:', user.id)
      onClick()
    }, [user.id, onClick])
    
    const styles = {
      card: {
        padding: document.body.clientWidth > 768 ? '20px' : '10px',
        border: '1px solid #ccc',
        borderRadius: '8px'
      }
    }
    
    return (
      <div ref={ref} style={styles.card} onClick={handleClick}>
        <img src={user.avatar} width="100" height="100" />
        <h3>{expensiveValue}</h3>
        <p>{user.email}</p>
        {isAdmin && <span className="badge">Admin</span>}
        <button>View Profile</button>
      </div>
    )
  }
)

export default UserCard
