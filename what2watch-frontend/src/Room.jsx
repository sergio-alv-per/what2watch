import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { FaCopy as Copy } from "react-icons/fa6"
import { usePopularFilms } from "./hooks"

export function Room() {
  const [userID, setUserID] = useState(null)
  const [websocket, setWebSocket] = useState(null)
  const [recievedMatch, setRecievedMatch] = useState(null)
  const { roomID } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userID) {
      const abortController = new AbortController()

      axios
        .post(
          `http://localhost:8000/rooms/${roomID}/users`,
          {},
          { signal: abortController.signal }
        )
        .then((res) => setUserID(res.data.id))
        .catch((err) => {
          if (axios.isCancel(err)) {
            console.log("Post /users request cancelled")
          } else {
            console.log(err)
          }
        })

      return () => {
        abortController.abort()
      }
    } else {
      return () => {
        axios.delete(`http://localhost:8000/rooms/${roomID}/users/${userID}`)
      }
    }
  }, [roomID, userID])

  useEffect(() => {
    if (userID && roomID) {
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

      ws.onmessage = (e) => {
        setRecievedMatch(JSON.parse(e.data))
        console.log("Recieved match:", e.data)
        console.log("Type of recieved match:", typeof e.data)
      }

      setWebSocket(ws)

      return () => {
        ws.close()
      }
    }
  }, [roomID, userID])

  useEffect(() => {
    console.log("Recieved match:", recievedMatch)
    console.log("!= null?", recievedMatch !== null)
  }, [recievedMatch])

  return (
    <div className="bg-slate-600 flex flex-col items-center min-h-screen">
      <div className="space-x-5">
        <button
          className="bg-teal-200 rounded-md p-2"
          onClick={() => navigate("/")}
        >
          Leave room
        </button>
        <span className="text-white font-bold text-xl">What2Watch</span>
      </div>
      <div className="flex flex-col space-y-5 justify-center items-center p-4">
        <RoomIDLabel roomID={roomID} />

        {userID && websocket ? (
          <>
            {recievedMatch ? (
              <Match match={recievedMatch} />
            ) : (
              <FilmSwiper roomID={roomID} userID={userID} />
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

function Match({ match }) {
  
  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <p className="text-white font-bold text-xl">{"It's a match!:"}</p>
      <img
        className="rounded-md shadow-md h-80"
        src={match.poster}
        alt={match.name}
      />
      <p className="text-white font-bold text-xl">{match.name}</p>
      <p className="text-white">{match.description}</p>
    </div>
  )
}

function RoomIDLabel({ roomID }) {
  const copyRoomIDToClipboard = () => navigator.clipboard.writeText(roomID)

  return (
    <div className="flex space-x-2 items-center">
      <span className="text-white font-bold text-xl">{roomID}</span>
      <button
        onClick={copyRoomIDToClipboard}
        className="bg-teal-200 rounded-md p-2"
      >
        <Copy className="w-6 h-6" />
      </button>
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

    axios.post(
      `http://localhost:8000/rooms/${roomID}/users/${userID}/swipes`,
      body,
      { headers }
    )
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
          <div className="flex flex-col gap-5 justify-center items-center">
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
