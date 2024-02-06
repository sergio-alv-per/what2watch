import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
        axios.delete(`http://localhost:8000/rooms/${roomID}/users/${userID}`)
      }
    }
  }, [roomID, userID, navigate])

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
        <div className="flex place-content-between w-full p-2">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-full shadow bg-emerald-800 text-white transition-transform hover:scale-110"
          >
            <LeftArrow />
          </button>
          <RoomIDLabel roomID={roomID} />
        </div>
        {userID && websocket ? (
          <>
            {recievedMatch ? (
              <Match match={recievedMatch} />
            ) : (
              <>
                <FilmSwiper roomID={roomID} userID={userID} />
              </>
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
  const { current, next, previous, advance, loading } = useFilms()
  const [previousLiked, setPreviousLiked] = useState(null)

  const sendSwipe = (liked) => {
    const body = JSON.stringify({ film_id: current().id, liked })
    const headers = { "Content-Type": "application/json" }

    axios.post(
      `http://localhost:8000/rooms/${roomID}/users/${userID}/swipes`,
      body,
      { headers }
    )
  }

  const handleLike = () => {
    sendSwipe(true)
    setPreviousLiked(true)
    advance()
  }

  const handleDislike = () => {
    sendSwipe(false)
    setPreviousLiked(false)
    advance()
  }

  return (
    <>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <CardStack
            previous={previous()}
            current={current()}
            next={next()}
            previousLiked={previousLiked}
          />
        )}
      </div>
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

function CardStack({ previous, current, next, previousLiked }) {
  return (
    <div className="relative my-12">
      {previous && (
        <FilmCard
          film={previous}
          swiped
          liked={previousLiked}
          className={"absolute z-20"}
        />
      )}
      <FilmCard film={current} className={"absolute z-10"} />
      <FilmCard film={next} className={"top-0 z-0"} />
    </div>
  )
}

function FilmCard({ film, className, swiped = false, liked = false }) {
  const [swipedState, setSwipedState] = useState(false)

  useEffect(() => {
    setSwipedState(false)
    if (swiped) {
      setTimeout(() => setSwipedState(true), 5)
    }
  }, [film, swiped])

  const transformation = swipedState
    ? liked
      ? "transition duration-500 translate-x-full"
      : "transition duration-500 -translate-x-full"
    : "translate-x-0"
  const opacity = swipedState ? "opacity-0" : "opacity-100"

  return (
    <div
      className={`flex flex-col h-96 w-72 gap-3 justify-center items-center p-5 rounded-xl shadow-xl bg-emerald-800 ${transformation} ${opacity} ${className}`}
    >
      <img
        className="min-w-0 min-h-0 rounded-md shadow-md object-contain border-2 border-white"
        src={film.poster}
        alt={film.name}
      />
      <p className="text-white font-bold text-xl">{film.name}</p>
    </div>
  )
}
