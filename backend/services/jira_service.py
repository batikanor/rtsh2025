import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv
load_dotenv()  # This will load variables from .env into os.environ

JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

def get_issues(project_key: str):
    search_url = f"{JIRA_BASE_URL}/rest/api/3/search"
    jql = f"project={project_key}"

    response = requests.get(
        search_url,
        headers={"Accept": "application/json"},
        auth=HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN),
        params={"jql": jql}
    )
    response.raise_for_status()
    return response.json()

def create_issue(project_key: str, summary: str, issue_type: str = "Task", description: str = ""):
    create_url = f"{JIRA_BASE_URL}/rest/api/3/issue"
    payload = {
        "fields": {
            "project": {"key": project_key},
            "summary": summary,
            "description": description,
            "issuetype": {"name": issue_type}
        }
    }

    response = requests.post(
        create_url,
        json=payload,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        auth=HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
    )
    response.raise_for_status()
    return response.json()

def get_projects():
    projects_url = f"{JIRA_BASE_URL}/rest/api/3/project"
    response = requests.get(
        projects_url,
        headers={"Accept": "application/json"},
        auth=HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN),
    )
    response.raise_for_status()
    return response.json()
