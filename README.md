# aggregate-adr-issues

![example workflow](https://github.com/44smkn/aggregate-adr-issues/actions/workflows/test.yml/badge.svg)

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
