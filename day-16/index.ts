import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"
 
const getMirrorKey = ([x, y]: [number, number]) => `${x},${y}`

const getSquareKey = ([x, y]: [number, number], [dirX, dirY]: [number, number]) => `${x},${y}|${dirX},${dirY}`

const addDirection = (point: [number, number], direction: [number, number]): [number, number] => [point[0] + direction[0], point[1] + direction[1]]

const followLight = (start: [number, number], dir: [number,number], mirrors: Map<string, string>, width: number, height: number) => {
    const visitedSquares = new Set<string>()

    let beams: [[number, number], [number, number]][] = [[start, dir]]

    while (beams.length > 0) {
        let newBeams: [[number, number], [number, number]][] = []

        for (const [point, direction] of beams) {
            if (point[0] < 0 || point[0] >= width || point[1] < 0 || point[1] >= height || visitedSquares.has(getSquareKey(point, direction))) {
                continue
            }

            visitedSquares.add(getSquareKey(point, direction))

            const mirror = getMirrorKey(point)

            if (!mirrors.has(mirror)) {
                newBeams.push([addDirection(point, direction), direction])
            } else if (mirrors.get(mirror) === '/') {
                const newDirection: [number, number] = [direction[1] * -1, direction[0] * -1]
                newBeams.push([addDirection(point, newDirection), newDirection])
            } else if (mirrors.get(mirror) === '\\') {
                const newDirection: [number, number] = [direction[1], direction[0]]
                newBeams.push([addDirection(point, newDirection), newDirection])
            } else if (mirrors.get(mirror) === '-') {
                if (direction[1] !== 0) {
                    newBeams.push([addDirection(point, [1, 0]), [1, 0]])
                    newBeams.push([addDirection(point, [-1, 0]), [-1, 0]])
                } else {
                    newBeams.push([addDirection(point, direction), direction])
                }
            } else if (mirrors.get(mirror) === '|') {
                if (direction[0] !== 0) {
                    newBeams.push([addDirection(point, [0, 1]), [0, 1]])
                    newBeams.push([addDirection(point, [0, -1]), [0, -1]])
                } else {
                    newBeams.push([addDirection(point, direction), direction])
                }
            } else {
                throw new Error("Bad mirror?")
            }
        }

        beams = newBeams
    }

    return new Set([...visitedSquares.values()].map(value => value.split('|')[0])).size
}

const run = async () => {
    const input = createInterface(createReadStream("day-16/input"))

    const mirrors = new Map<string, string>()

    let y = 0
    let x = 0
    for await (const line of input) {
        for(x = 0; x < line.length; x++) {
            if (line[x] !== '.') {
                mirrors.set(getMirrorKey([x,y]), line[x])
            }
        }

        y++
    }

    const question1 = followLight ([0, 0], [1, 0], mirrors, x, y)

    console.log(question1)

    const top = [...Array(x).keys()].map((value: number): [[number, number], [number, number]] => [[value, 0], [0, 1]])
    const bot = [...Array(x).keys()].map((value: number): [[number, number], [number, number]]  => [[value, y - 1], [0, -1]])
    const right = [...Array(y).keys()].map((value: number): [[number, number], [number, number]]  => [[x - 1, value], [-1, 0]])
    const left = [...Array(y).keys()].map((value: number): [[number, number], [number, number]]  => [[0, value], [1, 0]])

    let question2 = 0

    for (const light of [...top, ...bot, ...right, ...left]) {
        question2 = Math.max(question2, followLight(light[0], light[1], mirrors, x, y))
    }

    console.log(question2)
}

run()
