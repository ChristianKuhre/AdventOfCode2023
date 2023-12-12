import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"

type Pipe = {
    pipeType: string
    point1: [number, number]
    point2: [number, number]
    cords: [number, number]
}

const getPipeKey = ([x, y]: [number, number]) => `${x},${y}`

const pipelines = new Map<string, Pipe>()
const map = new Map<string, string>()

const getNeighbors = ([x, y]: [number, number], hasNeighbor: (value: string) => boolean, increment = 1) => {
    const result: [number, number][] = []

    for(let i = x - increment; i <= x + increment; i = i + increment) {
        for (let j = y - increment; j <= y + increment; j = j + increment) {
            if (hasNeighbor(getPipeKey([i, j]))) {
                result.push([i, j])
            }
        }
    }

    return result
}

const countTrash = (groundToExplore: [number, number][], visitedPipes: Set<string>) => {
    const visitedTrash = new Set<string>()

    while (groundToExplore.length > 0) {
        const current = groundToExplore.pop()!

        const key = getPipeKey(current)

        if (!map.has(key) || visitedPipes.has(key)) {
            continue
        }

        visitedTrash.add(key)

        groundToExplore.push(...getNeighbors(current, value => value !== getPipeKey(current)).filter((value => !visitedTrash.has(getPipeKey(value)))))
    }

    return visitedTrash.size
}

const calculateTurnAngle = (previous: [number, number], current: [number, number], next: [number, number]) => {
    const a1_radians = Math.atan2(current[1] - previous[1], current[0] - previous[0])
    const a2_radians = Math.atan2(next[1] - current[1], next[0] - current[0])

    const a1 = Math.round(a1_radians * 180/Math.PI)
    const a2 = Math.round(a2_radians * 180/Math.PI)

    const normalize = (x: number) => Math.round((x + 360) % 360)

    return normalize(normalize(a1) - normalize(a2))
}

const addVector = (point: [number, number], vector: [number, number]): [number, number] => {
    return [point[0] + vector[0], point[1] + vector[1]]
}

const absolutePoints = [-1, 0, 1].flatMap(x => [-1, 0, 1].map(y => [x, y] as [number, number]))

const run = async () => {
    const input = createInterface(createReadStream("day-10/input"))

    let startingPoint: [number, number] = [0, 0]

    let y = 0
    let x = 0
    for await (const line of input) {
        for (x = 0; x < line.length; x++) {
            const point = line[x]
            
            map.set(getPipeKey([x,y]), point)

            if (point === '|') pipelines.set(getPipeKey([x, y]), { point1: [x, y-1], point2: [x, y+1], pipeType: point, cords: [x, y] })
            else if (point === '-') pipelines.set(getPipeKey([x, y]), { point1: [x-1, y], point2: [x+1, y], pipeType: point, cords: [x, y] })
            else if (point === 'L') pipelines.set(getPipeKey([x, y]), { point1: [x, y-1], point2: [x+1, y], pipeType: point, cords: [x, y] })
            else if (point === 'J') pipelines.set(getPipeKey([x, y]), { point1: [x-1, y], point2: [x, y-1], pipeType: point, cords: [x, y] })
            else if (point === '7') pipelines.set(getPipeKey([x, y]), { point1: [x-1, y], point2: [x, y+1], pipeType: point, cords: [x, y] })
            else if (point === 'F') pipelines.set(getPipeKey([x, y]), { point1: [x, y+1], point2: [x+1, y], pipeType: point, cords: [x, y] })
            else if (point === 'S') startingPoint = [x, y]
        }

        y++
    }

    let nextPipes = Array.from(pipelines.values()).filter(pipe => (pipe.point1[0] === startingPoint[0] && pipe.point1[1] === startingPoint[1]) || (pipe.point2[0] === startingPoint[0] && pipe.point2[1] === startingPoint[1]))
    pipelines.set(getPipeKey(startingPoint), { point1: nextPipes[0].cords, point2: nextPipes[1].cords, pipeType: 'S', cords: startingPoint })

    let leftTrash = new Map<string, [number, number]>()
    let rightTrash = new Map<string, [number, number]>()
    console.log(leftTrash)
    let cumulativeTurnAngle = 0

    const visitedPipes = new Set<string>()
    let currentPoint = startingPoint
    let step = 0
    let previousPoint: [number, number] = nextPipes[0].cords
    while (!visitedPipes.has(getPipeKey(currentPoint))) {
        const currentPipe = pipelines.get(getPipeKey(currentPoint))!

        const nextPoint = currentPipe.point1[0] === previousPoint[0] && currentPipe.point1[1] === previousPoint[1] 
            ? currentPipe.point2
            : currentPipe.point1

        const turnAngle = calculateTurnAngle(previousPoint, currentPoint, nextPoint)

        const previosPointRelative = [previousPoint[0] - currentPoint[0] , previousPoint[1] - currentPoint[1]]

        let leftTrashAbsolute: [number, number][] = []
        let rightTrashAbsolute: [number, number][] = []

        if (previosPointRelative[0] === 0) {
            leftTrashAbsolute.push(...absolutePoints.filter(value => value[0] === previosPointRelative[1] * -1))
            rightTrashAbsolute.push(...absolutePoints.filter(value => value[0] === previosPointRelative[1]))

            if (turnAngle === 270) {
                leftTrashAbsolute.push(...absolutePoints.filter(value => value[1] === previosPointRelative[1] * -1))
                rightTrashAbsolute = rightTrashAbsolute.filter(value => !leftTrashAbsolute.includes(value))
                cumulativeTurnAngle++
            } else if (turnAngle === 90) {
                rightTrashAbsolute.push(...absolutePoints.filter(value => value[1] === previosPointRelative[1] * -1))
                leftTrashAbsolute = leftTrashAbsolute.filter(value => !rightTrashAbsolute.includes(value))
                cumulativeTurnAngle--
            }
        }
        else if (previosPointRelative[1] === 0) {
            leftTrashAbsolute.push(...absolutePoints.filter(value => value[1] === previosPointRelative[0]))
            rightTrashAbsolute.push(...absolutePoints.filter(value => value[1] === previosPointRelative[0] * -1))

            if (turnAngle === 270) {
                leftTrashAbsolute.push(...absolutePoints.filter(value => value[0] === previosPointRelative[0] * -1))
                rightTrashAbsolute = rightTrashAbsolute.filter(value => !leftTrashAbsolute.includes(value))
                cumulativeTurnAngle++
            } else if (turnAngle === 90) {
                rightTrashAbsolute.push(...absolutePoints.filter(value => value[0] === previosPointRelative[0] * -1))
                leftTrashAbsolute = leftTrashAbsolute.filter(value => !rightTrashAbsolute.includes(value))
                cumulativeTurnAngle--
            }
        }

        leftTrashAbsolute
            .map(value => addVector(currentPoint, value))
            .forEach(value => leftTrash.set(getPipeKey(value), value))

        rightTrashAbsolute
            .map(value => addVector(currentPoint, value))
            .forEach(value => rightTrash.set(getPipeKey(value), value))

        visitedPipes.add(getPipeKey(currentPoint))  

        previousPoint = currentPoint
        currentPoint = nextPoint
        step++
    }

    let question1 = Math.ceil(step / 2)

    console.log(question1)

    const question2 = countTrash(Array.from(cumulativeTurnAngle > 0 ? rightTrash.values() : leftTrash.values()), visitedPipes)

    console.log(question2)
}

run()