import { request, gql } from 'graphql-request'

const ENDPOINT = 'https://api.profunctor.io/v1/graphql'

const genQuery = (level: string, job: string) => gql`
  query GetFilteredJobs {
		jobs(
		  limit: 5000
		  order_by: { created_at: desc }
		  where: {
			_and: [
			  { approved: { _eq: true } }
			  { level: { _eq: "${level}" } }
			  { scope: { _ilike: "${job}" } }
			  { stack: { _ilike: "%React%" } }
			]
		  }
		) {
		  scope
		  level
		  stack
		  cash_min
		  cash_max
		  remote
		  location_office
		  location_country
		  location_city
		  company_name
		  company_industry
		  about_long
		  about_brief
		  perks
		  contact_telegram
		  contact_email
		  id
		  updated_at
		  created_at
		  premium
		}
	  }
	  
`

// Must be capitalised
const levels = ['middle', 'senior'].map(
  (x) => x.charAt(0).toUpperCase() + x.slice(1)
)
const jobs = ['frontend', 'fullstack']

const combinations = levels.flatMap((level) =>
  jobs.map((job) => ({ level, job }))
)

for (let combo of combinations) {
  const query = genQuery(combo.level, combo.job)
  const res = (await request(ENDPOINT, query)) as {
    jobs: { cash_min: number; cash_max: number }[]
  }
  const jobs = res.jobs

  const averageLow =
    jobs.reduce((acc, item) => acc + item.cash_min, 0) / jobs.length
  const averageHigh =
    jobs.reduce((acc, item) => acc + item.cash_max, 0) / jobs.length

  const average = averageHigh - (averageHigh - averageLow) / 2

  const round = (x: number) => Math.round(x)

  console.log(
    combo.level,
    combo.job,
    round(average),
    round(averageLow),
    '-',
    round(averageHigh)
  )
}

// Middle frontend 2164 1658 - 2670
// Middle fullstack 2347 1824 - 2870
// Senior frontend 4264 3468 - 5060
// Senior fullstack 3800 3099 - 4501
