import { Link } from "react-router-dom"

export function Footer() {
  return (
    <div className="flex place-content-between w-screen max-w-xl border-t-2">
      <div>
        <Link to="/">
          <img
            src="/logo.svg"
            alt="What2Watch logo"
            className="p-1 h-6 mt-1"
          />
        </Link>
        <p className="text-gray-500 text-xs p-1">
          By{" "}
          <a
            href="https://github.com/sergio-alv-per/"
            className="font-semibold"
          >
            @sergio-alv-per
          </a>{" "}
        </p>
      </div>
      <div className="flex flex-row-reverse items-center">
        <a href="https://www.themoviedb.org/">
          <img src="/tmdb-logo.svg" alt="TMDB logo" className="p-2 h-10" />
        </a>
        <span className="text-gray-500 text-xs p-2 w-56">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </span>
      </div>
    </div>
  )
}
