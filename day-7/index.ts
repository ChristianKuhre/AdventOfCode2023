import { createReadStream } from "fs"
import { createInterface } from "readline"

type Hand = {
    cards: string
    bid: number
}

const cardValues1 = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]

const cardValues2 = ["A", "K", "Q", "T", "9", "8", "7", "6", "5", "4", "3", "2", "J"]

const handValues = [
    /(\w)\1{4}/,
    /(\w)\1{3}/,
    /(?:(\w)\1{2}(\w)\2{1})|(?:(\w)\3{1}(\w)\4{2})/,
    /(\w)\1{2}/,
    /(\w)\1{1}\w?(\w)\2{1}/,
    /(\w)\1{1}/,
    /\w+/
]

const getHandValue1 = (hand: Hand) => {
    const cardSort = [...hand.cards].sort().reduce((value, current) => value + current, "")
    return handValues.findIndex((value) => cardSort.match(value))
}

const getHandValue2 = (hand: Hand) => {
    const handSort = [...hand.cards].sort().reduce((value, current) => value + current, "")

    const bestPair = (Array.from(handSort.matchAll(/(\w)\1{1,}/g))
        .map(value => value[0])
        .filter(value => value[0] !== 'J')
        .sort((a, b) => a.length > b.length ? -1 : 1)[0])

    const bestCard = bestPair ? bestPair[0] : handSort[0]

    const newHandSort = [...handSort.replace(/J/g, bestCard)].sort().reduce((value, current) => value + current, "")

    return handValues.findIndex((value) => newHandSort.match(value))
}

const handSortFn = (getHandValue: (hand: Hand) => number, cardValues: string[]) => (hand1: Hand, hand2: Hand) => {
    const hand1Value = getHandValue(hand1)
    const hand2Value = getHandValue(hand2)

    if (hand1Value < hand2Value) {
        return 1
    } else if (hand1Value > hand2Value) {
        return -1
    } else {
        for (let i = 0; i < hand1.cards.length; i++) {
            const card1Value = cardValues.findIndex(value => hand1.cards.charAt(i) === value)
            const card2Value = cardValues.findIndex(value => hand2.cards.charAt(i) === value)

            if (card1Value < card2Value) {
                return 1
            } else if (card1Value > card2Value) {
                return -1
            }
        }

        return 0
    }
}

const run = async () => {
    const input = createInterface(createReadStream("day-7/input"))

    const hands: Hand[] = []

    for await (const line of input) {
        const [hand, bid] = line.split(" ")

        hands.push({
            cards: hand,
            bid: parseInt(bid)
        })
    }

    hands.sort(handSortFn(getHandValue1, cardValues1))

    let question1 = hands.reduce((value, current, i) => value + (current.bid * (i + 1)), 0)

    console.log(question1)

    hands.sort(handSortFn(getHandValue2, cardValues2))

    let question2 = hands.reduce((value, current, i) => value + (current.bid * (i + 1)), 0)

    console.log(question2)
}

run()