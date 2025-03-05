import { expect, test } from 'vitest'
import {
    parseQuery
} from '../src'
import {
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";


test('null value', () => {
    // null
    expect(parseQuery(`null`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(null, 0, 4)
        ),
    )
})

test('true value', () => {
    // boolean: true
    expect(parseQuery(`true`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(true, 0, 4)
        ),
    )
})

test('false value', () => {
    // boolean: false
    expect(parseQuery(`false`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(false, 0, 5)
        ),
    )
})

test('integer value', () => {
    // integer
    expect(parseQuery(`42`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(42, 0, 2)
        ),
    )
})

test('float value regular', () => {
    // float: regular
    expect(parseQuery(`3.1415926`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(3.1415926, 0, 9)
        ),
    )
})
test('float value scientific', () => {
    // float scientific
    expect(parseQuery(`1e-2`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode(0.01, 0, 4)
        ),
    )
})

test('string value nicked', () => {
    // string nicked
    expect(parseQuery(`abc`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode("abc", 0, 3)
        ),
    )
})

test('string value quoted', () => {
    // string quoted
    expect(parseQuery(`"abc"`)).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(null, 0, 0),
            new ParsedRawFilterKeyNode(null, 0, 0),
            new ParsedRawFilterValueNode("abc", 0, 5)
        ),
    )
})
