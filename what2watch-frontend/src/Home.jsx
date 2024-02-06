import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
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
    <div className="flex justify-center">
      <div className="flex flex-col gap-3 items-center min-h-screen max-w-xl pb-5">
        <Link to="/">
          <img src="./logo.svg" alt="What2Watch logo" className="p-5 h-24" />
        </Link>
        <div className="px-10">
          <InfoCarousel />
        </div>
        <Button onClick={createRoomAndConnect}>Create a room</Button>
        <p className="text-gray-800">or</p>
        <ConnectToRoom connectFunction={connectToRoom} />
      </div>
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
        className="rounded-md border-2 border-emerald-800 text-gray-800 text-xl font-bold px-2 py-2 w-36 text-center"
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
        Join a room
      </Button>
    </form>
  )
}

function Button({ children, disabled, ...props }) {
  const enabledStyles =
    "bg-emerald-800 text-white rounded-md uppercase font-semibold px-5 py-2"
  const disabledStyles =
    "bg-emerald-800 text-white rounded-md uppercase font-semibold px-5 py-2 opacity-50 cursor-not-allowed"

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
