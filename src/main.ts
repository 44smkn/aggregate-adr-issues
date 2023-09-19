import core from '@actions/core'
import { initOctokit } from './github-client'
import { getAdrIssues, outputADRsToDashboardIssue } from './adr-issues'
import { env } from 'process'

async function run(): Promise<void> {
  try {
    // Assign given input parameter to variables
    const githubAuthToken = core.getInput('token')
    const labels = core.getMultilineInput('issue-labels')
    const statusRegex =
      new RegExp(core.getInput('status-regex')) ??
      /status[\s:)\\r\\n]*(proposed|accepted|done|rejected)/
    const owner = core.getInput('owner')
    const repos = core.getMultilineInput('repositories')
    const dashboardIssueNumber = parseInt(
      core.getInput('dashabord-issue-number')
    )
    if (isNaN(dashboardIssueNumber)) {
      core.setFailed('failed to cast dashabord-issue-number to number')
    }

    const octokit = initOctokit(githubAuthToken)
    const adrIssues = await getAdrIssues(
      octokit,
      owner,
      repos,
      labels,
      statusRegex
    )

    const [dashabordOwner, dashabordRepo] = env.GITHUB_REPOSITORY?.split(
      '/'
    ) ?? [owner]
    await outputADRsToDashboardIssue(
      octokit,
      adrIssues,
      dashabordOwner,
      dashabordRepo,
      dashboardIssueNumber
    )

    // const adrDashboardIssue = await ensureAdrDashboardIssue
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
