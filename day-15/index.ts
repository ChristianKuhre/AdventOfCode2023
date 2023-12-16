import { createReadStream } from "fs"
import { createInterface, clearLine } from "readline"
 
type Lens = {
    value: string
    power: string
    next?: Lens
}

const calculateEncoding = (word: string) => {
    let result = 0

    for (const char of word) {
        result += char.charCodeAt(0);
        result *= 17
        result %= 256
    }
    
    return result
}

const run = async () => {
    const input = createInterface(createReadStream("day-15/input"))

    const words: string[] = []

    for await (const line of input) {
        words.push(...line.split(','))
    }

    const boxes = new Map<number, Lens | undefined>()
    let question1 = 0

    for(const word of words) {        
        question1 += calculateEncoding(word)

        if (word.match(/\w+=[0-9]+/)) {
            const [lens, power] = word.split('=')

            const box = calculateEncoding(lens)
            let currentLens = boxes.get(box)

            if (!currentLens) {
                boxes.set(box, { value: lens, power  })
                continue
            }

            while (currentLens.value !== lens && currentLens.next) {
                currentLens = currentLens.next
            }

            if (currentLens.value === lens) {
                currentLens.power = power
            } else {
                currentLens.next = { value: lens, power }
            }
        } else if ( word.match(/\w+-/)) {
            const lens = word.substring(0, word.length - 1)

            const box = calculateEncoding(lens)
            let currentLens = boxes.get(box)

            if (!currentLens) {
                continue
            }

            let previousLens: Lens | undefined

            while (currentLens) {
                if (currentLens.value === lens) {
                    if (previousLens === undefined) {
                        boxes.set(box, currentLens.next)
                    } else {
                        previousLens.next = currentLens.next
                    }

                    break
                }

                previousLens = currentLens
                currentLens = currentLens.next
            }
        }
    }

    console.log(question1)

    let question2 = 0

    for (const box of boxes.entries()) {
        let currentLens = box[1]
        let slotNumber = 1
        while (currentLens) {
            question2 += ((box[0] + 1) * slotNumber * parseInt(currentLens.power))
            currentLens = currentLens.next
            slotNumber++
        }
    }

    console.log(question2)
}

run()