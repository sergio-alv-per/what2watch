from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from uuid import uuid4
import random
import string
import tmdb_api


app = FastAPI()

origins = ["http://localhost:5173"] # Vite frontend port

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.TMDB_API = tmdb_api.tmdb_api_from_key_file("tmdb.key")
app.rooms = {}
app.connections = {}

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

@app.get("/films")
def list_films(page: int = 1) -> list[Film]:
    popular_films = app.TMDB_API.get_popular(page=page)
    return [Film(id=f["id"], name=f["name"], poster=f["poster"], description=f["description"]) for f in popular_films]

@app.post("/rooms")
def create_room() -> Room:
    room_id = "".join(random.sample(string.ascii_uppercase, 5))
    while room_id in app.rooms:
        room_id = random.sample(string.ascii_uppercase, 5)
    
    app.rooms[room_id] = defaultdict(set)

    return Room(id=room_id)

@app.post("/rooms/{room_id}/users")
def add_user(room_id: str) -> User:
    if room_id not in app.rooms:
        return {"error": "Room not found"}
    
    user_id = str(uuid4())
    
    app.rooms[room_id][user_id] = {}

    return User(id=user_id)

def intersect_dict_keep_true_values(d1, d2):
    keys_in_both = set(d1.keys()).intersection(set(d2.keys()))
    return {k: d1[k] for k in keys_in_both if d1[k] and d2[k]}

async def send_match(room_id, user_id, film_id):
    if (room_id, user_id) in app.connections:
        await app.connections[(room_id, user_id)].send_text(f"Match on film {film_id}!")

@app.post("/rooms/{room_id}/users/{user_id}/swipes")
async def like_film(room_id: str, user_id: str, swipe: Swipe):
    if room_id not in app.rooms:
        return {"error": "Room not found"}
    
    if user_id not in app.rooms[room_id]:
        return {"error": "User not in room"}
    
    app.rooms[room_id][user_id][swipe.film_id] = swipe.liked

    if (len(app.rooms[room_id]) >= 2):
        swipe_intersection = {film:liked for film, liked in app.rooms[room_id][user_id].items() if liked}
        for other_user_in_room in set(app.rooms[room_id]) - {user_id}:
            user_swipes = app.rooms[room_id][other_user_in_room]
            swipe_intersection = intersect_dict_keep_true_values(swipe_intersection, user_swipes)

        if swipe_intersection:
            # There is a match! Send through websocket
            matched_film_id = swipe_intersection.popitem()[0]
            for user_in_room in app.rooms[room_id]:
                await send_match(room_id, user_in_room, matched_film_id)

    return {"success": True}

@app.websocket("/rooms/{room_id}/users/{user_id}/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str, room_id: str):
    if room_id not in app.rooms:
        await websocket.close()
        return
    
    if user_id not in app.rooms[room_id]:
        await websocket.close()
        return
        
    await websocket.accept()

    app.connections[(room_id, user_id)] = websocket

    while True:
        try:
            data = await websocket.receive_text()
            await websocket.send_text(f"Response for {data}")
        except:
            del app.connections[(room_id, user_id)]
            break

    