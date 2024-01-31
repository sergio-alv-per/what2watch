import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'

function App() {
  const [userID, setUserID] = useState('')
  const [websocket, setWebSocket] = useState(null)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setUserID={setUserID} setWebSocket={setWebSocket} />}/>
        <Route path="/rooms/:roomID" element={<Room userID={userID} websocket={websocket} />} />
      </Routes>
    </Router>
  )
}

function Home({ setUserID, setWebSocket }) {
  const navigate = useNavigate()

  const createWebSocket = (roomID, userID) => {
    const ws = new WebSocket(`ws://localhost:8000/rooms/${roomID}/users/${userID}/ws`)

    ws.onopen = () => {
      console.log(`WS: ${userID} connected to room ${roomID}`)
    }

    ws.onclose = () => {
      console.log(`WS: ${userID} disconnected to room ${roomID}`)
      setWebSocket(null)
    }

    setWebSocket(ws)
  }

  const createUserAndWS = (roomID) => {
    fetch(`http://localhost:8000/rooms/${roomID}/users`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setUserID(data.id)
        createWebSocket(roomID, data.id)
      })
      .catch((err) => console.log(err))
  }

  const createRoomAndUserAndWS = () => {
    fetch('http://localhost:8000/rooms', { method: 'POST' })
    .then((res) => res.json())
    .then((data) => data.id)
    .then(
      (roomID) => {
        createUserAndWS(roomID)
        navigate(`/rooms/${roomID}`)
      }
    )
    .catch((err) => console.log(err))
  }

  const connectToRoom = (evt) => {
    evt.preventDefault()
    const roomID = evt.target.roomID.value
    
    createUserAndWS(roomID)

    navigate(`/rooms/${roomID}`)
  }

  return (
  <>
    <h1>What2Watch</h1>
    <button onClick={createRoomAndUserAndWS}>Create room</button>
    <form onSubmit={connectToRoom}>
      <input type="text" name="roomID" placeholder="Room ID" />
      <button type="submit" >Connect to room</button>
    </form>
  </>
  )
}

function Room({ userID, websocket }) {
  const [films, setFilms] = useState([])
  const [recievedMessage, setRecievedMessage] = useState('')
  const { roomID } = useParams()

  if (websocket) {
    websocket.onmessage = (e) => {
      setRecievedMessage(e.data)
    }
  }

  useEffect(() => {
    fetch('http://localhost:8000/films')
      .then((res) => res.json())
      .then((data) => setFilms(data))
      .catch((err) => console.log(err))
  }, [])

  return (
    <>
      <h3>Backend items</h3>
      <ul>
      {
      films
      ? films.map((film) => (<li key={film.id}>{film.name} - {film.poster}</li>))
      : <li>No items received</li>
      }
      </ul>

      <div>
      {
      websocket
      ? (
      <>
        <p>{roomID}</p>
        <button onClick={() => websocket.send(`${userID} says hello!`)}>Send message</button>
        <p>{recievedMessage}</p>
      </>
      )
      : <p>Not connected</p>
      }
      </div>
    </>
  )
}


export default App
