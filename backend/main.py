from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_origins=["*"],  # Frontend URLs

    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Example GET endpoint
@app.get("/hello")
def read_hello(name: str = "World"):
    """
    Returns a simple greeting message.
    """
    return {"message": f"Hello, {name}!"}

# Example POST endpoint
@app.post("/items")
def create_item(item: dict):
    """
    Receives an item and returns a success response.
    """
    return {"status": "success", "item": item}
