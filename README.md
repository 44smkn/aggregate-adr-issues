# aggregate-adr-issues

<a href="https://github.com/44smkn/aggregate-adr-issues?query=workflow%3Atest"><img alt="test status" src="https://github.com/44smkn/aggregate-adr-issues/workflows/test/badge.svg"></a>

This action provides the following functionality for GitHub Actions users:

- Search ADR issues by given labels and list them with status on one issue named as given title
- Supports ADRs written in two different formats

## Usage

See [action.yml](action.yml)

### Basic

```yaml
- uses: 44smkn/aggregate-adr-action@main
  with:
    issue-labels: |
      ADR
      SRE
    repositories: |
      44smkn/aggregate-adr-issues
    status-regex: status[\s:)\\r\\n]*(proposed|accepted|done|rejected)
    dashabord-issue-number: 10
```
