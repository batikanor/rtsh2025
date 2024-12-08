# AI-Powered Jira Solutions for Seamless Collaboration and Documentation

## Inspiration
Modern enterprises often struggle with syncing Jira workflows and managing project documentation across organizational boundaries. Granting external access to sensitive data raises security concerns, while manually syncing issues or documenting progress is inefficient. To solve these challenges, we developed two complementary tools:

1. A Jira Synchronization Tool for seamless workflow alignment.

2. An AI-Powered Jira-to-Confluence Documentation Generator for automated project documentation.

## What it does
Our solutions address two critical problems:

1. Jira Synchronization Tool

- This tool bridges the gap between Jira instances, enabling real-time synchronization of shared projects, issues, and updates. Key features include:

- Bidirectional Issue Synchronization: Automatically sync Jira tickets, including statuses, priorities, and attachments.

- Workflow Mapping: Align workflows between instances for seamless project management.

- Conflict Resolution: Resolve conflicts automatically or notify admins for manual intervention.

2. AI-Powered Jira-to-Confluence Documentation Generator

- This tool automates the creation of structured, context-aware documentation from Jira Epics. Key features include:

- Epic Selection: Users select a Jira Epic for documentation.

- AI-Driven Analysis: An AI model built on LangChain analyzes Epics, linked tickets, comments, workflows, and attachments.

- Automated Documentation: Generates structured documentation with:

- Epic summaries, ticket breakdowns, and progress insights.

- Visuals like charts for progress and team contributions.

- Seamless Integration: Publishes fully formatted documentation directly into Confluence.

## How we built it
Backend:

- Built with FastAPI for handling API interactions with Jira and Confluence.

- Utilized Jira’s REST API to fetch and push data.

AI Engine (for Documentation Tool):

- Powered by LangChain and fine-tuned to summarize structured and unstructured project data.

Frontend:

- Developed with Next.js, offering an intuitive interface for sync configuration and documentation previews.

Database:

- PostgreSQL stores issue mappings and sync configurations.

DevOps:

- Deployed with Docker and hosted on AWS for scalability and reliability.

## Challenges we ran into
- API Rate Limits: Managed API quotas with batching and rate-limiting strategies.

- Workflow Mapping: Aligned differing workflows and custom field configurations.

- AI Accuracy: Fine-tuned AI for contextually accurate and human-like summaries.

## Accomplishments that we're proud of
- Enabling cross-instance collaboration without cross-access permissions.

- Automating documentation creation, reducing effort from hours to minutes.

## What we learned
- Collaboration Needs: High demand for secure, inter-company collaboration.

- API Optimization: Efficient API usage ensures responsiveness and scalability.

- User Experience: Intuitive interfaces drive adoption and usability.

## What's next for Project Cauldron
- Multi-Company Support: Expand synchronization for multiple organizations.

- AI Insights: Provide actionable insights on bottlenecks and dependencies.

- Enhanced Documentation: Add multilingual support, advanced visuals, and custom templates.

- Broader Integration: Extend support to platforms like Trello and Asana.

- Real-Time Dashboards: Live tracking of sync and documentation metrics.


# frontend
```
cd frontend && npm run dev
```

## NOTE: You will see the outputs on localhost:3000/rtsh2025 (not on localhost:3000)


# backend
```
cd backend && uvicorn main:app --reload
```

# (not recommended) to run both at the same time using a single command (you then only see frontend outputs):
```
cd frontend && npm run dev & cd backend && uvicorn main:app --reload
```


