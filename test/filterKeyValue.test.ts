import { expect, test } from 'vitest'

import {
    parseQuery,
} from '../src'
import {
    FILTER_OPERATOR,
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";

test('null value', () => {
    // null value      012345678901
    expect(parseQuery('`key`: null')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(null, 7, 11)
        )
    )
})

test('true value', () => {
    // true value
    expect(parseQuery('`key`: true')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(true, 7, 11)
        )
    )
})

test('false value', () => {
    // false value
    expect(parseQuery('`key`: false')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(false, 7, 12)
        )
    )
})

test('int value', () => {
    // integer
    expect(parseQuery('`int`: 42')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("int", 0, 5),
            new ParsedRawFilterValueNode(42, 7, 9)
        )
    )
})

test('float value regular', () => {
    // float: regular
    expect(parseQuery('`eular`: 2.782818')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 7, 8),
            new ParsedRawFilterKeyNode("eular", 0, 7),
            new ParsedRawFilterValueNode(2.782818, 9, 17)
        )
    )
})

test('float value: scientific', () => {
    // float: scientific
    expect(parseQuery('`nano`: 1e-9')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 6, 7),
            new ParsedRawFilterKeyNode("nano", 0, 6),
            new ParsedRawFilterValueNode(1e-9, 8, 12)
        )
    )
})

test('string value nicked', () => {
    // string nicked
    expect(parseQuery('`key`: abc')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 7, 10)
        )
    )
})

test('string value quoted', () => {
    // string quoted
    expect(parseQuery('`key`: "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 5, 6),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 7, 12)
        )
    )
})

test('in string array value', () => {
    // string quoted
    expect(parseQuery('`key` in ["abc", "def"]')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.IN, 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(["abc", "def"], 9, 23)
        )
    )
})

test('in mixed array value', () => {
    // string quoted
    expect(parseQuery('`key` in ["abc", true, null, 1.324]')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.IN, 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(["abc", true, null, 1.324], 9, 35)
        )
    )
})


test('in invalid array: empty comma', () => {
    // string quoted
    expect(parseQuery('`key` in ["abc", true,, 1.324]')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.IN, 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            undefined
        )
    )
})
test('in invalid array: trailing comma value', () => {
    // string quoted
    expect(parseQuery('`key` in ["abc", true, null, 1.324,]')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.IN, 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            undefined
        )
    )
})

test('in invalid array value', () => {
    // string quoted
    expect(parseQuery('`key` in ["abc", true, null')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.IN, 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            undefined
        )
    )
})
test('not in string array value', () => {
    // string quoted
    expect(parseQuery('`key` !in ["abc", "def"]')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.NOT_IN, 6, 9),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode(["abc", "def"], 10, 24)
        )
    )
})

