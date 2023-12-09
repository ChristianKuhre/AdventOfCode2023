import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"

type Node = {
    index: number
    depth: number
    value: number
}

const getSequenceMap = (sequence: number[]) => {
    const sequenceMap = new Map<string, Node>()
    
    let currentDepth = 0
    let subSequence: number[] = sequence

    subSequence.forEach((value, index) => sequenceMap.set(`${currentDepth},${index}`, { index, depth: currentDepth + 1, value  }))

    while (!subSequence.every(value => value === 0)) {
        const newSubSequence: number[] = []

        for (let i = 0; i < subSequence.length - 1; i++) {
            const value = subSequence[i + 1] - subSequence[i]

            sequenceMap.set(`${currentDepth + 1},${i}`, { index: i, depth: currentDepth + 1, value  })

            newSubSequence.push(value)
        }

        subSequence = newSubSequence
        currentDepth++
    }

    return sequenceMap
}

const extrapolateNext = (sequenceMap: Map<string, Node>, depth: number, index: number): number => {
    const previousNumber = sequenceMap.get(`${depth},${index - 1}`)

    if (!sequenceMap.has(`${depth + 1},${index - 2}`)) {
        return 0
    }

    const subNumber = extrapolateNext(sequenceMap, depth + 1, index - 1)

    return previousNumber!.value + subNumber
}

const extrapolatePrevious = (sequenceMap: Map<string, Node>, depth: number): number => {
    const previousNumber = sequenceMap.get(`${depth},${0}`)

    if (!sequenceMap.has(`${depth + 1},${0}`)) {
        return 0
    }

    const subNumber = extrapolatePrevious(sequenceMap, depth + 1)

    return previousNumber!.value - subNumber
}

const run = async () => {
    const input = createInterface(createReadStream("day-9/input"))

    const history: number[][] = []

    for await (const line of input) {
        history.push(line.split(" ").map(value => parseInt(value)))
    }

    let question1 = 0

    for (const sequence of history) {
        const sequenceMap = getSequenceMap(sequence)

        question1 += extrapolateNext(sequenceMap, 0, sequence.length)
    }

    console.log(question1)

    let question2 = 0

    for (const sequence of history) {
        const sequenceMap = getSequenceMap(sequence)

        question2 += extrapolatePrevious(sequenceMap, 0)
    }

    console.log(question2)
}

run()