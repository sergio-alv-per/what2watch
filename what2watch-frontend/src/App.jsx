import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [films, setFilms] = useState([])
  const [message, setMessage] = useState('')
  const [roomId, setRoomId] = useState('')
  const [ws, setWs] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/films')
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    if (roomId) {
      const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`)
      ws.onopen = () => {
        console.log('connected')
      }

      ws.onmessage = (e) => {
        setMessage(e.data)
      }

      ws.onclose = () => {
        console.log('disconnected')
      }
      setWs(ws)
    }
  }, [roomId])

  const createRoom = () => {
    fetch('http://localhost:8000/rooms', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => setRoomId(data.id))
      .catch((err) => console.log(err))
  }

  const connectToRoom = (evt) => {
    evt.preventDefault()
    const roomId = evt.target[0].value
    setRoomId(roomId)
  }

  return (
    <>
      <h1>What2Watch</h1>

      <h3>Backend items</h3>
      <ul>
        {
        films
        ? films.map((film) => (<li key={film.id}>{film.name} - {film.poster}</li>))
        : <li>No items received</li>
        }
      </ul>

      <h3>Websockets test</h3>
      <button onClick={createRoom}>Create room</button>
      <form onSubmit={connectToRoom}>
        <input type="text" placeholder="Room ID" />
        <button type="submit" >Connect to room</button>
      </form>
      
      <div>
        {
        ws
        ? (
        <>
          <p>{roomId}</p>
          <button onClick={() => ws.send('Hello!')}>Send message</button>
          <p>{message}</p>
        </>
        )
        : <p>Not connected</p>
        }
      </div>
    </>
  )
}

export default App
