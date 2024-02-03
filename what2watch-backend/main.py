from fastapi import FastAPI, WebSocket, HTTPException, WebSocketException, status
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from models import Film, Room, User, Swipe
import random
import string
import tmdb_api


app = FastAPI()

origins = ["http://localhost:5173"]  # Vite frontend port

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


@app.get("/films")
def list_films(page: int = 1) -> list[Film]:
    return app.TMDB_API.get_popular(page)


def generate_room_id():
    room_id = "".join(random.sample(string.ascii_uppercase, 5))
    while room_id in app.rooms:
        room_id = random.sample(string.ascii_uppercase, 5)

    return room_id


@app.post("/rooms")
def create_room() -> Room:
    room_id = generate_room_id()
    app.rooms[room_id] = {}

    return Room(id=room_id)


@app.post("/rooms/{room_id}/users")
def add_user(room_id: str) -> User:
    if room_id not in app.rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    user_id = str(uuid4())

    app.rooms[room_id][user_id] = {}

    return User(id=user_id)


@app.delete("/rooms/{room_id}/users/{user_id}")
def remove_user(room_id: str, user_id: str) -> None:
    if room_id not in app.rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    if user_id not in app.rooms[room_id]:
        raise HTTPException(status_code=404, detail="User not in room")

    del app.rooms[room_id][user_id]


def intersect_swipes(d1, d2):
    # Intersects two dictionaries, keeping keys that are in both and whose
    # values are True in both.
    keys_in_both = set(d1.keys()).intersection(set(d2.keys()))
    return {k: d1[k] for k in keys_in_both if d1[k] and d2[k]}


def check_for_matches(room_id):
    base_user_id, base_user_swipes = next(iter(app.rooms[room_id].items()))
    swipes_intersection = {
        film: liked for film, liked in base_user_swipes.items() if liked
    }
    other_users = set(app.rooms[room_id]) - {base_user_id}
    for user_in_room in other_users:
        user_swipes = app.rooms[room_id][user_in_room]
        swipes_intersection = intersect_swipes(swipes_intersection, user_swipes)

    if swipes_intersection:
        return swipes_intersection.popitem()[0]
    else:
        return None


async def send_match(room_id, film_id):
    film_details = app.TMDB_API.get_film_details(film_id)
    for user_in_room in app.rooms[room_id]:
        if (room_id, user_in_room) in app.connections:
            await app.connections[(room_id, user_in_room)].send_json(
                film_details.model_dump()
            )


@app.post("/rooms/{room_id}/users/{user_id}/swipes")
async def like_film(room_id: str, user_id: str, swipe: Swipe) -> None:
    if room_id not in app.rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    if user_id not in app.rooms[room_id]:
        raise HTTPException(status_code=404, detail="User not in room")

    app.rooms[room_id][user_id][swipe.film_id] = swipe.liked

    if len(app.rooms[room_id]) >= 2:
        found_match = check_for_matches(room_id)

        if found_match:
            await send_match(room_id, found_match)


@app.websocket("/rooms/{room_id}/users/{user_id}/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str, room_id: str) -> None:
    if room_id not in app.rooms:
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION, detail="Room not found"
        )

    if user_id not in app.rooms[room_id]:
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION, detail="User not in room"
        )

    await websocket.accept()

    app.connections[(room_id, user_id)] = websocket

    while True:
        try:
            await websocket.receive_text()
        except:
            del app.connections[(room_id, user_id)]
            break
