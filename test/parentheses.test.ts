import {expect, test} from 'vitest'
import {parseQuery,} from '../src'
import {
    FILTER_OPERATOR,
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";
import {ParsedParenthesesNode, ParsedRawParenthesisNode} from "../src/parentheses";
import {
    LOGICAL_OPERATOR,
    ParsedLogicalAndNode,
    ParsedLogicalOrNode,
    ParsedRawLogicalOperatorNode
} from "../src/logical";


test('no meaning parentheses, single', () => {
    expect(parseQuery('(abc)')).toEqual(
        new ParsedParenthesesNode(
            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(null, 1, 1),
                new ParsedRawFilterKeyNode(null, 1, 1),
                new ParsedRawFilterValueNode("abc", 1, 4)
            ),
            new ParsedRawParenthesisNode('(', 0, 1),
            new ParsedRawParenthesisNode(')', 4, 5)
        )
    )
})

test('no meaning parentheses, or', () => {
    expect(parseQuery('(abc or "def")')).toEqual(
        new ParsedParenthesesNode(
            new ParsedLogicalOrNode(
                new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 5, 7),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(null, 1, 1),
                    new ParsedRawFilterKeyNode(null, 1, 1),
                    new ParsedRawFilterValueNode("abc", 1, 4)
                ),
                new ParsedFilterNode(
                    new ParsedRawFilterOperatorNode(null, 8, 8),
                    new ParsedRawFilterKeyNode(null, 8, 8),
                    new ParsedRawFilterValueNode("def", 8, 13)
                ),
            ),
            new ParsedRawParenthesisNode('(', 0, 1),
            new ParsedRawParenthesisNode(')', 13, 14)
        )
    )
})


test('parentheses or and', () => {
    expect(parseQuery('(abc or "def") and `field`: "ghi"')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 15, 18),
            new ParsedParenthesesNode(
                new ParsedLogicalOrNode(
                    new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 5, 7),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(null, 1, 1),
                        new ParsedRawFilterKeyNode(null, 1, 1),
                        new ParsedRawFilterValueNode("abc", 1, 4)
                    ),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(null, 8, 8),
                        new ParsedRawFilterKeyNode(null, 8, 8),
                        new ParsedRawFilterValueNode("def", 8, 13)
                    ),
                ),
                new ParsedRawParenthesisNode('(', 0, 1),
                new ParsedRawParenthesisNode(')', 13, 14)
            ),

            new ParsedFilterNode(
                new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 26, 27),
                new ParsedRawFilterKeyNode("field", 19, 26),
                new ParsedRawFilterValueNode("ghi", 28, 33)
            )
        )
    )
})

test('parentheses double parentheses', () => {
    expect(parseQuery('(abc or "def") and (`field`: "ghi" or `int` < 15)')).toEqual(
        new ParsedLogicalAndNode(
            new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.AND, 15, 18),

            new ParsedParenthesesNode(
                new ParsedLogicalOrNode(
                    new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 5, 7),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(null, 1, 1),
                        new ParsedRawFilterKeyNode(null, 1, 1),
                        new ParsedRawFilterValueNode("abc", 1, 4)
                    ),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(null, 8, 8),
                        new ParsedRawFilterKeyNode(null, 8, 8),
                        new ParsedRawFilterValueNode("def", 8, 13)
                    ),
                ),
                new ParsedRawParenthesisNode('(', 0, 1),
                new ParsedRawParenthesisNode(')', 13, 14)
            ),

            new ParsedParenthesesNode(
                new ParsedLogicalOrNode(
                    new ParsedRawLogicalOperatorNode(LOGICAL_OPERATOR.OR, 35, 37),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(FILTER_OPERATOR.FUZZY_MATCH, 27, 28),
                        new ParsedRawFilterKeyNode("field", 20, 27),
                        new ParsedRawFilterValueNode("ghi", 29, 34)
                    ),
                    new ParsedFilterNode(
                        new ParsedRawFilterOperatorNode(FILTER_OPERATOR.LESS_THAN, 44, 45),
                        new ParsedRawFilterKeyNode("int", 38, 43),
                        new ParsedRawFilterValueNode(15, 46, 48)
                    )
                ),
                new ParsedRawParenthesisNode('(', 19, 20),
                new ParsedRawParenthesisNode(')', 48, 49)
            )
        )
    )
})