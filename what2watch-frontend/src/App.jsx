import { useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom"
import { usePopularFilms } from "./hooks"

function App() {
  const [userID, setUserID] = useState("")
  const [websocket, setWebSocket] = useState(null)

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home setUserID={setUserID} setWebSocket={setWebSocket} />}
        />
        <Route
          path="/rooms/:roomID"
          element={<Room userID={userID} websocket={websocket} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

function Home({ setUserID, setWebSocket }) {
  const navigate = useNavigate()

  const createWebSocket = (roomID, userID) => {
    const ws = new WebSocket(
      `ws://localhost:8000/rooms/${roomID}/users/${userID}/ws`
    )

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
    fetch(`http://localhost:8000/rooms/${roomID}/users`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setUserID(data.id)
        createWebSocket(roomID, data.id)
      })
      .catch((err) => console.log(err))
  }

  const createRoomAndUserAndWS = () => {
    fetch("http://localhost:8000/rooms", { method: "POST" })
      .then((res) => res.json())
      .then((data) => data.id)
      .then((roomID) => {
        createUserAndWS(roomID)
        navigate(`/rooms/${roomID}`)
      })
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
        <p className="text-white"> placeholder carousel </p>
      </div>
      <Button onClick={createRoomAndUserAndWS}>Create room</Button>
      <p className="text-white">or</p>
      <form
        className="flex flex-col space-y-5 justify-center items-center"
        onSubmit={connectToRoom}
      >
        <input
          className="rounded-md border-2 border-teal-500 bg-slate-600 text-white text-xl font-bold px-2 py-2"
          type="text"
          name="roomID"
          placeholder="Room ID"
        />
        <Button type="submit">Connect to room</Button>
      </form>
    </div>
  )
}

function Button({ children, disabled, ...props }) {
  const enabledStyles = "bg-teal-200 rounded-md text-xl font-bold px-5 py-2"
  const disabledStyles =
    "bg-teal-200 rounded-md text-xl font-bold px-5 py-2 opacity-50 cursor-not-allowed"

  return (
    <button className={disabled ? disabledStyles : enabledStyles} {...props}>
      {children}
    </button>
  )
}

function Room({ userID, websocket }) {
  const [recievedMessage, setRecievedMessage] = useState("")
  const { roomID } = useParams()

  if (websocket) {
    websocket.onmessage = (e) => {
      setRecievedMessage(e.data)
    }
  }

  return (
    <div className="bg-slate-600 flex flex-col space-y-5 justify-center items-center p-4 min-h-screen">
      <p className="text-white font-bold text-xl">{roomID}</p>

      {userID && websocket ? (
        <>
          <FilmSwiper roomID={roomID} userID={userID} />

          <div>
            <button onClick={() => websocket.send(`${userID} says hello!`)}>
              Send message
            </button>
            <p>{recievedMessage}</p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

function FilmSwiper({ roomID, userID }) {
  const [shownFilmSet, setShownFilmSet] = useState(0)
  const [page0, setPage0] = useState(1)
  const [page1, setPage1] = useState(2)
  const { films: films0, loading: loading0 } = usePopularFilms({ page: page0 })
  const { films: films1, loading: loading1 } = usePopularFilms({ page: page1 })
  const [shownFilmIndex, setShownFilmIndex] = useState(0)

  const films = shownFilmSet === 0 ? films0 : films1
  const loading = shownFilmSet === 0 ? loading0 : loading1

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

  const sendSwipe = (liked) => {
    const body = JSON.stringify({ film_id: films[shownFilmIndex].id, liked })
    const headers = { "Content-Type": "application/json" }

    fetch(`http://localhost:8000/rooms/${roomID}/users/${userID}/swipes`, {
      method: "POST",
      body,
      headers,
    })
  }

  const handleLike = () => {
    sendSwipe(true)
    handleNext()
  }

  const handleDislike = () => {
    sendSwipe(false)
    handleNext()
  }

  return (
    <>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="flex flex-col space-y-5 justify-center items-center">
            <img
              className="rounded-md shadow-md h-80"
              src={films[shownFilmIndex].poster}
              alt={films[shownFilmIndex].name}
            />
            <p className="text-white font-bold text-xl">
              {films[shownFilmIndex].name}
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center space-x-5">
        <button
          className="bg-red-200 rounded-md text-xl font-bold px-5 py-2"
          onClick={handleDislike}
        >
          Dislike
        </button>
        <button
          className="bg-teal-200 rounded-md text-xl font-bold px-5 py-2"
          onClick={handleLike}
        >
          Like
        </button>
      </div>
    </>
  )
}

export default App
