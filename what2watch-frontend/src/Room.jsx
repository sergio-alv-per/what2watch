import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { FaCopy as Copy } from "react-icons/fa6"
import { useFilms } from "./hooks"
import {
  FaArrowLeft as LeftArrow,
  FaCheck as Check,
  FaXmark as Cross,
} from "react-icons/fa6"

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
            if (err.response.status === 404) {
              navigate("/404")
            } else {
              console.log("Unknown error when creating a user: " + err)
            }
          }
        })

      return () => {
        abortController.abort()
      }
    } else {
      return () => {
        axios
          .delete(`http://localhost:8000/rooms/${roomID}/users/${userID}`)
          .catch((err) => {
            console.log("Error deleting user: " + err)
          })
      }
    }
  }, [roomID, userID, navigate])

  useEffect(() => {
    if (userID && roomID) {
      const ws = new WebSocket(
        `ws://localhost:8000/rooms/${roomID}/users/${userID}/ws`
      )

      ws.onerror = () => {
        console.log(`WS: ${userID} error on connection.`)
      }

      ws.onopen = () => {
        console.log(`WS: ${userID} connected to room ${roomID}`)
      }

      ws.onclose = () => {
        console.log(`WS: ${userID} disconnected from room ${roomID}`)
        setWebSocket(null)
      }

      ws.onmessage = (e) => {
        setRecievedMatch(JSON.parse(e.data))
      }

      setWebSocket(ws)

      return () => {
        ws.close()
      }
    }
  }, [roomID, userID])

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-5 items-center min-h-screen max-w-xl pb-5">
        <div className="flex place-content-between p-2 w-screen max-w-xl">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-full shadow bg-emerald-800 text-white transition-transform hover:scale-110"
          >
            <LeftArrow />
          </button>
          <RoomIDLabel roomID={roomID} />
        </div>
        {recievedMatch ? (
          <Match match={recievedMatch} />
        ) : userID && websocket ? (
          <FilmSwiper roomID={roomID} userID={userID} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

function Match({ match }) {
  return (
    <div className="flex flex-col gap-5 justify-center items-center px-10">
      <p className="text-gray-800 font-semibold text-xl">{"It's a match!"}</p>
      <img
        className="rounded-md shadow-md h-80"
        src={match.poster}
        alt={match.name}
      />
      <p className="text-gray-800 font-bold text-xl">{match.name}</p>
      <p className="text-gray-800">{match.description}</p>
      <p className="text-gray-500 text-md underline">
        <Link to="/">Go back to the home page</Link>
      </p>
    </div>
  )
}

function RoomIDLabel({ roomID }) {
  const copyRoomIDToClipboard = () => navigator.clipboard.writeText(roomID)

  return (
    <div className="flex gap-2 items-center">
      <span className="text-gray-800 font-semibold text-xl uppercase">
        {roomID}
      </span>
      <button
        onClick={copyRoomIDToClipboard}
        className="p-3 rounded-full shadow bg-emerald-800 text-white transition-transform hover:scale-110"
      >
        <Copy />
      </button>
    </div>
  )
}

function FilmSwiper({ roomID, userID }) {
  const { current, advance, loading } = useFilms()
  const currentFilm = current()

  const sendSwipe = (liked) => {
    const body = JSON.stringify({ film_id: currentFilm.id, liked })
    const headers = { "Content-Type": "application/json" }

    axios
      .post(
        `http://localhost:8000/rooms/${roomID}/users/${userID}/swipes`,
        body,
        { headers }
      )
      .catch((err) => {
        console.log("Error sending swipe: " + err)
      })
  }

  const handleLike = () => {
    sendSwipe(true)
    advance()
  }

  const handleDislike = () => {
    sendSwipe(false)
    advance()
  }

  return (
    <>
      <div>{loading ? <p>Loading...</p> : <FilmCard film={currentFilm} />}</div>
      <div className="flex justify-center items-center gap-16">
        <button
          onClick={handleDislike}
          className="bg-rose-800 text-white rounded-full p-3 shadow-sm transition hover:scale-105 hover:shadow-xl"
        >
          <Cross className="w-12 h-12" />
        </button>
        <button
          onClick={handleLike}
          className="bg-emerald-800 text-white rounded-full p-3 shadow-sm transition hover:scale-105 hover:shadow-xl"
        >
          <Check className="w-12 h-12" />
        </button>
      </div>
    </>
  )
}

function FilmCard({ film }) {
  return (
    <div
      className={
        "flex flex-col h-96 w-72 gap-3 justify-center items-center p-5 rounded-xl shadow-xl bg-emerald-800 my-4"
      }
    >
      <img
        className="min-w-0 min-h-0 rounded-md shadow-md object-contain border-2 border-white"
        src={film.poster}
        alt={film.name}
      />
      <p className="text-white text-center font-bold text-xl">{film.name}</p>
    </div>
  )
}
