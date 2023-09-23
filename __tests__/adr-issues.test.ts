import { getAdrIssues } from '../src/adr-issues'
import { GitHub } from '@actions/github/lib/utils'

describe('getAdrIssues', () => {
  let mockOctokit: jest.Mocked<InstanceType<typeof GitHub>>

  beforeEach(() => {
    mockOctokit = {
      paginate: jest.fn(),
      rest: {
        issues: {
          listForRepo: jest.fn,
          listComments: jest.fn
        }
      }
    } as any
  })

  it('should return the correct ADR issues and comments', async () => {
    mockOctokit.paginate
      .mockResolvedValueOnce([
        {
          title: 'ADR per issue',
          html_url: 'https://github.com/44smkn/aggregate-adr-issues/issues/8',
          body: `### status
proposed`,
          user: {
            login: '44smkn'
          },
          updated_at: '2023-09-19T06:12:57Z'
        },
        {
          title: 'ADR per comment',
          html_url: 'https://github.com/44smkn/aggregate-adr-issues/issues/9',
          body: 'empty'
        }
      ])
      .mockResolvedValueOnce([
        {
          html_url: 'https://github.com/44smkn/aggregate-adr-issues/issues/8',
          body: `### ## タイトル(Title)
foobar
## ステータス(Status)
Done
`,
          user: {
            login: '44smkn'
          },
          updated_at: '2023-09-19T06:12:57Z'
        }
      ])

    const adrIssues = await getAdrIssues(
      mockOctokit,
      '44smkn',
      ['aggregate-adr-issues'],
      ['ADR', 'SRE'],
      /status[\s:)\\r\\n]*(proposed|accepted|done)/im
    )

    console.log(adrIssues.adrFromIssues)
    console.log(adrIssues.adrFromComments)

    expect(adrIssues).toEqual({
      adrFromIssues: [
        {
          title: 'ADR per issue',
          htmlUrl: 'https://github.com/44smkn/aggregate-adr-issues/issues/8',
          status: 'proposed',
          author: '44smkn',
          updateAt: '2023-09-19'
        }
      ],
      adrFromComments: [
        {
          parentTitle: 'ADR per comment',
          parentHtmlUrl:
            'https://github.com/44smkn/aggregate-adr-issues/issues/9',
          adrs: [
            {
              title: 'foobar',
              htmlUrl:
                'https://github.com/44smkn/aggregate-adr-issues/issues/8',
              status: 'done',
              author: '44smkn',
              updateAt: '2023-09-19'
            }
          ]
        }
      ]
    })
  })
})
