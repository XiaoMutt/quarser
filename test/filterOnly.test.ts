import { expect, test } from 'vitest'
import { FILTER_NODE_TYPE, FILTER_OPERATOR, parseQuery } from '../src/index'


test('filter only', () => {

    // null value
    expect(parseQuery('`key`: null')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["key"],
                start: 0,
                stop: 5,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [null],
                start: 7,
                stop: 11,
                isValid: true
            }
        ],
        start: 0,
        stop: 11,
        isValid: true
    })

    // true value
    expect(parseQuery('`abc`: true')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["abc"],
                start: 0,
                stop: 5,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [true],
                start: 7,
                stop: 11,
                isValid: true
            }
        ],
        start: 0,
        stop: 11,
        isValid: true
    })

    // false value
    expect(parseQuery('`def`: false')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["def"],
                start: 0,
                stop: 5,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [false],
                start: 7,
                stop: 12,
                isValid: true
            }
        ],
        start: 0,
        stop: 12,
        isValid: true
    })


    // integer
    expect(parseQuery('`int`: 42')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["int"],
                start: 0,
                stop: 5,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [42],
                start: 7,
                stop: 9,
                isValid: true
            }
        ],
        start: 0,
        stop: 9,
        isValid: true
    })

    // float: regular
    expect(parseQuery('`eular`: 2.782818')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["eular"],
                start: 0,
                stop: 7,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 7,
                stop: 8,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [2.782818],
                start: 9,
                stop: 17,
                isValid: true
            }
        ],
        start: 0,
        stop: 17,
        isValid: true
    })

    // float: regular
    expect(parseQuery('`nano`: 1e-9')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["nano"],
                start: 0,
                stop: 6,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 6,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: [1e-9],
                start: 8,
                stop: 12,
                isValid: true
            }
        ],
        start: 0,
        stop: 12,
        isValid: true
    })


    // float: regular
    expect(parseQuery('`string`: "abc"')).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [
            {
                type: FILTER_NODE_TYPE.KEY,
                children: ["string"],
                start: 0,
                stop: 8,
                isValid: true

            },
            {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [FILTER_OPERATOR.FUZZY_MATCH],
                start: 8,
                stop: 9,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 10,
                stop: 15,
                isValid: true
            }
        ],
        start: 0,
        stop: 15,
        isValid: true
    })
})

