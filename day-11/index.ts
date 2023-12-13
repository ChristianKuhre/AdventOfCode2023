import { createReadStream } from "fs"
import { createInterface } from "readline"
 
const run = async () => {
    const input = createInterface(createReadStream("day-11/input"))

    const galaxies: [number, number][] = []
    const rowHit = new Set<number>()
    const columnHit = new Set<number>()

    let y = 0
    let x = 0
    for await (const line of input) {
        for (x = 0; x < line.length; x++) {
            const point = line[x]

            if (point === '#') {
                galaxies.push([x, y])
                rowHit.add(y)
                columnHit.add(x)
            }
        }

        y++
    }

    const emptyRows = [...Array(y).keys()].filter(value => !rowHit.has(value))
    const emptyColumns = [...Array(x).keys()].filter(value => !columnHit.has(value))

    let question1 = 0
    let question2 = 1

    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i + 1; j < galaxies.length; j++) {
            const galaxyFrom = galaxies[i]
            const galaxyTo = galaxies[j]

            const rowRange = [galaxyFrom[1], galaxyTo[1]].sort((a, b) => a >= b ? 1 : -1)
            const rowExpand = emptyRows.filter(value => value > rowRange[0] && value < rowRange[1]).length

            const columnRange = [galaxyFrom[0], galaxyTo[0]].sort().sort((a, b) => a >= b ? 1 : -1)
            const columnExpand = emptyColumns.filter(value => value > columnRange[0] && value < columnRange[1]).length

            question1 += ((rowRange[1] - rowRange[0]) + (columnRange[1] - columnRange[0]) + rowExpand + columnExpand)
            question2 += ((rowRange[1] - rowRange[0]) + (columnRange[1] - columnRange[0]) + (rowExpand * 999999) + (columnExpand* 999999))
        }
    }

    console.log(question1)
    console.log(question2)
}

run()