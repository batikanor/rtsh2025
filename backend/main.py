from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
def read_hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}

# Example POST endpoint
@app.post("/items")
def create_item(item: dict):
    # Normally, you'd do some logic here, like saving to a database.
    return {"status": "success", "item": item}
