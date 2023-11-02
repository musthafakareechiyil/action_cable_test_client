import { useEffect, useState } from 'react'

const ws = new WebSocket('ws://localhost:3000/cable')

function App() {
  const [ messages, setMessages ] = useState([])
  const [ guid, setGuid ] = useState('')
  // const messagesContainer = document.getElementById('messages')

  ws.onopen = () => {
    console.log("connected to webs")
    setGuid(Math.random().toString(36).substring(2, 15))

    ws.send(
      JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({
          id: guid,
          channel: 'MessagesChannel'
        }),
      })
    )
  }


  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'ping') return;
    if (data.type === 'welcome') return
    if (data.type === 'confirm_subscription') return;

    const message = data.message;
    setMessagesAndScrollDown([message, ...messages])

  }

  useEffect(()=> {
    fetchMessages();
  },[])

  // useEffect (() => {
  //   resetScroll()
  // },[messages])

  const fetchMessages = async () => {
    const response = await fetch('http://localhost:3000/messages')
    const data = await response.json()
    setMessagesAndScrollDown(data)
  }

  const setMessagesAndScrollDown = (data) => {
    setMessages(data)
    // resetScroll()
  }

  // const resetScroll = () => {
  //   if (!messagesContainer) return
  //   messagesContainer.scrollTop = messagesContainer.scrollHeight
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";
  
    try {
      const response = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });
  
      if (!response.ok) {
        // Handle non-successful response, e.g., display an error message
        console.error('Message posting failed:', response.status, response.statusText);
        // You can add code to display an error message to the user here
      } else {
        // Successful response, you may choose to update the UI or take other actions
        console.log('Message posted successfully',response);

      }
    } catch (error) {
      // Handle any network or fetch-related errors
      console.error('An error occurred:', error);
      // You can add code to display an error message to the user here
    }
  };
  

  return (
    <>
      <div className='w-full h-screen bg-black text-white flex items-center flex-col'>
        <h1 className='text-5xl font-bold p-5'>Messages</h1>
        <p>Guid: {guid}</p>
        <div className='p-3 overflow-y-auto'>
          {messages.map((message) => (
            <div className='p-2' key={message.id}>
              <p className='text-white'>{message.id}-{message.body}</p>
            </div>
          ))}
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              name='message'
              className='text-black'
            />
            <button type='submit'>
              send
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default App
