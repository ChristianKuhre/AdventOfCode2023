import { createReadStream } from "fs"
import { createInterface } from "readline"

type Card = {
    id: number
    winning: number[]
    numbers: number[]
}

const run = async () => {
    const input = createInterface(createReadStream("day-4/input"))

    const cards = new Map<number, Card>()

    for await (const line of input) {
        const [cardId, ticket] = line.split(":")
        const [winning, numbers] = ticket.trim().split("|")

        const card: Card = {
            id: parseInt(cardId.trim().split(/\ +/)[1]),
            winning: winning.trim().split(/\ +/).map(value => parseInt(value)).sort((a, b) => a > b ? 1 : -1),
            numbers: numbers.trim().split(/\ +/).map(value => parseInt(value)).sort((a, b) => a > b ? 1 : -1),
        }

        cards.set(card.id, card)
    }

    let question1 = 0

    let cardPile = Array.from(cards.values())

    for (const card of cardPile) {
        const winners = card.numbers.filter(value => card.winning.includes(value))

        if (winners.length > 0) question1 += Math.pow(2, winners.length - 1)
    }

    console.log(question1)

    let question2 = 0

    let currentCardRewards = Array.from(cards.values())

    while (currentCardRewards.length > 0) {
        question2 += currentCardRewards.length

        const newCardRewards: Card[] = []

        for (const cardReward of currentCardRewards) {
            const winners = cardReward.numbers.filter(value => cardReward.winning.includes(value))

            const nextCardId = cardReward.id + 1

            for (let i = nextCardId; i < nextCardId + winners.length; i++) {
                newCardRewards.push(cards.get(i)!)
            }
        }

        currentCardRewards = newCardRewards
    }

    console.log(question2)
}

run()