import { expect, test } from 'vitest'
import { FILTER_NODE_TYPE, FILTER_OPERATOR, parseQuery } from '../src/index'

test('value only', () => {
    // null
    expect(parseQuery(`null`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [null],
            start: 0,
            stop: 4,
            isValid: true
        }],
        start: 0,
        stop: 4,
        isValid: true

    })

    // boolean: true
    expect(parseQuery(`true`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [true],
            start: 0,
            stop: 4,
            isValid: true
        }],
        start: 0,
        stop: 4,
        isValid: true
    })

    // boolean: false
    expect(parseQuery(`false`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [false],
            start: 0,
            stop: 5,
            isValid: true
        }],
        start: 0,
        stop: 5,
        isValid: true
    })


    // integer
    expect(parseQuery(`42`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [42],
            start: 0,
            stop: 2,
            isValid: true
        }],
        start: 0,
        stop: 2,
        isValid: true

    })

    // float: regular
    expect(parseQuery(`3.1415926`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [3.1415926],
            start: 0,
            stop: 9,
            isValid: true
        }],
        start: 0,
        stop: 9,
        isValid: true

    })

    // float scientific
    expect(parseQuery(`1e-2`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: [0.01],
            start: 0,
            stop: 4,
            isValid: true
        }],
        start: 0,
        stop: 4,
        isValid: true

    })



    expect(parseQuery(`"abc"`)).toEqual({
        type: FILTER_NODE_TYPE.FILTER,
        children: [null, null, {
            type: FILTER_NODE_TYPE.VALUE,
            children: ["abc"],
            start: 0,
            stop: 5,
            isValid: true
        }],
        start: 0,
        stop: 5,
        isValid: true

    })
})