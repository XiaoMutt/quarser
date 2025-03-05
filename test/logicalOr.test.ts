import {expect, test} from 'vitest'
import {parseQuery,} from '../src'
import {
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";
import {LOGICAL_OPERATOR, ParsedLogicalOrNode, ParsedRawLogicalOperatorNode} from "../src/logical";


test('nicked value only', () => {
    expect(parseQuery('abc or def')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 4, 6),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 0, 0),
                new ParsedRawFilterKeyNode(null, 0, 0),
                new ParsedRawFilterValueNode("abc", 0, 3)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 7, 7),
                new ParsedRawFilterKeyNode(null, 7, 7),
                new ParsedRawFilterValueNode("def", 7, 10)
            ),
        )
    )
})

test('quoted value only', () => {
    expect(parseQuery('"abc" or "def"')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 6, 8),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 0, 0),
                new ParsedRawFilterKeyNode(null, 0, 0),
                new ParsedRawFilterValueNode("abc", 0, 5)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 9, 9),
                new ParsedRawFilterKeyNode(null, 9, 9),
                new ParsedRawFilterValueNode("def", 9, 14)
            ),
        )
    )
})


test('filter and value only filter', () => {
    expect(parseQuery('`key`: "abc" or "def"')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 13, 15),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 5, 6),
                new ParsedRawFilterKeyNode("key", 0, 5),
                new ParsedRawFilterValueNode("abc", 7, 12)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 16, 16),
                new ParsedRawFilterKeyNode(null, 16, 16),
                new ParsedRawFilterValueNode("def", 16, 21)
            ),
        )
    )
})


test('filter and filter', () => {
    expect(parseQuery('`key`: "abc" or `field`:"def"')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 13, 15),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 5, 6),
                new ParsedRawFilterKeyNode("key", 0, 5),
                new ParsedRawFilterValueNode("abc", 7, 12)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 23, 24),
                new ParsedRawFilterKeyNode("field", 16, 23),
                new ParsedRawFilterValueNode("def", 24, 29)
            ),
        )
    )
})

test('filter and filter and filter', () => {
    expect(parseQuery('`start`: 12 or `key`: "abc" or `field`:"def"')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 12, 14),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 7, 8),
                new ParsedRawFilterKeyNode("start", 0, 7),
                new ParsedRawFilterValueNode(12, 9, 11)
            ),
            new ParsedLogicalOrNode(
                new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 28, 30),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(':', 20, 21),
                    new ParsedRawFilterKeyNode("key", 15, 20),
                    new ParsedRawFilterValueNode("abc", 22, 27)
                ),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(':', 38, 39),
                    new ParsedRawFilterKeyNode("field", 31, 38),
                    new ParsedRawFilterValueNode("def", 39, 44)
                ),
            )
        ))
})