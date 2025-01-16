import { expect, test } from 'vitest'
import { FILTER_NODE_TYPE, FILTER_OPERATOR, parseQuery } from '../src/index'

test('filter operator only', () => {
    // less equal to
    expect(parseQuery('`key` startswith "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.STARTSWITH],
                start: 6,
                stop: 16,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 17,
                stop: 22,
                isValid: true
            }
        ],
        start: 0,
        stop: 22,
        isValid: true
    })

    // less equal to
    expect(parseQuery('`key`<= "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.LESS_EQUAL],
                start: 5,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 8,
                stop: 13,
                isValid: true
            }
        ],
        start: 0,
        stop: 13,
        isValid: true
    })


    // equal to
    expect(parseQuery('`key`endswith "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.ENDSWITH],
                start: 5,
                stop: 13,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 14,
                stop: 19,
                isValid: true
            }
        ],
        start: 0,
        stop: 19,
        isValid: true
    })

    // less equal to
    expect(parseQuery('`key`== "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.EQUAL_TO],
                start: 5,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 8,
                stop: 13,
                isValid: true
            }
        ],
        start: 0,
        stop: 13,
        isValid: true
    })


    // less equal to
    expect(parseQuery('`key`<= "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.LESS_EQUAL],
                start: 5,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 8,
                stop: 13,
                isValid: true
            }
        ],
        start: 0,
        stop: 13,
        isValid: true
    })


    // greater equal to
    expect(parseQuery('`key`>= "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.GREATER_EQUAL],
                start: 5,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 8,
                stop: 13,
                isValid: true
            }
        ],
        start: 0,
        stop: 13,
        isValid: true
    })


    // unequal to
    expect(parseQuery('`key`!= "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.UNEQUAL_TO],
                start: 5,
                stop: 7,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 8,
                stop: 13,
                isValid: true
            }
        ],
        start: 0,
        stop: 13,
        isValid: true
    })

    // less than
    expect(parseQuery('`key`< "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.LESS_THAN],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 7,
                stop: 12,
                isValid: true
            }
        ],
        start: 0,
        stop: 12,
        isValid: true
    })


    // greater than
    expect(parseQuery('`key`> "abc"')).toEqual({
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
                children: [FILTER_OPERATOR.GREATER_THAN],
                start: 5,
                stop: 6,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.VALUE,
                children: ["abc"],
                start: 7,
                stop: 12,
                isValid: true
            }
        ],
        start: 0,
        stop: 12,
        isValid: true
    })

    // fuzzy match
    expect(parseQuery('`key`: "abc"')).toEqual({
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
                children: ["abc"],
                start: 7,
                stop: 12,
                isValid: true
            }
        ],
        start: 0,
        stop: 12,
        isValid: true
    })
})