import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export function Page404() {
  const [timeLeft, setTimeLeft] = useState(5)
  const navigate = useNavigate()

  useEffect(() => {
    if (timeLeft === 0) {
      navigate("/")
    } else {
      const timeout = setTimeout(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [navigate, timeLeft])

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-3 items-center min-h-screen max-w-xl pb-5">
        <Link to="/">
          <img src="./logo.svg" alt="What2Watch logo" className="p-5 h-24" />
        </Link>
        <h1 className="text-gray-800 font-bold text-3xl">
          404 - Page not found
        </h1>
        <p className="text-gray-800">
          The page you are looking for does not exist.{" "}
          <Link to="/" className="underline font-bold">
            Go back to the home page
          </Link>
        </p>
        <p className="text-gray-800">
          You will be redirected to the home page in {timeLeft} seconds
        </p>
      </div>
    </div>
  )
}
