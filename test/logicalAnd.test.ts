import {expect, test} from 'vitest'
import {parseQuery,} from '../src'
import {
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";
import {LOGICAL_OPERATOR, ParsedLogicalAndNode, ParsedRawLogicalOperatorNode} from "../src/logical";


test('nicked value only', () => {
    expect(parseQuery('abc and def')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 4, 7),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 0, 0),
                new ParsedRawFilterKeyNode(null, 0, 0),
                new ParsedRawFilterValueNode("abc", 0, 3)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 8, 8),
                new ParsedRawFilterKeyNode(null, 8, 8),
                new ParsedRawFilterValueNode("def", 8, 11)
            ),
        )
    )
})

test('quoted value only', () => {
    expect(parseQuery('"abc" and "def"')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 6, 9),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 0, 0),
                new ParsedRawFilterKeyNode(null, 0, 0),
                new ParsedRawFilterValueNode("abc", 0, 5)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 10, 10),
                new ParsedRawFilterKeyNode(null, 10, 10),
                new ParsedRawFilterValueNode("def", 10, 15)
            ),
        )
    )
})


test('filter and value only filter', () => {
    expect(parseQuery('`key`: "abc" and "def"')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 13, 16),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 5, 6),
                new ParsedRawFilterKeyNode("key", 0, 5),
                new ParsedRawFilterValueNode("abc", 7, 12)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 17, 17),
                new ParsedRawFilterKeyNode(null, 17, 17),
                new ParsedRawFilterValueNode("def", 17, 22)
            ),
        )
    )
})


test('filter and filter', () => {
    expect(parseQuery('`key`: "abc" and `field`:"def"')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 13, 16),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 5, 6),
                new ParsedRawFilterKeyNode("key", 0, 5),
                new ParsedRawFilterValueNode("abc", 7, 12)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 24, 25),
                new ParsedRawFilterKeyNode("field", 17, 24),
                new ParsedRawFilterValueNode("def", 25, 30)
            ),
        )
    )
})

test('filter and filter and filter', () => {
    expect(parseQuery('`start`: 12 and `key`: "abc" and `field`:"def"')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 12, 15),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 7, 8),
                new ParsedRawFilterKeyNode("start", 0, 7),
                new ParsedRawFilterValueNode(12, 9, 11)
            ),
            new ParsedLogicalAndNode(
                new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 29, 32),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(':', 21, 22),
                    new ParsedRawFilterKeyNode("key", 16, 21),
                    new ParsedRawFilterValueNode("abc", 23, 28)
                ),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(':', 40, 41),
                    new ParsedRawFilterKeyNode("field", 33, 40),
                    new ParsedRawFilterValueNode("def", 41, 46)
                ),
            )
        ))
})