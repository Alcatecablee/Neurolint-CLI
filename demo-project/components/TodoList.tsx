import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function TodoList({ todos }: { todos: Todo[] }) {
  var count = 0
  var unusedVar = 'this is never used'
  const router = useRouter()
  
  const theme = localStorage.getItem('theme') || 'light'
  
  useEffect(() => {
    console.log('TodoList mounted')
    const width = window.innerWidth
    console.log('Window width:', width)
  }, [])
  
  const handleDelete = (id: number) => {
    console.log('Deleting todo:', id)
    count++
    alert(&quot;Todo deleted!&quot;)
  }
  
  return (
    <div className={theme}>
      <h2>My Todos ({todos.length})</h2>
      <img src="/logo.png" />
      {todos.map(todo => (
        <div className="todo-item">
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => router.push('/add')}>
        Add Todo
      </button>
    </div>
  )
}
