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
    <div className="bg-slate-600 flex flex-col gap-3 items-center p-4 min-h-screen">
      <h1 className="text-white font-bold font-mono text-5xl top">
        What2Watch
      </h1>
      <div className="flex flex-col gap-3 justify-center items-center max-w-md">
        <h2 className="text-white font-bold text-3xl">404 - Page not found</h2>
        <p className="text-white">
          The page you are looking for does not exist.{" "}
          <Link to="/" className="underline font-bold">
            Go back to the home page
          </Link>
        </p>
        <p className="text-white">
          You will be redirected to the home page in {timeLeft} seconds
        </p>
      </div>
    </div>
  )
}
