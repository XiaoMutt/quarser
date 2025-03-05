import {expect, test} from 'vitest'
import {parseQuery,} from '../src'
import {
    FILTER_OPERATOR,
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";
import {
    LOGICAL_OPERATOR,
    ParsedLogicalAndNode,
    ParsedLogicalNotNode,
    ParsedLogicalOrNode,
    ParsedRawLogicalOperatorNode
} from "../src/logical";
import {ParsedParenthesesNode, ParsedRawParenthesisNode} from "../src/parentheses";


test('test priority', () => {
    expect(parseQuery('abc or not `condition`: false and `key`>1')).toEqual(
        new ParsedLogicalOrNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 4, 6),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 0, 0),
                new ParsedRawFilterKeyNode(null, 0, 0),
                new ParsedRawFilterValueNode("abc", 0, 3),
            ),
            new ParsedLogicalAndNode(
                new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 30, 33),
                new ParsedLogicalNotNode(
                    new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 7, 10),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 22, 23),
                        new ParsedRawFilterKeyNode("condition", 11, 22),
                        new ParsedRawFilterValueNode(false, 24, 29),
                    )
                ),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(FILTER_OPERATOR.GREATER_THAN, 39, 40),
                    new ParsedRawFilterKeyNode("key", 34, 39),
                    new ParsedRawFilterValueNode(1, 40, 41),
                )
            )
        )
    )
})


test('test condition with parentheses', () => {
    expect(parseQuery('(abc or not `condition`: false) and `key`>1')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 32, 35),
            new ParsedParenthesesNode(
                new ParsedLogicalOrNode(
                    new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 5, 7),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(null, 1, 1),
                        new ParsedRawFilterKeyNode(null, 1, 1),
                        new ParsedRawFilterValueNode("abc", 1, 4)
                    ),
                    new ParsedLogicalNotNode(
                        new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.NOT, 8, 11),
                        new ParsedFilterNode(
                            new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 23, 24),
                            new ParsedRawFilterKeyNode("condition", 12, 23),
                            new ParsedRawFilterValueNode(false, 25, 30),
                        )
                    )
                ),
                new ParsedRawParenthesisNode('(', 0, 1),
                new ParsedRawParenthesisNode(')', 30, 31)
            ),
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(FILTER_OPERATOR.GREATER_THAN, 41,42),
                new ParsedRawFilterKeyNode("key", 36, 41),
                new ParsedRawFilterValueNode(1, 42,43)
            )
        )
    )
})
