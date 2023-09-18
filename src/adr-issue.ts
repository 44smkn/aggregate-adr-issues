export type AdrIssue = {
  readonly title: string
  readonly htmlUrl: string
  readonly status: string
}

export function adrIssue(title: string, htmlUrl: string, body: string, statusRegex: RegExp): AdrIssue {
  return {
    title,
    htmlUrl,
    status: statusRegex.exec(body)?.at(1) || 'unknown',
  }
}