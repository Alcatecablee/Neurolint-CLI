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
import TodoList from '../components/TodoList'
import UserCard from '../components/UserCard'

export default function HomePage() {
  const [todos, setTodos] = useState([])
  const [user, setUser] = useState(null)
  
  const theme = localStorage.getItem('theme') || 'light'
  
  useEffect(() => {
    console.log('HomePage mounted')
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => setTodos(data))
    
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])
  
  const handleUserClick = () => {
    console.log('User card clicked')
    window.location.href = '/profile'
  }
  
  return (
    <main className={theme}>
      <h1>Welcome to the Demo App</h1>
      <img src="/hero-banner.png" />
      
      {user && (
        <UserCard user={user} onClick={handleUserClick} />
      )}
      
      <section>
        <TodoList todos={todos} />
      </section>
      
      <footer>
        <p>&copy; 2025 Demo App. All rights reserved.</p>
      </footer>
    </main>
  )
}
