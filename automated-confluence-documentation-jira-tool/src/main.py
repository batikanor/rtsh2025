#!/usr/bin/env python
# coding: utf-8
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import requests
from requests.auth import HTTPBasicAuth
import json
import logging
import pandas as pd
from typing import List, Dict, Any, Optional


from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path

load_dotenv()  # take environment variables from .env.

pd.set_option('display.max_colwidth', None)

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to desired level
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# Constants
OPEN_AI_MODEL = "gpt-4o"

# Retrieve environment variables, defaulting to empty strings if not set
USERNAME = os.getenv("USERNAME", "")
CONFLUENCE_USERNAME = os.getenv("CONFLUENCE_USERNAME", "")
PASSWORD = os.getenv("PASSWORD", "")
CONFLUENCE_PASSWORD = os.getenv("CONFLUENCE_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

def check_and_log_env_var(var_name, var_value):
    """Checks if the environment variable is set and logs its length."""
    if not var_value:
        logging.error(f"{var_name} is not set!")
    else:
        logging.info(f"{var_name} is set. Length: {len(var_value)}")

check_and_log_env_var("USERNAME", USERNAME)
check_and_log_env_var("CONFLUENCE_USERNAME", CONFLUENCE_USERNAME)
check_and_log_env_var("PASSWORD", PASSWORD)
check_and_log_env_var("CONFLUENCE_PASSWORD", CONFLUENCE_PASSWORD)
check_and_log_env_var("OPENAI_API_KEY", OPENAI_API_KEY)

ATLASSIAN_BASE_URL = "https://one-atlas-szdg.atlassian.net"
EPIC_ID = "PLAT-30837"
FIELDS_OF_INTEREST = ["summary", "description", "status", "assignee"]

DEFAULT_LLAMA_JIRA_SUMMARIZER_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        """You are a Project Manager specialized in creating high-level summaries for management. Your summaries should provide an executive overview of the current state of high-level features within a specific epic, focusing on progress, key accomplishments, and any significant issues or dependencies."""
    ),
    HumanMessagePromptTemplate.from_template(
        """{question}

Generate a concise, high-level summary in HTML format suitable for management consumption and compatible with Confluence integration via API. The summary should:

- Use valid HTML tags (e.g., <h2>, <p>, <ul>, <li>, <table>, <tr>, <th>, <td>).
- Include the following sections:
  - <a>Link to Epic</a>: Link to the epic and use epic title as link name. 
  - <h2>Epic Summary</h2>: A brief description of the epic.
  - <h2>Current Status</h2>: Overall progress (e.g., percentage completed, milestones achieved).
  - <h2>Key Features</h2>: A table listing major features with columns for "Feature", "Status", and "Assignee".
  - <h2>Accomplishments</h2>: Notable achievements since the last update.
  - <h2>Challenges</h2>: Any significant issues or blockers.
  - <h2>Dependencies</h2>: Critical dependencies that may impact progress.
  - <h2>Next Steps</h2>: Upcoming actions or milestones.
  

Ensure the summary:
- Contains the Link to the epic including it's title on the beginning of the page. 
- Is clear, concise, and free of technical jargon.
- Provides a high-level perspective understandable to non-technical stakeholders.
- Contains only valid HTML elements.
- The final answer should only consist of the HTML code itself, without any Markdown formatting or code fences.
- Use inner quotes ('') are used for quoting.
""")
])

logger.info(f"Length of Atlassian Password: {len(PASSWORD)}")
logger.info(f"Length of Confluence Password: {len(CONFLUENCE_PASSWORD)}")
logger.info(f"Length of OpenAI API Key: {len(os.environ['OPENAI_API_KEY'])}")

