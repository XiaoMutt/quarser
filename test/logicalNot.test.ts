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
import {LOGICAL_OPERATOR, ParsedLogicalNotNode, ParsedRawLogicalOperatorNode} from "../src/logical";


test('single not with value only filter', () => {
    expect(parseQuery('not "abc"')).toEqual(
        new ParsedLogicalNotNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 0, 3),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 4, 4),
                new ParsedRawFilterKeyNode(null, 4, 4),
                new ParsedRawFilterValueNode("abc", 4, 9)
            )
        )
    )
})

test('single not with filter', () => {
    expect(parseQuery('not `key`: "abc"')).toEqual(
        new ParsedLogicalNotNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 0, 3),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(':', 9, 10),
                new ParsedRawFilterKeyNode("key", 4, 9),
                new ParsedRawFilterValueNode("abc", 11, 16)
            )
        )
    )
})


test('double not with filter', () => {
    expect(parseQuery('not not `key`: "abc"')).toEqual(
        new ParsedLogicalNotNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 0, 3),
            new ParsedLogicalNotNode(
                new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 4, 7),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(':', 13, 14),
                    new ParsedRawFilterKeyNode("key", 8, 13),
                    new ParsedRawFilterValueNode("abc", 15, 20)
                )
            )
        )
    )
})
