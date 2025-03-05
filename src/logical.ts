import {
    EscapedQuery,
    OPERATIVE_NODE_TYPE,
    ParsedNode,
    ParsedOperativeNode,
    ParsedRawNode,
    RAW_NODE_TYPE
} from "./types";
import {parseSubQuery} from "./parser";

export const LOGICAL_OPERATOR = {
    NOT: "not",
    AND: "and",
    OR: "or",
} as const

export const enum LOGICAL_OPERATOR_PRIORITY {
    OR,
    AND,
    NOT,
}

export const LOGICAL_OPERATOR_BOUNDARY = {
    [LOGICAL_OPERATOR.NOT]: /[\W\n\r]/,
    [LOGICAL_OPERATOR.AND]: /[\W\n\r]/,
    [LOGICAL_OPERATOR.OR]: /[\W\n\r]/,
}

export type LogicalOperator = (typeof LOGICAL_OPERATOR)[keyof typeof LOGICAL_OPERATOR]


export class ParsedRawLogicalOperatorNode extends ParsedRawNode {
    public readonly value?: LogicalOperator

    constructor(value?: string, start?: number, stop?: number) {
        super(RAW_NODE_TYPE.LOGIC_OPERATOR, value, start, stop)
    }
}

export class ParsedLogicalNotNode extends ParsedOperativeNode {
    constructor(value: ParsedRawLogicalOperatorNode, right?: ParsedNode) {
        super(OPERATIVE_NODE_TYPE.LOGIC, value, undefined, right)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return value?.isValid === true && left===undefined && right?.isValid === true
    }
}



export class ParsedLogicalAndNode extends ParsedOperativeNode {
    constructor(value: ParsedRawLogicalOperatorNode, left?: ParsedNode, right?: ParsedNode) {
        super(OPERATIVE_NODE_TYPE.LOGIC, value, left, right)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return value?.isValid === true && left?.isValid===true && right?.isValid === true
    }
}

export class ParsedLogicalOrNode extends ParsedOperativeNode {
    constructor(value: ParsedRawLogicalOperatorNode, left?: ParsedNode, right?: ParsedNode) {
        super(OPERATIVE_NODE_TYPE.LOGIC, value, left, right)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return value?.isValid === true && left?.isValid===true && right?.isValid === true
    }
}

export function parseLogicalNot(query: string, startIndex: number, priority: number): ParsedLogicalNotNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.NOT < priority) return undefined
    const operator = LOGICAL_OPERATOR.NOT
    const escapedQuery = new EscapedQuery(query, startIndex)

    if (escapedQuery.skip(operator) && LOGICAL_OPERATOR_BOUNDARY[operator].test(escapedQuery.peek())) {
        const parsedRawOperator = new ParsedRawLogicalOperatorNode(operator, escapedQuery.startIndex, escapedQuery.currentIndex)
        const rightHandSide = parseSubQuery(query, escapedQuery.currentIndex, LOGICAL_OPERATOR_PRIORITY.NOT)
        return new ParsedLogicalNotNode(parsedRawOperator, rightHandSide)
    }
    return undefined
}

export function parseLogicalAnd(query: string, startIndex: number, priority: number, leftHandSide: ParsedNode): ParsedLogicalAndNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.AND < priority) return undefined

    const operator = LOGICAL_OPERATOR.AND
    const escapedQuery = new EscapedQuery(query, startIndex)

    if (escapedQuery.skip(operator) && LOGICAL_OPERATOR_BOUNDARY[operator].test(escapedQuery.peek())) {
        const parsedRawOperator = new ParsedRawLogicalOperatorNode(operator, escapedQuery.startIndex, escapedQuery.currentIndex)
        const rightHandSide = parseSubQuery(query, escapedQuery.currentIndex, LOGICAL_OPERATOR_PRIORITY.AND)
        return new ParsedLogicalAndNode(parsedRawOperator, leftHandSide, rightHandSide)
    }
    return undefined
}

export function parseLogicalOr(query: string, startIndex: number, priority: number, leftHandSide: ParsedNode): ParsedLogicalOrNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.OR < priority) return undefined

    const operator = LOGICAL_OPERATOR.OR
    const escapedQuery = new EscapedQuery(query, startIndex)

    if (escapedQuery.skip(operator) && LOGICAL_OPERATOR_BOUNDARY[operator].test(escapedQuery.peek())) {
        const parsedRawOperator = new ParsedRawLogicalOperatorNode(operator, escapedQuery.startIndex, escapedQuery.currentIndex)
        const rightHandSide = parseSubQuery(query, escapedQuery.currentIndex, LOGICAL_OPERATOR_PRIORITY.OR)
        return new ParsedLogicalOrNode(parsedRawOperator, leftHandSide, rightHandSide)
    }
    return undefined
}