import { GitHub } from '@actions/github/lib/utils'

export type ADRDashboardInputs = {
  /**
   * An authenticated Octokit client supporting pagination
   */
  octokit: InstanceType<typeof GitHub>

  /**
   * The owner of repository that has ADR dasbhoard issue
   * For example, 44smkn/aggregate-adr-issues -> 44smkn
   */
  repositoryOwner: string

  /**
   * The name of repository that has ADR dasbhoard issue
   * For example, 44smkn/aggregate-adr-issues -> aggregate-adr-issues
   */
  repositoryName: string

  /**
   * ADR dashboard issue number. The issue is expected to be in same repository as workflow
   */
  issueNumber: number
}
