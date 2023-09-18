import { GithubClient } from '../src/github-client'

jest.mock('@octokit/rest', () => {
  return {
    Octokit: {
      plugin: jest.fn().mockImplementation(() => {
        return jest.fn().mockImplementation(() => {
          return {
            paginate: jest.fn(),
            rest: {
              issues: {
                listForRepo: {
                  endpoint: {
                    merge: jest.fn()
                  }
                }
              }
            }
          }
        })
      })
    }
  }
})

describe('GithubClient', () => {
  let mockPaginate: jest.Mock
  let client: GithubClient

  beforeEach(() => {
    // Reset mock functions
    jest.clearAllMocks();

    // Retrieve mock functions
    client = new GithubClient('fake-auth');
    mockPaginate = (client as any).octokit.paginate as jest.Mock;
  });

  it('should fetch repo issues correctly', async () => {
    mockPaginate.mockResolvedValueOnce([{
      title: 'ADR 1',
      html_url: 'https://github.com/owner/repo/issues/1',
      body: "status: proposed"
    },
    {
      title: 'ADR 2',
      html_url: 'https://github.com/owner/repo/issues/3',
      body: "status: "
    }])

    const issues = await client.getAdrIssues(
      'owner',
      'repo',
      ['ADR'],
      /status[\s:]*(proposed|accepted)/gim
    )
    expect(issues).toHaveLength(2)
    expect(issues.at(0)?.status).toEqual('proposed')
    expect(issues.at(1)?.status).toEqual('unknown')
  })
})
