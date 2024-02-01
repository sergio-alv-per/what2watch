from pydantic import BaseModel


class Film(BaseModel):
    id: int
    name: str
    poster: str
    description: str


class Room(BaseModel):
    id: str


class User(BaseModel):
    id: str


class Swipe(BaseModel):
    film_id: int
    liked: bool
