import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"
 
const getRockKey = ([x, y]: [number, number]) => `${x},${y}`

const getCycleKey = (rocks: [number, number][]) => rocks.sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : a[1] > b[1] ? 1 : -1).join('|')

const moveRocks = (roundRocksMap: Map<string, [number, number]>, tilt: [number, number], squareRocksMap: Map<string, [number, number]>, width: number, height: number) => {
    const remainingRocks = [...roundRocksMap.values()]

    while (remainingRocks.length > 0) {
        const rock = remainingRocks.pop()!

        if (!roundRocksMap.has(getRockKey(rock))) {
            continue
        }

        const nextBlock: [number, number] = [rock[0] + tilt[0], rock[1] + tilt[1]]

        if (nextBlock[1] < 0 || nextBlock[1] > (height - 1) || nextBlock[0] < 0 || nextBlock[0] > (width - 1)) {
            continue
        }

        if (roundRocksMap.has(getRockKey(nextBlock)) || squareRocksMap.has(getRockKey(nextBlock))) {
            continue
        }

        if (!roundRocksMap.delete(getRockKey(rock))) {
            console.log(rock)
        }
        roundRocksMap.set(getRockKey(nextBlock), nextBlock)
        remainingRocks.push(nextBlock)

        const previousBlock: [number, number] = [rock[0] - tilt[0], rock[1] - tilt[1]]
        if (roundRocksMap.has(getRockKey(previousBlock))) {
            remainingRocks.push(previousBlock)
        }
    }
}

const run = async () => {
    const input = createInterface(createReadStream("day-14/input"))

    const roundRocks: [number, number][] = []
    const squareRocks = new Map<string, [number, number]>()

    let y = 0
    let x = 0
    for await (const line of input) {
        for (x = 0; x < line.length; x++) {
            const value = line[x]

            if (value === 'O') {
                roundRocks.push([x, y])
            } else if (value === '#') {
                squareRocks.set(getRockKey([x, y]), [x, y])
            }
        }

        y++
    }

    const roundRocksMap = new Map<string, [number, number]>(roundRocks.map(value => [getRockKey(value), value]))
    
    moveRocks(roundRocksMap, [0, -1], squareRocks, x, y)

    let question1 = 0

    for (let rocks of roundRocksMap.values()) {
        question1 += y - rocks[1]
    }

    console.log(question1)

    const cycleCount = 1_000_000_000
    const cycles = new Map<string, number>() 
    const nextRoundRocksMap = new Map<string, [number, number]>(roundRocks.map(value => [getRockKey(value), value]))
    const tilts: [number, number][] = [[0, -1], [-1, 0], [0, 1], [1, 0]]
    
    let foundPreviousCycle = false
    for (let cycle = 1; cycle <= cycleCount; cycle++) {
        for (const tilt of tilts) {
            moveRocks(nextRoundRocksMap, tilt, squareRocks, x, y)
        }

        if (!foundPreviousCycle) {
            const cycleKey = getCycleKey([...nextRoundRocksMap.values()])

            const previousCycle = cycles.get(cycleKey)
    
            if (previousCycle) {
                const cycleDiff = cycle - previousCycle
                const laterCycle = Math.floor((cycleCount - cycle) / cycleDiff) * cycleDiff
                cycle = laterCycle + cycle
                foundPreviousCycle = true
            } else {
                cycles.set(cycleKey, cycle)
            }
        }
    }

    let question2 = 0

    for (let rocks of nextRoundRocksMap.values()) {
        question2 += y - rocks[1]
    }

    console.log(question2)
}

run()