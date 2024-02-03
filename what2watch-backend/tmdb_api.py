import requests_cache
from models import Film


class TMDB_API:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        self.images_base_url = "https://image.tmdb.org/t/p/w500"
        self.session = requests_cache.CachedSession(
            cache_name="tmdb_cache", backend="sqlite", expire_after=3600
        )

    def get_popular(self, page=1) -> list[Film]:
        url = f"{self.base_url}/movie/popular?language=es&page={page}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }
        response = self.session.get(url, headers=headers)
        response = response.json()
        return [
            Film(
                id=film["id"],
                name=film["title"],
                poster=self.images_base_url + film["poster_path"],
                description=film["overview"],
            )
            for film in response["results"]
        ]

    def get_film_details(self, film_id) -> Film:
        url = f"{self.base_url}/movie/{film_id}?language=es"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }
        response = self.session.get(url, headers=headers)
        response = response.json()
        return Film(
            id=response["id"],
            name=response["title"],
            poster=self.images_base_url + response["poster_path"],
            description=response["overview"],
        )


def tmdb_api_from_key_file(path):
    with open(path) as f:
        api_key = f.read()
    return TMDB_API(api_key)
