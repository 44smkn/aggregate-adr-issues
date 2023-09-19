import { OctokitWithPagination, UpdateIssueResponse, listIssueCommentsResponse, listIssueForRepoResponse } from "./github-client"

export type ADRIssues = {
  readonly adrFromIssues: ADR[]
  readonly adrFromComments: ADRFromComment[]
}

export type ADR = {
  readonly title: string
  readonly htmlUrl: string
  readonly status: string
}

export type ADRFromComment = {
  readonly parentTitle: string
  readonly parentHtmlUrl: string
  readonly adrs: ADR[]
}

export async function getAdrIssues(octokit: OctokitWithPagination, owner: string, repo: string, labels: string[], statusRegex: RegExp): Promise<ADRIssues> {
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
    const status = statusRegex.exec(issue.body || '')?.at(1)
    if (status !== undefined) {
      adrFromIssues.push({
        title: issue.title,
        htmlUrl: issue.html_url,
        status
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
    status: statusRegex.exec(comment.body || '')?.at(1)?.toLowerCase() || 'unknown'
  })).filter(adr => adr.status !== 'unknown')
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
  return sentencesAfterTitle?.split(/\r?\n/)[0] || 'unknown'
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
  let formattedBody = ""

  for (const adrFromIssue of adrIssues.adrFromIssues) {
    formattedBody += `- [${adrFromIssue.title}](${adrFromIssue.htmlUrl}) (**${adrFromIssue.status}**)\n`
  }
  for (const adrFromComment of adrIssues.adrFromComments) {
    formattedBody += `- [${adrFromComment.parentTitle}](${adrFromComment.parentHtmlUrl})\n`
    for (const comment of adrFromComment.adrs) {
      formattedBody += `\t- [${comment.title}](${comment.htmlUrl}) (**${comment.status}**)\n`
    }
  }

  return formattedBody
}