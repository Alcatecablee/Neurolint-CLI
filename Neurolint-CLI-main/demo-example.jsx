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


import React from 'react';
function TodoList({
  todos
}) {
  const count = 0;
  return <div>
      {todos.map(todo => <div key={todo.id || todo}>
          <span key={todo.id || todo}>{todo.text}</span>
          <Button onClick={() => {
        // [NeuroLint] Removed console.log: 'Deleting', todo.id
        ;
      }} key={todo.id || todo} aria-label="Button" variant="default">
            Delete
          </Button>
        </div>)}
    </div>;
}
export default TodoList;
