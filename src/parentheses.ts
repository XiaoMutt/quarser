import {
    EscapedQuery,
    OPERATIVE_NODE_TYPE,
    ParsedNode,
    ParsedOperativeNode,
    ParsedRawNode,
    RAW_NODE_TYPE
} from "./types";
import {parseSubQuery} from "./parser";
import {ParsedFilterNode, parseFilter} from "./filter";


export class ParsedRawParenthesisNode extends ParsedRawNode {
    public readonly value?: '(' | ')'

    constructor(value?: '(' | ')', start?: number, stop?: number) {
        super(RAW_NODE_TYPE.PARENTHESIS, value, start, stop)
    }

}

export class ParsedParenthesesNode extends ParsedOperativeNode {
    constructor(value?: ParsedNode, left?: ParsedRawParenthesisNode, right?: ParsedRawParenthesisNode) {
        super(OPERATIVE_NODE_TYPE.PARENTHESES, value, left, right)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return value?.isValid === true && left?.isValid === true && right?.isValid === true
    }
}


export function parseParenthesesNode(query: string, startIndex: number): ParsedNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined
    if (escapedQuery.next() !== '(') return undefined

    const leftParenthesisNode = new ParsedRawParenthesisNode('(', escapedQuery.startIndex, escapedQuery.currentIndex)
    const parsedInnerNode = parseSubQuery(query, escapedQuery.currentIndex, 0)
    if (!parsedInnerNode?.isValid) {
        return new ParsedFilterNode(parsedInnerNode, leftParenthesisNode)
    }

    const newEscapedQuery = new EscapedQuery(query, parsedInnerNode.stop!!)

    if (newEscapedQuery.next() !== ')') {
        // partial parentheses
        return new ParsedFilterNode(parsedInnerNode, leftParenthesisNode)
    }

    const rightParenthesisNode = new ParsedRawParenthesisNode(')', newEscapedQuery.startIndex, newEscapedQuery.currentIndex)

    return new ParsedParenthesesNode(parsedInnerNode, leftParenthesisNode, rightParenthesisNode)
}