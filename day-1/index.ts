import { createReadStream } from "fs"
import { createInterface } from "readline"

const getStringDigit = (str: string, dir: number) => {
    if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}one${dir > 0 ? ".*" : ""}$`))) return 1
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}two${dir > 0 ? ".*" : ""}$`))) return 2
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}three${dir > 0 ? ".*" : ""}$`))) return 3
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}four${dir > 0 ? ".*" : ""}$`))) return 4
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}five${dir > 0 ? ".*" : ""}$`))) return 5
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}six${dir > 0 ? ".*" : ""}$`))) return 6
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}seven${dir > 0 ? ".*" : ""}$`))) return 7
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}eight${dir > 0 ? ".*" : ""}$`))) return 8
    else if (str.match(new RegExp(`^${dir < 0 ? ".*" : ""}nine${dir > 0 ? ".*" : ""}$`))) return 9
    else return undefined
}


const run = async () => {
    const input = createInterface(createReadStream("day-1/input"))

    const values: number[] = []
    
    for await (const line of input) {
        let firstDigit: number | undefined = undefined
        let lastDigit: number | undefined = undefined

        let firstIndex = 0
        let lastIndex = line.length - 1

        while (firstDigit === undefined || lastDigit === undefined) {
            if (firstDigit === undefined) {
                const digit = parseInt(line.charAt(firstIndex))

                if (Number.isFinite(digit)) {
                    firstDigit = digit
                }
                else {
                    const stringDigit = getStringDigit(line.substring(firstIndex, firstIndex + 5), 1)

                    if (stringDigit !== undefined){
                        firstDigit = stringDigit
                    }
                    else {
                        firstIndex++
                    }
                }
            }

            if (lastDigit === undefined) {
                const digit = parseInt(line.charAt(lastIndex))

                if (Number.isFinite(digit)) {
                    lastDigit = digit
                }
                else {
                    const stringDigit = getStringDigit(line.substring(lastIndex - 4, lastIndex + 1), -1)

                    if (stringDigit !== undefined){
                        lastDigit = stringDigit
                    }
                    else {
                        lastIndex--
                    }
                }
            }
        }

        const value = firstDigit.toString() + lastDigit.toString()

        values.push(parseInt(value))
    }

    console.log(values.reduce((count, value) => count + value, 0))
}

run()
