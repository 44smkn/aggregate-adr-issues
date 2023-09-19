import core from '@actions/core'
import { initOctokit } from './github-client'
import { getAdrIssues, outputADRsToDashboardIssue } from './adr-issues'

async function run(): Promise<void> {
  try {
    // Assign given input parameter to variables
    const githubAuthToken = core.getInput('token')
    const labels = core.getMultilineInput('issue-lebals')
    const statusRegex = new RegExp(core.getInput('status-regex')) || /status[\s:)\\r\\n]*(proposed|accepted|done|rejected)/
    const owner = core.getInput('owner')
    const repo = core.getInput('repositories')
    const dashboardIssueNumber = parseInt(core.getInput('dashabord-issue-number'))
    if (isNaN(dashboardIssueNumber)) {
      core.setFailed('failed to cast dashabord-issue-number to number')
    }

    const octokit = initOctokit(githubAuthToken)
    const adrIssues = await getAdrIssues(octokit, owner, repo, labels, statusRegex)
    outputADRsToDashboardIssue(octokit, adrIssues, owner, repo, dashboardIssueNumber)

    // const adrDashboardIssue = await ensureAdrDashboardIssue
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
