'use client';

import {
  useMutation,
  useQuery,
} from 'convex/react';
import { useState } from 'react';
import { api } from '../../convex/_generated/api';

// interface Message {
//   sender: string;
//   content: string;
// }

export default function Home() {
  const messages = useQuery(api.functions.message.list);
  const createMessage = useMutation(api.functions.message.create);
  const [input, setInput] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMessage({ sender: 'Alice', content: input });
    setInput('');
  };

  return (
    <>
        <h1>Chat</h1>
        <div>
          {messages?.map((message, index) => (
            <div key={index}>
              <strong>{message.sender}: </strong>
              {message.content}
            </div>
          ))}
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              name='message'
              id='message'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type='submit'>Send</button>
          </form>
        </div>
    </>
  );
}
