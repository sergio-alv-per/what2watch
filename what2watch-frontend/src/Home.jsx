import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { InfoCarousel } from "./InfoCarousel"

export function Home() {
  const navigate = useNavigate()

  const createRoomAndConnect = () => {
    axios
      .post("http://localhost:8000/rooms")
      .then((response) => response.data.id)
      .then((roomID) => {
        navigate(`/rooms/${roomID}`)
      })
      .catch((err) => console.log(err))
  }

  const connectToRoom = (evt) => {
    evt.preventDefault()
    const roomID = evt.target.roomID.value
    navigate(`/rooms/${roomID}`)
  }

  return (
    <div className="bg-slate-600 flex flex-col gap-3 justify-center items-center p-4 min-h-screen">
      <h1 className="text-white font-bold font-mono text-5xl">What2Watch</h1>
      <div className="flex justify-center items-center max-w-md">
        <InfoCarousel />
      </div>
      <Button onClick={createRoomAndConnect}>Create room</Button>
      <p className="text-white">or</p>
      <ConnectToRoom connectFunction={connectToRoom} />
    </div>
  )
}

function ConnectToRoom({ connectFunction }) {
  const [roomID, setRoomID] = useState("")

  const filterStringKeepAlpha = (str) => str.replace(/[^a-zA-Z]/g, "")

  const roomIDLength = 5

  return (
    <form
      className="flex flex-col space-y-5 justify-center items-center"
      onSubmit={connectFunction}
    >
      <input
        className="rounded-md border-2 border-teal-500 bg-slate-600 text-white text-xl font-bold px-2 py-2 w-36 text-center"
        type="text"
        name="roomID"
        value={roomID}
        onChange={(e) =>
          setRoomID(
            filterStringKeepAlpha(e.target.value)
              .toUpperCase()
              .slice(0, roomIDLength)
          )
        }
        placeholder="Room ID"
      />
      <Button type="submit" disabled={roomID === ""}>
        Connect to room
      </Button>
    </form>
  )
}

function Button({ children, disabled, ...props }) {
  const enabledStyles = "bg-teal-200 rounded-md text-xl font-bold px-5 py-2"
  const disabledStyles =
    "bg-teal-200 rounded-md text-xl font-bold px-5 py-2 opacity-50 cursor-not-allowed"

  return (
    <button
      className={disabled ? disabledStyles : enabledStyles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
