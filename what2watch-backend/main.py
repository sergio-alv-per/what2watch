from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

TMDB_API = tmdb_api.tmdb_api_from_key_file("tmdb.key")

class Film(BaseModel):
    id: int
    name: str
    poster: str
    description: str

@app.get("/films")
def list_films():
    return [Film(id=f["id"], name=f["name"], poster=f["poster"], description=f["description"]) for f in TMDB_API.get_popular()]

@app.post("/rooms")
def create_room():
    room_id = "".join(random.sample(string.ascii_uppercase, 5))
    while room_id in rooms:
        room_id = random.sample(string.ascii_uppercase, 5)
    
    rooms[room_id] = {}

    return {"id": room_id}

rooms = {}
@app.websocket("/rooms/{room_id}/ws")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    if room_id not in rooms:
        await websocket.close()
        return
    
    await websocket.accept()
    connection_id = len(rooms[room_id])
    rooms[room_id][connection_id] = websocket

    try:
        while True:
            await websocket.receive_text()
            await broadcast(room_id, f"User {connection_id} clicked.")
                
    finally:
        del rooms[room_id][connection_id]

async def broadcast(room_id: str, message: str):
    for connection in rooms[room_id].values():
        await connection.send_text(message)