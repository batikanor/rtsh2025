"use client";

import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  // Hello world state
  const [helloMessage, setHelloMessage] = useState("");

  // Items state
  const [itemInput, setItemInput] = useState("");
  const [newItem, setNewItem] = useState({});

  // Jira issues state
  const [jiraProjectKey, setJiraProjectKey] = useState("");
  const [issues, setIssues] = useState([]);
  const [newIssueSummary, setNewIssueSummary] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");

  // Jira projects state
  const [projects, setProjects] = useState([]);

  // Backend URL
  const BASE_URL = "http://127.0.0.1:8000";

  // Fetch Hello message
  const fetchHello = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hello`, {
        params: { name: "Next.js User" },
      });
      setHelloMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching hello message:", error);
    }
  };

  // Create Item
  const sendItem = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/items`, {
        name: itemInput,
      });
      setNewItem(response.data.item);
    } catch (error) {
      console.error("Error sending item:", error);
    }
  };

  // Fetch Jira Issues
  const fetchJiraIssues = async () => {
    if (!jiraProjectKey) {
      alert("Please enter a Jira project key first.");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/jira/issues`, {
        params: { project_key: jiraProjectKey },
      });
      setIssues(response.data.issues || []);
    } catch (error) {
      console.error("Error fetching Jira issues:", error);
    }
  };

  // Create Jira Issue
  const createJiraIssue = async () => {
    if (!jiraProjectKey || !newIssueSummary) {
      alert("Please provide a Jira project key and summary.");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/jira/issues`, null, {
        params: {
          project_key: jiraProjectKey,
          summary: newIssueSummary,
          description: newIssueDescription,
        },
      });
      // Refresh the list of issues
      fetchJiraIssues();
    } catch (error) {
      console.error("Error creating Jira issue:", error);
    }
  };

  // Fetch Jira Projects
  const fetchJiraProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/jira/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching Jira projects:", error);
    }
  };

  return (
    <div>
      <main className="flex flex-col items-center justify-center p-8">
        <header className="text-center">
          <h1 className="flex items-center justify-center space-x-2 text-2xl font-bold">
            <span>🌍</span>
            <span>My Project</span>
          </h1>
          <p className="mt-2">Integrating FastAPI + Jira + Next.js</p>
        </header>

        <hr className="w-full border-t border-gray-300 my-8" />

        {/* Hello Endpoint */}
        <div className="mb-8">
          <button
            onClick={fetchHello}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Fetch Hello Message
          </button>
          {helloMessage && <p className="mt-4">Message: {helloMessage}</p>}
        </div>

        {/* Items Endpoint */}
        <div className="mb-8">
          <input
            type="text"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            placeholder="Enter item name"
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={sendItem}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2 hover:bg-green-600 transition"
          >
            Send Item
          </button>
          {newItem.name && (
            <p className="mt-4">New Item Created: {newItem.name}</p>
          )}
        </div>

        <hr className="w-full border-t border-gray-300 my-8" />

        {/* Jira Projects */}
        <div className="mb-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Jira Projects</h2>
          <button
            onClick={fetchJiraProjects}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Fetch Jira Projects
          </button>
          {projects.length > 0 && (
            <ul className="mt-4 list-disc list-inside">
              {projects.map((project) => (
                <li key={project.id}>
                  {project.key}: {project.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="w-full border-t border-gray-300 my-8" />

        {/* Jira Issues */}
        <div className="mb-8 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Jira Issues</h2>
          <input
            type="text"
            value={jiraProjectKey}
            onChange={(e) => setJiraProjectKey(e.target.value)}
            placeholder="Jira Project Key (e.g. MYPROJ)"
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 w-full mb-4"
          />
          <button
            onClick={fetchJiraIssues}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Fetch Jira Issues
          </button>

          {issues.length > 0 && (
            <ul className="mt-4 list-disc list-inside">
              {issues.map((issue) => (
                <li key={issue.id}>
                  {issue.key}: {issue.fields.summary}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold">Create New Jira Issue</h3>
            <input
              type="text"
              value={newIssueSummary}
              onChange={(e) => setNewIssueSummary(e.target.value)}
              placeholder="Issue summary"
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 my-2 w-full"
            />
            <textarea
              value={newIssueDescription}
              onChange={(e) => setNewIssueDescription(e.target.value)}
              placeholder="Issue description (optional)"
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 my-2 w-full"
            />
            <button
              onClick={createJiraIssue}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Create Jira Issue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
