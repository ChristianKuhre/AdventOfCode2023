import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"

function* getDirection (directionString: string) {
    let currentDirectionIndex = 0

    while(true) {
        if (currentDirectionIndex >= directionString.length){
            currentDirectionIndex = 0
        }

        yield { direction: directionString.charAt(currentDirectionIndex), index: currentDirectionIndex }

        currentDirectionIndex++
    }
}

let directionString = ""
const nodes = new Map<string, [string, string]>()

const getEndNodes = (startNode: string, directionString: string, isEndNode: (node: string) => boolean): [string, number, number][] => {
    const endNodes: [string, number, number][] = []
    const directions = getDirection(directionString)

    let node = startNode
    let step = 0

    while (true) {
        const { direction, index } = directions.next().value!

        if (endNodes.some(value => value[0] === node && value[1] === index)) {
            return endNodes
        }

        if (isEndNode(node)) {
            endNodes.push([node, index, step])
        }

        node = nodes.get(node)![direction === 'L' ? 0 : 1]
        step++
    }
}

function greatestCommonDivisor(a: number, b: number) 
{ 
    if (b == 0) return a; 
    return greatestCommonDivisor(b, a % b); 
} 
 
const run = async () => {
    const input = createInterface(createReadStream("day-8/input"))

    let index = 1
    for await (const line of input) {
        if (index === 1) {
            directionString = line
        } else if (index > 2) {
            const [node, paths] = line.split(" = ")

            const pathsMatch = paths.match(/\((\w+), (\w+)\)/)

            nodes.set(node, [pathsMatch![1], pathsMatch![2]])
        }

        index++
    }

    let endNodes = getEndNodes('AAA', directionString, node => node === 'ZZZ')

    let question1 = endNodes[0][2]

    console.log(question1)

    const startNodes = Array.from(nodes.keys()).filter(value => value.endsWith('A'))
    const nodePaths: number[] = []

    for (const startNode of startNodes) {
        const endNodes = getEndNodes(startNode, directionString, node => node.endsWith('Z'))
        nodePaths.push(endNodes.map(value => value[2])[0])
    }

    console.log(nodePaths)

    // Initialize result 
    let question2 = nodePaths[0]; 
 
    for (let i = 1; i < nodePaths.length; i++) {
        question2 = (nodePaths[i] * question2) / greatestCommonDivisor(nodePaths[i], question2); 
    }

    console.log(question2)
}

run()