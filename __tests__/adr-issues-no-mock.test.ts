import { getAdrIssues, outputADRsToDashboardIssue } from '../src/adr-issues'
import * as github from '@actions/github'

describe('getAdrIssues', () => {
  it('should return the correct ADR issues and comments', async () => {
    const octokit = github.getOctokit(
      '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'
    )
    const statusRegex = /status[\s:)\\r\\n]*(proposed|accepted|done|rejected)/im
    const adrIssues = await getAdrIssues(
      octokit,
      '44smkn',
      ['aggregate-adr-issues'],
      ['ADR', 'SRE'],
      statusRegex
    )

    console.log(adrIssues)
    outputADRsToDashboardIssue(
      octokit,
      adrIssues,
      '44smkn',
      'aggregate-adr-issues',
      10
    )
  })
})
