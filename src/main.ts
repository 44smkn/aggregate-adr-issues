import * as core from '@actions/core'
import { getAdrIssues, outputADRsToDashboardIssue } from './adr-issues'
import { getInputs } from './input-helper'

async function run(): Promise<void> {
  core.info('start')
  try {
    const [sourceADRInputs, adrDashboardInputs] = getInputs()

    const adrIssues = await getAdrIssues(sourceADRInputs)
    await outputADRsToDashboardIssue(adrDashboardInputs, adrIssues)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
  core.info('end')
}

run()
