import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { usePopularFilms } from './hooks'

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
  <div className="bg-slate-600 flex flex-col space-y-5 justify-center items-center p-4 min-h-screen">
    <h1 className="text-white font-bold font-mono text-5xl">What2Watch</h1>
    <div className="flex justify-center items-center h-64 w-64">
      <p className='text-white'> placeholder carousel </p>
    </div>
    <Button onClick={createRoomAndUserAndWS}>Create room</Button>
    <p className='text-white'>or</p>
    <form className="flex flex-col space-y-5 justify-center items-center" onSubmit={connectToRoom}>
      <input className="rounded-md border-2 border-teal-500 bg-slate-600 text-white text-xl font-bold px-2 py-2" type="text" name="roomID" placeholder="Room ID" />
      <Button type="submit">Connect to room</Button>
    </form>
  </div>
  )
}

function Button({ children, disabled, ...props }) {
  const enabledStyles = "bg-teal-200 rounded-md text-xl font-bold px-5 py-2"
  const disabledStyles = "bg-teal-200 rounded-md text-xl font-bold px-5 py-2 opacity-50 cursor-not-allowed"
  
  return (
    <button className={disabled ? disabledStyles : enabledStyles} {...props}>{children}</button>
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
      <FilmSwiper />

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

function FilmSwiper() {
  const [shownFilmSet, setShownFilmSet] = useState(0)
  const [page0, setPage0] = useState(1)
  const [page1, setPage1] = useState(2)
  const { films: films0, loading: loading0, error: error0 } = usePopularFilms({ page: page0 })
  const { films: films1, loading: loading1, error: error1 } = usePopularFilms({ page: page1 })
  const [shownFilmIndex, setShownFilmIndex] = useState(0)

  useEffect(() => {
    console.log("Loading1:", loading0)
    console.log("Error1:", error0)
    console.log("Films1:", films0)
  }, [loading0, error0, films0])

  useEffect(() => {
    console.log("Loading2:", loading1)
    console.log("Error2:", error1)
    console.log("Films2:", films1)
  }, [loading1, error1, films1])

  const films = shownFilmSet === 0 ? films0 : films1
  const loading = shownFilmSet === 0 ? loading0 : loading1
  const error = shownFilmSet === 0 ? error0 : error1
  const page = shownFilmSet === 0 ? page0 : page1

  const handleNext = () => {
    const nextShownFilmIndex = shownFilmIndex + 1

    if (nextShownFilmIndex < films.length) {
      setShownFilmIndex(nextShownFilmIndex)
    } else {
      if (shownFilmSet === 0) {
        setShownFilmSet(1)
        setPage0(page0 + 2)
      } else {
        setShownFilmSet(0)
        setPage1(page1 + 2)
      }

      setShownFilmIndex(0)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <h3>Film Swiper</h3>
      <p>Page: {page}</p>
      <div>
        {
          loading
          ? <p>Loading...</p>
          : <p>{films[shownFilmIndex].name}</p>
        }
      </div>
      <button onClick={handleNext}>Next</button>
    </div>
  )


}


export default App
