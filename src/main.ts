import core from '@actions/core'
import { initOctokit } from './github-client'
import { getAdrIssues } from './adr-issues'

async function run(): Promise<void> {
  try {
    // Assign given input parameter to variables
    const githubAuthToken = core.getInput('token')
    const labels = core.getMultilineInput('issue-lebals')
    const statusRegex = new RegExp(core.getInput('status-regex')) || /status[\s:)\\r\\n]*(proposed|accepted|done|rejected)/
    const organization = core.getInput('organization') || process.env.GITHUB_REPOSITORY_OWNER

    const octokit = initOctokit(githubAuthToken)
    await getAdrIssues(octokit, '44smkn', 'aggregate-adr-issues', labels, statusRegex)

    // const adrDashboardIssue = await ensureAdrDashboardIssue
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
