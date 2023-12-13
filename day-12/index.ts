import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"

const getReportKey = (row: string[], report: number[], group : number) => `${row.join()}|${report.join()}|${group}`

const getValidPermutationCount = (remainingRow: string[], currentGroupSize: number, remainingReport: number[], dynamicReport: Map<string, number>): number => {
    const dynamicResult = dynamicReport.get(getReportKey(remainingRow, remainingReport, currentGroupSize))

    if (dynamicResult !== undefined) {
        return dynamicResult
    }
    
    const current = remainingRow[0]
    
    if (!current) {
        return (remainingReport.length === 0 && currentGroupSize === 0) || (remainingReport.length === 1 && remainingReport[0] === currentGroupSize) ? 1 : 0
    }

    if (current === '.') {
        if (currentGroupSize > 0 && currentGroupSize !== remainingReport[0]) {
            return 0
        }

        return getValidPermutationCount(remainingRow.slice(1), 0, currentGroupSize === 0 ? remainingReport : remainingReport.slice(1), dynamicReport)
    } else if (current === '#') {
        return getValidPermutationCount(remainingRow.slice(1), currentGroupSize + 1, remainingReport, dynamicReport)
    } else {
        const badRow = [...remainingRow]
        badRow[0] = '#'
        const bad = getValidPermutationCount(badRow, currentGroupSize, remainingReport, dynamicReport)

        const goodRow = [...remainingRow]
        goodRow[0] = '.'
        const good = getValidPermutationCount(goodRow, currentGroupSize, remainingReport, dynamicReport)

        const validCount = bad + good

        dynamicReport.set(getReportKey(remainingRow, remainingReport, currentGroupSize), validCount)

        return validCount
    }
}

 
const run = async () => {
    const input = createInterface(createReadStream("day-12/input"))

    const rows: string[][] = []
    const damageReport: number[][] = []
 
    for await (const line of input) {
        const [springs, damage] = line.split(" ")

        rows.push([...springs])
        damageReport.push(damage.split(',').map(value => parseInt(value)))
    }

    let question1 = 0

    let index = 0
    for (const row of rows) {
        question1 += getValidPermutationCount(row, 0, damageReport[index], new Map<string, number>())
        index++
    }

    console.log(question1)

    const expandedRows = rows.map(row => [...Array(5).keys()].flatMap(_ => row.concat(['?'])).slice(0, -1))
    const expandedDamageReport = damageReport.map(report => [...Array(5).keys()].flatMap(_ => report))

    let question2 = 0

    let expandedIndex = 0
    for (const expandedRow of expandedRows) {
        question2 += getValidPermutationCount(expandedRow, 0, expandedDamageReport[expandedIndex], new Map<string, number>())
        expandedIndex++
    }

    console.log(question2)
}

run()