import { OctokitWithPagination, listIssueCommentsResponse, listIssueForRepoResponse } from "./github-client"
import { markdownTable } from "./markdown-table"

export type ADRIssues = {
  readonly adrFromIssues: ADR[]
  readonly adrFromComments: ADRFromComment[]
}

export type ADR = {
  readonly title: string
  readonly htmlUrl: string
  readonly status: string
  readonly author: string
  readonly updateAt: string
}

export type ADRFromComment = {
  readonly parentTitle: string
  readonly parentHtmlUrl: string
  readonly adrs: ADR[]
}

export async function getAdrIssues(octokit: OctokitWithPagination, owner: string, repos: string[], labels: string[], statusRegex: RegExp): Promise<ADRIssues> {
  let adrFromIssues: ADR[] = []
  let adrFromComments: ADRFromComment[] = []

  for (const repo of repos) {
    const adrIssuesForRepo = await getAdrIssuesForRepo(octokit, owner, repo, labels, statusRegex)
    adrFromIssues = [...adrFromIssues, ...adrIssuesForRepo.adrFromIssues]
    adrFromComments = [...adrFromComments, ...adrIssuesForRepo.adrFromComments]
  }

  return {
    adrFromIssues,
    adrFromComments
  }
}

export async function getAdrIssuesForRepo(octokit: OctokitWithPagination, owner: string, repo: string, labels: string[], statusRegex: RegExp): Promise<ADRIssues> {
  const data: listIssueForRepoResponse['data'] = await octokit.paginate(
    // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-organization-issues-assigned-to-the-authenticated-user
    octokit.rest.issues.listForRepo.endpoint.merge({
      owner,
      repo,
      labels: labels.join(','),
    })
  )

  let adrFromIssues: ADR[] = []
  let adrFromComments: ADRFromComment[] = []
  await Promise.all(data.map(async (issue) => {
    const status = statusRegex.exec(issue.body ?? '')?.at(1)
    if (status !== undefined) {
      adrFromIssues.push({
        title: issue.title,
        htmlUrl: issue.html_url,
        status,
        author: issue.user?.login ?? '',
        updateAt: extractDateFromISO8601(issue.updated_at)
      })
      return
    }
    const adrs = await getAdrComments(octokit, owner, repo, issue.number, statusRegex)
    console.log(adrs)
    adrFromComments.push({
      parentTitle: issue.title,
      parentHtmlUrl: issue.html_url,
      adrs
    })
  }))

  return {
    adrFromIssues,
    adrFromComments
  }
}

async function getAdrComments(octokit: OctokitWithPagination, owner: string, repo: string, issueNumber: number, statusRegex: RegExp): Promise<ADR[]> {
  const data: listIssueCommentsResponse['data'] = await octokit.paginate(
    octokit.rest.issues.listComments.endpoint.merge({
      owner,
      repo,
      issue_number: issueNumber
    })
  )

  return data.map(comment => ({
    title: extractTitleFromComment(comment.body),
    htmlUrl: comment.html_url,
    status: statusRegex.exec(comment.body ?? '')?.at(1)?.toLowerCase() ?? 'unknown',
    author: comment.user?.login ?? '',
    updateAt: extractDateFromISO8601(comment.updated_at)
  }))
}

function extractTitleFromComment(commentBody: string | undefined): string {
  if (commentBody == undefined) {
    return 'unknown'
  }
  const firstLine = commentBody.split(/\r?\n/)[0].replace(/^#+\s*/, '')
  if (!firstLine.includes('Title')) {
    return firstLine
  }

  const sentencesAfterTitle = new RegExp(/title[\s)\\n\\r]*(.+)/gim).exec(commentBody)?.at(1)
  return sentencesAfterTitle?.split(/\r?\n/)[0] ?? 'unknown'
}

export async function outputADRsToDashboardIssue(octokit: OctokitWithPagination, adrIssues: ADRIssues, owner: string, repo: string, issueNumber: number) {
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    body: formatADRIssuesToMarkdown(adrIssues)
  })
}

function formatADRIssuesToMarkdown(adrIssues: ADRIssues): string {

  const templateTable = [['title', 'status', 'author', 'updated at']]

  let adrPerIssueTable = [...templateTable]
  for (const adrFromIssue of adrIssues.adrFromIssues) {
    adrPerIssueTable.push([`[${adrFromIssue.title}](${adrFromIssue.htmlUrl})`, adrFromIssue.status, adrFromIssue.author, adrFromIssue.updateAt])
  }

  let adrPerIssueCommentText = ''
  for (const adrFromComment of adrIssues.adrFromComments) {
    adrPerIssueCommentText += `### [${adrFromComment.parentTitle}](${adrFromComment.parentHtmlUrl})\n`
    let adrPerCommentTable = [...templateTable]
    for (const comment of adrFromComment.adrs) {
      adrPerCommentTable.push([`[${comment.title}](${comment.htmlUrl})`, comment.status, comment.author, comment.updateAt])
    }
    adrPerIssueCommentText += markdownTable(adrPerCommentTable)
  }

  return `This issue was updated by aggregate-adr-issues action
## ADR per issue
${markdownTable(adrPerIssueTable)}

## ADR per issue comment
${adrPerIssueCommentText}
`
}

function extractDateFromISO8601(iso8601: string): string {
  return iso8601.replace(/T.+$/, '')
}