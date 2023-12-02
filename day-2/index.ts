import { createReadStream } from "fs"
import { createInterface } from "readline"

enum Cube {
    red,
    green,
    blue
}

type CubeCount = [cube: Cube, count: number]

type Game = {
    id: number
    sets: CubeCount[][]
}

const run = async () => {
    const input = createInterface(createReadStream("day-2/input"))

    const games: Game[] = []

    for await (const line of input) {
        const [gameString, sets] = line.split(":")

        const game: Game = {
            id: parseInt(gameString.match(/Game (?<id>[0-9]+)/)!.groups!.id),
            sets: []
        }

        for (const set of sets.split(";")) {
            const cubes = set
                .split(",")
                .map((value) => {
                    const [count, cube] = value.trim().split(" ")
                    return [Cube[cube as keyof typeof Cube], parseInt(count)] as CubeCount
                })

            game.sets.push(cubes)
        }

        games.push(game)
    }

    let question1 = 0
    for (const game of games) {
        if (game.sets.every((set) => {
            const cubeCounts = new Map<Cube, number>([
                [Cube.blue, 0],
                [Cube.red, 0],
                [Cube.green, 0],
            ])

            for (const cubeCount of set) {
                cubeCounts.set(cubeCount[0], cubeCounts.get(cubeCount[0])! + cubeCount[1])
            }

            return cubeCounts.get(Cube.blue)! <= 14 && cubeCounts.get(Cube.green)! <= 13 && cubeCounts.get(Cube.red)! <= 12
        })) {
            question1 += game.id
        }
    }

    console.log(question1)
    
    let question2 = 0
    for (const game of games) {
        const minimumCubeCounts = new Map<Cube, number>([
            [Cube.blue, 0],
            [Cube.red, 0],
            [Cube.green, 0],
        ])

        for (const set of game.sets) {
            const cubeCounts = new Map<Cube, number>([
                [Cube.blue, 0],
                [Cube.red, 0],
                [Cube.green, 0],
            ])

            for (const cubeCount of set) {
                cubeCounts.set(cubeCount[0], cubeCounts.get(cubeCount[0])! + cubeCount[1])
            }

            minimumCubeCounts.set(Cube.blue, Math.max(cubeCounts.get(Cube.blue)!, minimumCubeCounts.get(Cube.blue)!))
            minimumCubeCounts.set(Cube.red, Math.max(cubeCounts.get(Cube.red)!, minimumCubeCounts.get(Cube.red)!))
            minimumCubeCounts.set(Cube.green, Math.max(cubeCounts.get(Cube.green)!, minimumCubeCounts.get(Cube.green)!))
        }

        question2 += minimumCubeCounts.get(Cube.blue)! * minimumCubeCounts.get(Cube.red)! * minimumCubeCounts.get(Cube.green)!
    }

    console.log(question2)
}

run()