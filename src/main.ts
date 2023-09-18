import core from '@actions/core'
import { GithubClient } from './github-client'

async function run(): Promise<void> {
  try {
    // Assign given input parameter to variables
    const githubAuthToken = core.getInput('token')
    const labels = core.getMultilineInput('issue-lebals')
    const statusRegex = new RegExp(core.getInput('status-regex'))
    const organization = core.getInput('organization')

    const ghClient = new GithubClient(githubAuthToken)

    if (organization.length !== 0) {
      // Get org issues
      return
    }

    const owner = process.env.GITHUB_REPOSITORY_OWNER || ''
    const repo = process.env.GITHUB_REPOSITORY?.split('/').at(1) || ''

    await ghClient.getAdrIssues(owner, repo, labels, statusRegex)

    // const adrDashboardIssue = await ensureAdrDashboardIssue
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
