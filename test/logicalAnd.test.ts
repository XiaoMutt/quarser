import { expect, test } from 'vitest'
import { FILTER_NODE_TYPE, FILTER_OPERATOR, LOGICAL_OPERATOR, parseQuery } from '../src/index'
import { start } from 'repl'


test('logical and', () => {

    // value only
    expect(parseQuery('"abc" and "def"')).toEqual({
        type: LOGICAL_OPERATOR.AND,
        children: [
            {
                type: FILTER_NODE_TYPE.FILTER,
                children: [
                    null,
                    null,
                    {
                        type: FILTER_NODE_TYPE.VALUE,
                        children: ["abc"],
                        start: 0,
                        stop: 5,
                        isValid: true
                    }
                ],
                start: 0,
                stop: 5,
                isValid: true
            },
            {
                type: FILTER_NODE_TYPE.FILTER,
                children: [
                    null,
                    null,
                    {
                        type: FILTER_NODE_TYPE.VALUE,
                        children: ["def"],
                        start: 10,
                        stop: 15,
                        isValid: true
                    }
                ],
                start: 10,
                stop: 15,
                isValid: true
            }

        ],
        start: 0,
        stop: 15,
        isValid: true
    })

    // filter
    expect(parseQuery('not `key`: "abc"')).toEqual({
        type: LOGICAL_OPERATOR.NOT,
        children: [{
            type: FILTER_NODE_TYPE.FILTER,
            children: [
                {
                    type: FILTER_NODE_TYPE.KEY,
                    children: ["key"],
                    start: 4,
                    stop: 9,
                    isValid: true

                },
                {
                    type: FILTER_NODE_TYPE.OPERATOR,
                    children: [FILTER_OPERATOR.FUZZY_MATCH],
                    start: 9,
                    stop: 10,
                    isValid: true
                },
                {
                    type: FILTER_NODE_TYPE.VALUE,
                    children: ["abc"],
                    start: 11,
                    stop: 16,
                    isValid: true
                }
            ],
            start: 4,
            stop: 16,
            isValid: true
        }],
        start: 0,
        stop: 16,
        isValid: true
    })


    // not with filter
    expect(parseQuery('not not `key`: "abc"')).toEqual({
        type: LOGICAL_OPERATOR.NOT,
        children: [{
            type: LOGICAL_OPERATOR.NOT,
            children: [{
                type: FILTER_NODE_TYPE.FILTER,
                children: [
                    {
                        type: FILTER_NODE_TYPE.KEY,
                        children: ["key"],
                        start: 8,
                        stop: 13,
                        isValid: true

                    },
                    {
                        type: FILTER_NODE_TYPE.OPERATOR,
                        children: [FILTER_OPERATOR.FUZZY_MATCH],
                        start: 13,
                        stop: 14,
                        isValid: true
                    },
                    {
                        type: FILTER_NODE_TYPE.VALUE,
                        children: ["abc"],
                        start: 15,
                        stop: 20,
                        isValid: true
                    }
                ],
                start: 8,
                stop: 20,
                isValid: true
            }],
            start: 4,
            stop: 20,
            isValid: true
        }],
        start: 0,
        stop: 20,
        isValid: true
    })
})

