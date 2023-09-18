import { Octokit } from '@octokit/rest'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { AdrIssue, adrIssue } from './adr-issue'
import type { Endpoints } from '@octokit/types'

type listIssueForRepoResponse = Endpoints['GET /repos/{owner}/{repo}/issues']['response']

// Add the function of pagination to Octokit
const OctkitWithPagination = Octokit.plugin(paginateRest)

export class GithubClient {
  private octokit: InstanceType<typeof OctkitWithPagination>

  constructor(auth: string) {
    this.octokit = new OctkitWithPagination({ auth })
  }

  async getAdrIssues(owner: string, repo: string, labels: string[], statusRegex: RegExp): Promise<AdrIssue[]> {
    const data: listIssueForRepoResponse['data'] = await this.octokit.paginate(
      // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues--parameters
      this.octokit.rest.issues.listForRepo.endpoint.merge({
        owner,
        repo,
        labels: labels.join(','),
      })
    )

    return data.map((issue) => adrIssue(issue.title, issue.html_url, issue.body || '', statusRegex))
  }
}
