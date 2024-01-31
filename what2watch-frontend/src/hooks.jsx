import { useEffect, useState } from "react";

export function usePopularFilms({ page = 1 }) {
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true)
        setError(null)
        fetch(`http://localhost:8000/films?page=${page}`)
            .then(res => res.json())
            .then(data => {
                setFilms(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err)
                setLoading(false)
            })
        console.log(`fetching films page ${page}`)
    }, [page])

    return { films, loading, error }
}