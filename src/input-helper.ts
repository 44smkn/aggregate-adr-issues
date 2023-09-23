import * as core from '@actions/core'
import * as github from '@actions/github'
import { SourceADRInputs } from './source-adr-inputs'
import { ADRDashboardInputs } from './adr-dashboard-inputs'

export function getInputs(): [SourceADRInputs, ADRDashboardInputs] {
  const authToken = core.getInput('token', { required: true })
  const octokit = github.getOctokit(authToken)

  const issueLabels = core.getMultilineInput('issue-labels', { required: true })
  if (issueLabels.length === 0) {
    throw new Error('Please specify one or more issue labels')
  }
  core.debug(`issue-labels: ${issueLabels}`)

  const repositories = core
    .getMultilineInput('repositories', { required: true })
    .map(repo => {
      const splitRepository = repo.split('/')
      if (
        splitRepository.length !== 2 ||
        !splitRepository[0] ||
        !splitRepository[1]
      ) {
        throw new Error(
          `Invalid repository '${repo}'. Expected format {owner}/{repo}.`
        )
      }
      return {
        owner: splitRepository[0],
        name: splitRepository[1]
      }
    })
  core.debug(`repositories: ${repositories}`)

  const statusRegexStr = core.getInput('status-regex', { required: true })
  const statusRegex = new RegExp(statusRegexStr, 'im')
  core.debug(`status-regex: ${statusRegex}`)

  const dashboardIssueNumber = parseInt(
    core.getInput('dashabord-issue-number', { required: true })
  )
  if (isNaN(dashboardIssueNumber)) {
    throw new Error('failed to cast dashabord-issue-number to number')
  }

  const repositoryOwner = github.context.repo.owner
  const repositoryName = github.context.repo.repo

  const sourceADRInputs = {
    octokit,
    repositories,
    labels: issueLabels,
    statusRegex
  }

  const adrDashboardInputs = {
    octokit,
    repositoryOwner,
    repositoryName,
    issueNumber: dashboardIssueNumber,
    adrIssues: {}
  }

  return [sourceADRInputs, adrDashboardInputs]
}
