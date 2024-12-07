from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services import jira_service
from dotenv import load_dotenv
load_dotenv() 


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing endpoints
@app.get("/hello")
def read_hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}

@app.post("/items")
def create_item(item: dict):
    return {"status": "success", "item": item}

# Jira endpoints
@app.get("/jira/issues")
def get_jira_issues(project_key: str):
    try:
        data = jira_service.get_issues(project_key)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jira/issues")
def post_jira_issue(project_key: str, summary: str, issue_type: str = "Task", description: str = ""):
    try:
        data = jira_service.create_issue(project_key, summary, issue_type, description)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New route to fetch Jira projects
@app.get("/jira/projects")
def get_jira_projects():
    try:
        data = jira_service.get_projects()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
