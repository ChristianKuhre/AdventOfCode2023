import { createReadStream } from "fs"
import { createInterface } from "readline"

enum Category {
    seed,
    soil,
    fertilizer,
    water,
    light,
    temperature,
    humidity,
    location,
}

type Conversion = {
    category: Category,
    ranges: [number, number, number][]
}

const findCategoryValue = (value: number, source: Category, destination: Category, conversions: Map<Category, Conversion>): number => {
    if (source === destination) {
        return value
    }

    const conversion = conversions.get(source)!

    const range = conversion.ranges.find(range => value >= range[0] && value < range[0] + range[2])

    const next = range ? range[1] + value - range[0] : value

    return findCategoryValue(next, conversion.category, destination, conversions)
}

const run = async () => {
    const input = createInterface(createReadStream("day-5/input"))

    const conversions = new Map<Category, Conversion>()
    const backwardsConversions = new Map<Category, Conversion>()

    let seeds: number[] = []

    let currentConversion: [Category, Category] | undefined = undefined

    for await (const line of input) {
        if (line.match(/seeds:/)) {
            seeds = line.split(':')[1].trim().split(' ').map(value => parseInt(value))
        }
        else if (currentConversion) {
            if (line === "") {
                currentConversion = undefined
            }
            else {
                const [destination, source, length] = line.split(' ')

                conversions.get(currentConversion[0])?.ranges.push([parseInt(source), parseInt(destination), parseInt(length)])
                backwardsConversions.get(currentConversion[1])?.ranges.push([parseInt(destination), parseInt(source), parseInt(length)])
            }
        }
        else {
            const conversionSection = line.match(/(?<source>[a-z]+)-to-(?<destination>[a-z]+) map:/)

            if (conversionSection) {
                currentConversion = [Category[conversionSection.groups!.source as keyof typeof Category], Category[conversionSection.groups!.destination as keyof typeof Category]]

                conversions.set(currentConversion[0], { category: currentConversion[1], ranges: [] })
                backwardsConversions.set(currentConversion[1], { category: currentConversion[0], ranges: [] })
            }
        }
    }

    let question1 = Infinity

    for (const seed of seeds) {
        question1 = Math.min(findCategoryValue(seed, Category.seed, Category.location, conversions), question1)
    }

    console.log(question1)

    const seedRanges: [number, number][] = [] 

    for (let i = 0; i < seeds.length; i += 2) {
        seedRanges.push([seeds[i], seeds[i] + seeds[i + 1] - 1])
    }

    let question2: number | undefined = undefined
    let location = 0

    while (question2 === undefined) {
        const seedValue = findCategoryValue(location, Category.location, Category.seed, backwardsConversions)

        if (seedRanges.some(range => seedValue >= range[0] && seedValue <= range[1])) {
            question2 = location
        }
        else {
            location++
        }
    }

    console.log(question2)
}

run()