import { createReadStream } from "fs"
import { createInterface } from "readline"

type EngineNumber = {
    value: number,
    line: number,
    range: [number, number]
}

const getEngineNumber = (start: number, lineNumber: number, line: string[]): EngineNumber => {
    let result = ""
    let index = start

    while (line[index] && line[index].match(/[0-9]/)) {
        result += line[index]
        index++
    }

    return {
        value: parseInt(result),
        line: lineNumber,
        range: [start, index - 1]
    }
}

const isEnginePart = (x: number, y: number, engineSymbols: Set<string>) => {
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (engineSymbols.has(`${i},${j}`)) {
                return true
            }
        }
    }

    return false
}

const run = async () => {
    const input = createInterface(createReadStream("day-3/input"))

    const engineNumbers: EngineNumber[] = []
    const engineSymbols = new Set<string>()
    const engineGears: [number, number][] = []

    let lineNumber = 0
    for await (const line of input) {
        const chars = [...line]

        for (let i = 0; i < chars.length; i++) {
            
            if (chars[i].match(/[0-9]/)) {
                const engineNumber = getEngineNumber(i, lineNumber, chars)
                engineNumbers.push(engineNumber)
                i = engineNumber.range[1]
            }
            else if (chars[i].match(/[-!$%^&*@()_+|~=`{}\[\]:";'<>?,\/#]/)) {
                engineSymbols.add(`${lineNumber},${i}`)

                if (chars[i].match(/\*/)) {
                    engineGears.push([lineNumber, i])
                }
            }
        }

        lineNumber++
    }

    const engineGearNumbers = new Map<string, EngineNumber>()

    let question1 = 0

    for (const engineNumber of engineNumbers) {
        for (let i = engineNumber.range[0]; i <= engineNumber.range[1]; i++) {
            engineGearNumbers.set(`${engineNumber.line},${i}`, engineNumber)

            if (isEnginePart(engineNumber.line, i, engineSymbols)) {
                question1 += engineNumber.value
                break
            }
        }
    }

    console.log(question1)

    let question2 = 0

    for (const engineGear of engineGears) {
        const gearParts = new Set<EngineNumber>()

        for (let i = engineGear[0] - 1; i <= engineGear[0] + 1; i++) {
            for (let j = engineGear[1] - 1; j <= engineGear[1] + 1; j++) {
                const gearPart = engineGearNumbers.get(`${i},${j}`)

                if (gearPart) gearParts.add(gearPart)
            }
        }

        if (gearParts.size === 2) {
            question2 += Array.from(gearParts.values()).reduce((current, value) => current * value.value, 1)
        }
    }

    console.log(question2)
}

run()