import { createReadStream } from "fs"
import { createInterface } from "readline"

const findDistanceLimit = (start: number, end: number, limit: number, length: number, order: 'asc' | 'desc'): [number, number] => {
    if (start + 1 >= end) {
        return [start, end]
    }

    const mid = Math.ceil((end - start) / 2) + start
    const distance = (length - mid) * mid

    if (limit === distance) {
        return [mid, mid]
    } else if (limit > distance) {
        return order === 'asc' 
            ? findDistanceLimit(mid, end, limit, length, order)
            : findDistanceLimit(start, mid, limit, length, order)
    }
    else {
        return order === 'asc'  
            ? findDistanceLimit(start, mid, limit, length, order)
            : findDistanceLimit(mid, end, limit, length, order)
    }
}

const run = async () => {
    const input = createInterface(createReadStream("day-6/input"))

    let time: number[] = []
    let distance: number[] = []

    for await (const line of input) {
        const [title, content] = line.split(':')

        const numbers = content.trim().split(/\ +/).map(value => parseInt(value))

        if (title === 'Time') {
            time = numbers
        }
        else if (title === 'Distance') {
            distance = numbers
        }
    }

    let question1 = 1

    for (let game = 0; game < time.length; game++) {
        const front = findDistanceLimit(0, time[game] / 2, distance[game], time[game], 'asc')
        const back = findDistanceLimit(Math.ceil(time[game] / 2), time[game], distance[game], time[game], 'desc')

        question1 = question1 * (((back[0] - (back[0] === back[1] ? 1 : 0)) - (front[1] + (front[0] === front[1] ? 1 : 0))) + 1)
    }
    
    console.log(question1)

    let question2 = 0

    const singleTime = parseInt(time.reduce((value, current) => value + current.toString(), ""))
    const singleDistance = parseInt(distance.reduce((value, current) => value + current.toString(), ""))

    const front = findDistanceLimit(0, singleTime / 2, singleDistance, singleTime, 'asc')
    const back = findDistanceLimit(Math.ceil(singleTime / 2), singleTime, singleDistance, singleTime, 'desc')

    question2 = (((back[0] - (back[0] === back[1] ? 1 : 0)) - (front[1] + (front[0] === front[1] ? 1 : 0))) + 1)

    console.log(question2)
}

run()