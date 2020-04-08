import "expect-puppeteer"
import {mapValues} from "lodash"

function sort(values: number[]) {
  return values.slice().sort((a, b) => a - b)
}

const avg = (times: number[]) => {
  const sum = times.reduce((v, c) => v + c, 0)
  const a = sum / times.length
  const s = Math.sqrt(times.reduce((v,c) => v+Math.pow(c-a, 2), 0)/times.length)
  return [a, s]
}

const round = (n: number) => Math.round(n * 100) / 100

const truncate = (values: number[]) => {
  const l = Math.round(values.length / 5)
  return l ? avg(sort(values).slice(l, -l)) : avg(values)
}

const REPEAT = 16
const testCases = [
  // ["F3_110_P1_ZURICH_PRESELECTION", "http://localhost:3000", "touk_admin", "touk2admin"],
  // ["F3_110_P1_ZURICH_PRESELECTION", "http://172.16.225.177:8082", "touk_admin", "touk2admin"],
  // ["2020_Q1_148_OPEN_RECLOSURE", "http://172.16.225.177:8082", "touk_admin", "touk2admin"],
  // ["2020_Q1_148_OPEN_RECLOSURE", "http://localhost:3000", "touk_admin", "touk2admin"],
  ["przeprojektowanie_testów", "http://localhost:3000", "admin", "admin"],
  ["przeprojektowanie_testów", "https://staging.nussknacker.io", "admin", "admin"],
  ["jwl", "http://localhost:3000", "admin", "admin"],
  ["jwl", "https://staging.nussknacker.io", "admin", "admin"],
]

describe("performance of", () => {
  const tests = []

  describe.each(testCases)("diagram", (processName, url, username, password) => {
    const times: number[] = []

    beforeAll(async () => {
      await page.authenticate({username, password})
      await page.goto(url)
      await page.waitForSelector("#menu-items")
    })

    describe(processName, () => {
      let start: number
      let end: number

      beforeEach(async () => {
        await page.click("#app-logo")
        await page.waitForSelector(`#table-filter .search-container input`)
        await page.type("#table-filter .search-container input", processName.trim())
        await page.waitFor(400)
        await page.waitForSelector(`[value="${processName}"]~.edit-column span`, {visible: true})
        start = await page.evaluate(() => performance.now())
      })

      it.each(Array.from(Array(REPEAT)))("open", async (i) => {
        await page.click(`[value="${processName}"]~.edit-column span`)
        await page.waitForSelector("svg [joint-selector=background], svg .background")
        expect(true).toBe(true)
      })

      afterEach(async () => {
        end = await page.evaluate(() => performance.now())
        times.push(round(end - start))
      })

    })

    afterAll(() => {
      const [a, s] = truncate(times)
      tests[`${processName} ${url}`] = {
        avg: round(a),
        "±": round(s),
        ...times,
      }
    })
  })

  afterAll(() => {
    console.table(tests)
  })

})