class JiraRequestor:
    def __init__(self, base_url: str, username: str, password: str):
        """
        Initializes the JiraRequestor with the base URL, username, and password.

        Args:
            base_url (str): The base URL of the Jira instance (e.g., https://your-domain.atlassian.net).
            username (str): The username or email for Jira authentication.
            password (str): The password or API token for Jira authentication.
        """
        self.api_url = f"{base_url}/rest/api/3"
        self.api_search_url = f"{self.api_url}/search"
        self.username = username
        self._password = password

    def _get_all_stories_by_epic_raw(
        self, 
        epic_id: str, 
        fields_of_interest: List[str], 
        max_results: int = 5
    ):
        """
        Fetches all stories associated with a specific epic from Jira.

        Args:
            epic_id (str): The ID or key of the epic.
            fields_of_interest (List[str]): A list of fields to retrieve for each story.
            max_results (int, optional): The number of results to return per request. Defaults to 50.

        Returns:
            Optional[List[Dict[str, Any]]]: A list of stories as dictionaries if successful, else None.
        """
        jql = f'"Epic Link" = "{epic_id}"'
        params = {
            'jql': jql,
            'fields': ','.join(fields_of_interest),
            'maxResults': max_results,
            'startAt': 0
        }

        try:
            logger.debug(f"Fetching stories with params: {params}")
            response = self._make_jira_request(self.api_search_url, params)

            if response is None:
                logger.error("Failed to fetch stories.")
                return None

            logger.info(f"Fetched {len(response.get('issues', []))} stories.")
            return response

        except Exception as e:
            logger.exception(f"An unexpected error occurred: {e}")
            return None

    def get_all_stories_by_epic(
        self, 
        epic_id: str, 
        fields_of_interest: List[str], 
        max_results: int = 5
    ):
        stories_by_epic_data_raw = self._get_all_stories_by_epic_raw(epic_id, fields_of_interest, max_results)
        processed_issues_by_epic = [self._pre_process_issue(story_by_epic_data_raw, FIELDS_OF_INTEREST) for story_by_epic_data_raw in stories_by_epic_data_raw["issues"]]
        df_processed_issues_by_epic = pd.DataFrame(processed_issues_by_epic)
        df_processed_issues_by_epic["issue_type"] = "story"
        return df_processed_issues_by_epic

    def _get_epic_raw(
        self, 
        epic_id: str, 
        fields_of_interest: List[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Fetches details of a specific epic from Jira.

        Args:
            epic_id (str): The ID or key of the epic.
            fields_of_interest (List[str]): A list of fields to retrieve for the epic.

        Returns:
            Optional[Dict[str, Any]]: A dictionary containing epic details if successful, else None.
        """
        issue_url = f"{self.api_url}/issue/{epic_id}"
        params = {
            'fields': ','.join(fields_of_interest)
        }

        try:
            logger.debug(f"Fetching epic with ID: {epic_id} and params: {params}")
            response = self._make_jira_request(issue_url, params)

            if response is None:
                logger.error("Failed to fetch epic.")
                return None

            logger.info(f"Epic {epic_id} fetched successfully.")
            return response

        except Exception as e:
            logger.exception(f"An unexpected error occurred: {e}")
            return None

    def get_epic(self, epic_id: str, fields_of_interest: List[str]):
        epic_data_raw = self._get_epic_raw(epic_id, fields_of_interest)
        pre_processed_epic = self._pre_process_issue(epic_data_raw, fields_of_interest)
        df_pre_processed_epic = pd.DataFrame([pre_processed_epic])
        df_pre_processed_epic["issue_type"] = "epic"
        return df_pre_processed_epic

    def cooked_df_epic_with_stories(self, epic_id, fields_of_interest):
        df_epic = self.get_epic(epic_id, fields_of_interest)
        df_enriched_stories = self.get_all_stories_by_epic(epic_id, fields_of_interest)

        return pd.concat([df_epic, df_enriched_stories], ignore_index=True)

    def format_for_llm(self, cooked_df_epic_with_enriched_stories):
        df = cooked_df_epic_with_enriched_stories
        # Separate epics and stories
        epics = df[df['issue_type'].str.lower() == 'epic']
        stories = df[df['issue_type'].str.lower() == 'story']
    
        formatted_output = []
    
        for _, epic_row in epics.iterrows():
            formatted_output.append("Epic:")
            formatted_output.append(f"title: {epic_row['summary']}")
            formatted_output.append(f"description: {epic_row['description']}")
            formatted_output.append(f"status: {epic_row['status']}")
            formatted_output.append(f"comments_string: {epic_row['comments_string']}")
            formatted_output.append("")
    
        # Since all stories are assumed to be associated with this epic,
        # we'll just include all stories here.
        if not stories.empty:
            formatted_output.append("stories:")
            for _, story_row in stories.iterrows():
                formatted_output.append(f"  title: {story_row['summary']}")
                formatted_output.append(f"  description: {story_row['description']}")
                formatted_output.append(f"  status: {story_row['status']}")
                formatted_output.append(f"  comments_string: {story_row['comments_string']}")
                formatted_output.append("")
    
        return "\n".join(formatted_output).strip()        

    def _pre_process_issue(self, issue, fields_of_interest):
        # Initialize the result dictionary
        result = {}
        result["key"] = issue["key"]
    
        # Helper function to extract text from Jira's "doc" type description
        def extract_description_text(description_field):
            # Check if description is in the doc format
            if isinstance(description_field, dict) and description_field.get('type') == 'doc':
                # Traverse the content array to extract the text
                content = description_field.get('content', [])
                text_parts = []
                for block in content:
                    if block.get('type') == 'paragraph':
                        for inner_content in block.get('content', []):
                            if inner_content.get('type') == 'text':
                                text_parts.append(inner_content.get('text', ''))
                return ' '.join(text_parts).strip()
            # If it's not in doc format (rare cases), just return it as a string
            return str(description_field)
        
        # Extract values based on fields_of_interest
        for field in fields_of_interest:
            if field == "title":
                # title in Jira issue fields is 'summary'
                result[field] = issue.get('fields', {}).get('summary', '')
            elif field == "description":
                # description might be in doc format
                description_field = issue.get('fields', {}).get('description', '')
                result[field] = extract_description_text(description_field)
            elif field == "status":
                # status name is in fields.status.name
                result[field] = issue.get('fields', {}).get('status', {}).get('name', '')
            elif field == "assignee":
                result[field] = issue.get('fields', {}).get('assignee', {}).get('displayName', '')
            else:
                # If any other fields are requested directly from fields
                result[field] = str(issue.get('fields', {}).get(field, ''))

        issue_with_enriched_comments_string = self._enrich_issue_with_comments(result)
        return issue_with_enriched_comments_string

    def _enrich_issue_with_comments(self, issue):
        issue_key = issue["key"]
        df_comments_of_issue = self.get_comments_df_of_issue(issue_key)
        comments_string = self.concatenate_comments(df_comments_of_issue)
        issue["comments_string"] = comments_string 
        return issue

    def _get_comments_of_issue_raw(self, issue_key):
        """
  bb      Get the comments of a specific issue. 

        Args:
            issue_key (str): The key of the issue.
        """
        issue_url = f"{self.api_url}/issue/{issue_key}/comment"
        params = {}

        try:
            logger.debug(f"Fetching story with key: {issue_key} and params: {params}")
            response = self._make_jira_request(issue_url, params)

            if response is None:
                logger.error("Failed to fetch epic.")
                return None

            logger.info(f"Epic {issue_key} fetched successfully.")
            return response

        except Exception as e:
            logger.exception(f"An unexpected error occurred: {e}")
            return None

    def get_comments_df_of_issue(self, issue_key):
        comments_data_raw = self._get_comments_of_issue_raw(issue_key)["comments"]
        pre_processed_comments = []
        for comment_data_raw in comments_data_raw:
            pre_processed_comment = self._pre_process_comment(comment_data_raw) 
            pre_processed_comment["key"] = issue_key
            pre_processed_comments.append(pre_processed_comment)
        
        return pd.DataFrame(pre_processed_comments)

    def concatenate_comments(self, df_comments):
        concatenated_comment_string = []
        # Iterate over rows in the DataFrame
        for idx, row in df_comments.iterrows():
            author = row["author"]
            content = row["content"]
            concatenated_comment_string.append(f"{idx}. {author}: {content};")
        return "\n".join(concatenated_comment_string)
    
    @staticmethod
    def _pre_process_comment(comment):
        def extract_text_from_doc(doc_field):
            # Check if body is in the doc format
            if isinstance(doc_field, dict) and doc_field.get('type') == 'doc':
                content = doc_field.get('content', [])
                text_parts = []
                for block in content:
                    if block.get('type') == 'paragraph':
                        for inner_content in block.get('content', []):
                            if inner_content.get('type') == 'text':
                                text_parts.append(inner_content.get('text', ''))
                return ' '.join(text_parts).strip()
            # If it's not doc format, just return it as string
            return str(doc_field)
        
        author = comment.get('author', {}).get('displayName', '')
        body_field = comment.get('body', {})
        content = extract_text_from_doc(body_field)
    
        return {
            'author': author,
            'content': content
        }
    
    def _make_jira_request(
        self, 
        url: str, 
        params: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Makes a GET request to the specified Jira API endpoint with given parameters.

        Args:
            url (str): The full URL to send the GET request to.
            params (Dict[str, Any]): Query parameters for the GET request.

        Returns:
            Optional[Dict[str, Any]]: The JSON response as a dictionary if successful, else None.
        """
        try:
            response = requests.get(
                url,
                params=params,
                auth=HTTPBasicAuth(self.username, self._password)
            )

            # Raise an exception for HTTP error responses
            response.raise_for_status()

            data = response.json()
            logger.debug(f"Response data: {json.dumps(data, indent=2)}")
            return data

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err} - Response: {response.text}")
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Request exception occurred: {req_err}")
        except json.JSONDecodeError as json_err:
            logger.error(f"JSON decode error: {json_err} - Response Text: {response.text}")
        except Exception as err:
            logger.exception(f"An unexpected error occurred: {err}")

        return None

class ConfluenceRequestor:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url
        self.username = username
        self._password = password

    def write_to_confluence_page(self, title: str, content: str, space_key: str = "testmax"):
        """Create a new Confluence page with the given title and content."""
        confluence_url = f"{self.base_url}/wiki/rest/api/content"

        # Construct the request body for creating a page
        req_body = {
            "type": "page",
            "title": title,
            "space": {
                "key": space_key
            },
            "body": {
                "storage": {
                    "value": content,
                    "representation": "storage"
                }
            }
        }

        response = self._make_confluence_request(
            url=confluence_url,
            method="POST",
            json_body=req_body
        )
        if response:
            logger.info(f"Page '{title}' created successfully: {json.dumps(response, indent=2)}")
        else:
            logger.error(f"Failed to create page '{title}'.")

    def _make_confluence_request(
        self,
        url: str,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Makes a request to the specified Confluence API endpoint with given parameters or JSON body.

        Args:
            url (str): The full URL to send the request to.
            method (str): The HTTP method to use ('GET' or 'POST', etc.).
            params (Dict[str, Any], optional): Query parameters for the request.
            json_body (Dict[str, Any], optional): JSON body for POST/PUT requests.

        Returns:
            Optional[Dict[str, Any]]: The JSON response as a dictionary if successful, else None.
        """
        try:
            if method.upper() == "GET":
                response = requests.get(
                    url,
                    params=params,
                    auth=HTTPBasicAuth(self.username, self._password)
                )
            elif method.upper() == "POST":
                response = requests.post(
                    url,
                    json=json_body,
                    auth=HTTPBasicAuth(self.username, self._password)
                )
            else:
                logger.error(f"HTTP method '{method}' not supported.")
                return None

            # Raise an exception for HTTP error responses
            response.raise_for_status()

            data = response.json()
            logger.debug(f"Response data: {json.dumps(data, indent=2)}")
            return data

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err} - Response: {response.text}")
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Request exception occurred: {req_err}")
        except json.JSONDecodeError as json_err:
            logger.error(f"JSON decode error: {json_err} - Response Text: {response.text}")
        except Exception as err:
            logger.exception(f"An unexpected error occurred: {err}")

        return None

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.parent.absolute() / "static"),
    name="static",
)

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Renders a simple HTML page with a form to input Jira Epic ID
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/submit", response_class=HTMLResponse)
async def submit_epic(request: Request, epic_id: str = Form(...), page_title: str = Form(...)):


    # This is where you would handle the epic_id, e.g.:
    # - Validate the format.
    # - Retrieve information from Jira via its API.
    # For this example, we'll just return a message with the entered Epic ID.

    # Initialize the JiraRequestor
    jira = JiraRequestor(ATLASSIAN_BASE_URL, USERNAME, PASSWORD)

    df_cooked_epic_with_stories = jira.cooked_df_epic_with_stories(epic_id, FIELDS_OF_INTEREST)
    logger.info(f"Cooked epic with with stories: {df_cooked_epic_with_stories}")

    JIRA_TICKET_URL = ATLASSIAN_BASE_URL + f"/browse/{epic_id}"

    question = jira.format_for_llm(df_cooked_epic_with_stories)
    question += f"\nLink to app: {JIRA_TICKET_URL}"
    logger.info(f"Produced LLM question: {question}")

    # # Instantiate the ChatOllama model
    # chat_model = ChatOllama(model="llama3.1:8b")

    chat_model = ChatOpenAI(
        model=OPEN_AI_MODEL,
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        # api_key="...",  # if you prefer to pass api key in directly instaed of using env vars
        # base_url="...",
        # organization="...",
        # other params...
    )

    ## Summarization Step

    # Invoke the model with the formatted prompt
    summary = chat_model.invoke(DEFAULT_LLAMA_JIRA_SUMMARIZER_PROMPT.format(question=question))
    # summary

    summary_content = summary.content
    logger.info(f"Summary content by OpenAI Model {OPEN_AI_MODEL} {summary_content}")

    confluence = ConfluenceRequestor(ATLASSIAN_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_PASSWORD)

    # In[38]:
    confluence.write_to_confluence_page(page_title, summary_content)


    # After submission, display the epic_id and the chosen page title.
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "epic_id": epic_id, "page_title": page_title}
    )
