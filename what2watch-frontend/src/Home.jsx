import axios from "axios"
import { useNavigate } from "react-router-dom"

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
    <div className="bg-slate-600 flex flex-col space-y-5 justify-center items-center p-4 min-h-screen">
      <h1 className="text-white font-bold font-mono text-5xl">What2Watch</h1>
      <div className="flex justify-center items-center h-64 w-64">
        <p className="text-white"> placeholder carousel </p>
      </div>
      <Button onClick={createRoomAndConnect}>Create room</Button>
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
