import { Octokit } from '@octokit/rest'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import type { Endpoints } from '@octokit/types'

export type listIssueForRepoResponse =
  Endpoints['GET /repos/{owner}/{repo}/issues']['response']
export type listIssueCommentsResponse =
  Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}/comments']['response']
export type UpdateIssueResponse =
  Endpoints['PATCH /repos/{owner}/{repo}/issues/{issue_number}']['response']

export type OctokitWithPagination = InstanceType<typeof OctkitWithPagination>

// Add the function of pagination to Octokit
const OctkitWithPagination = Octokit.plugin(paginateRest)

export function initOctokit(auth: string): OctokitWithPagination {
  return new OctkitWithPagination({ auth })
}
