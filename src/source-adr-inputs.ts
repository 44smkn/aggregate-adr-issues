import { GitHub } from '@actions/github/lib/utils'

export type SourceADRInputs = {
  /**
   * An authenticated Octokit client supporting pagination
   */
  octokit: InstanceType<typeof GitHub>

  /**
   * Repositories where ADR issues are located
   */
  repositories: { owner: string; name: string }[]

  /**
   * Labels to be used for filtering to retrieve only the ADR issues of interest
   */
  labels: string[]

  /**
   * Regular expression to find the status of an ADR.
   * The first group captured is adopted.
   * It is used in both the description and comments of the issue.
   */
  statusRegex: RegExp
}
