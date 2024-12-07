import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const jiraBaseUrl = process.env.JIRA_BASE_URL;
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const authString = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    // Customize your JQL query as needed
    const jql = 'project=YOURPROJECTKEY';
    const response = await axios.get(
      `${jiraBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}`,
      {
        headers: {
          Authorization: `Basic ${authString}`,
          Accept: 'application/json'
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching issues from Jira:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request) {
  const { fields } = await request.json();
  const jiraBaseUrl = process.env.JIRA_BASE_URL;
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const authString = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

  try {
    const response = await axios.post(
      `${jiraBaseUrl}/rest/api/3/issue`,
      { fields },
      {
        headers: {
          Authorization: `Basic ${authString}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Error creating issue in Jira:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
