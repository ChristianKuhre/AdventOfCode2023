import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"
 
const checkReflection = (i: number, j: number, list: string[][], fixedSmudge: boolean): boolean => {
    if (i < 0 || j >= list.length) {
        return fixedSmudge
    } 
    
    let left = [...list[i]]
    let right = [...list[j]]

    while (left.length > 0 || right.length > 0) {
        const leftValue = left.pop()
        const rightValue = right.pop()

        if (leftValue === rightValue) {
            continue
        }

        if (fixedSmudge) {
            return false
        }

        const leftValueInt = parseInt(leftValue!)
        const rightValueInt = parseInt(rightValue!)

        if (leftValueInt > rightValueInt) {
            right = right.concat([rightValue!])
        } else if (leftValueInt < rightValueInt) {
            left = left.concat([leftValue!])
        }

        fixedSmudge = true
    }

    return checkReflection(i - 1, j + 1, list, fixedSmudge)
}

const countLines = (horisontalLines: [number, number][], verticalLines: [number, number][]) => verticalLines.reduce((value, current) => value + current[1] + 1, 0) + (horisontalLines.reduce((value, current) => value + current[1] + 1, 0) * 100)

const run = async () => {
    const input = createInterface(createReadStream("day-13/input"))

    const rows: string[][][] = []
    const columns: string[][][] = []

    let index = 0
    let j = 0
    for await (const line of input) {
        if (j === 0) {
            rows.push([])
            columns.push([])
        }

        if (line === '') {
            j = 0
            index++
            continue
        }

        let row: string[] = []

        for (let i = 0; i < line.length; i++) {
            if (columns[index][i] === undefined) {
                columns[index][i] = []
            }

            if (line[i] === "#") {
                row.push(i.toString())
                
                columns[index][i].push(j.toString())
            }
        }

        j++

        rows[index].push(row)
    }

    let perfectHorisontalLines: [number, number][] = []
    let horisontalLines: [number, number][] = []
    let perfectVerticalLines: [number, number][] = []
    let verticalLines: [number, number][] = []

    for (let j = 0; j < rows.length; j++) {
        for (let i  = 0; i < rows[j].length - 1; i++) {
            if (checkReflection(i, i + 1, rows[j], true)) {
                perfectHorisontalLines.push([j, i])
            }

            if (checkReflection(i, i + 1, rows[j], false)) {
                horisontalLines.push([j, i])
            }
        }
    
        for (let i  = 0; i < columns[j].length - 1; i++) {
            if (checkReflection(i, i + 1, columns[j], true)) {
                perfectVerticalLines.push([j, i])
            }

            if (checkReflection(i, i + 1, columns[j], false)) {
                verticalLines.push([j, i])
            }
        }
    }

    let question1 = countLines(perfectHorisontalLines, perfectVerticalLines)

    console.log(question1)

    let question2 = countLines(
        horisontalLines.filter(v1 => !perfectHorisontalLines.some(v2 => v1[0] === v2[0] && v1[1] === v2[1])),
        verticalLines.filter(v1 => !perfectVerticalLines.some(v2 => v1[0] === v2[0] && v1[1] === v2[1])))

    console.log(question2)
}

run()
