import { useEffect, useState } from "react"
import axios from "axios"

export function usePopularFilms({ page = 1 }) {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    axios
      .get(`http://localhost:8000/films?page=${page}`)
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
