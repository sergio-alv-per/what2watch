import { useEffect, useState } from "react"
import axios from "axios"
import API from "./API"

export function useFilms() {
  const [shownFilmBuffer, setShownFilmBuffer] = useState(0)
  const [page0, setPage0] = useState(1)
  const [page1, setPage1] = useState(2)
  const { films: filmBuffer0, loading: loadingBuffer0 } = useFilmPage({
    page: page0,
  })
  const { films: filmBuffer1, loading: loadingBuffer1 } = useFilmPage({
    page: page1,
  })
  const [shownFilmIndex, setShownFilmIndex] = useState(0)
  const [previousFilm, setPreviousFilm] = useState(null)

  const filmBuffers = [filmBuffer0, filmBuffer1]
  const loadingBuffers = [loadingBuffer0, loadingBuffer1]
  const setPage = [setPage0, setPage1]

  const current = () => filmBuffers[shownFilmBuffer][shownFilmIndex]

  const next = () => {
    if (shownFilmIndex === filmBuffers[shownFilmBuffer].length - 1) {
      return filmBuffers[1 - shownFilmBuffer][0]
    } else {
      return filmBuffers[shownFilmBuffer][shownFilmIndex + 1]
    }
  }

  const previous = () => previousFilm

  const advance = () => {
    setPreviousFilm(current())
    const nextFilmIndex = shownFilmIndex + 1

    if (nextFilmIndex < filmBuffers[shownFilmBuffer].length) {
      setShownFilmIndex(nextFilmIndex)
    } else {
      setPage[shownFilmBuffer]((p) => p + 2)
      setShownFilmBuffer((s) => 1 - s)
      setShownFilmIndex(0)
    }
  }

  return {
    current,
    next,
    previous,
    advance,
    loading: loadingBuffers[shownFilmBuffer],
  }
}

function useFilmPage({ page = 1 }) {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    axios
      .get(API.instance().getHTTPSURLForPath(`/films?page=${page}`))
      .then((res) => {
        setFilms(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [page])

  return { films, loading, error }
}
