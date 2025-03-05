import {parseFilter} from "./filter";
import {
    EscapedQuery,
    OPERATIVE_NODE_TYPE,
    ParsedNode,
    ParsedOperativeNode,
    ParsedRawNode,
    RAW_NODE_TYPE
} from "./types";
import {parseLogicalAnd, parseLogicalNot, parseLogicalOr} from "./logical";
import {parseParenthesesNode} from "./parentheses";


function parseUnaryNode(query: string, startIndex: number, priority: number): ParsedNode | undefined {
    let escapedQuery = new EscapedQuery(query, startIndex)

    // parentheses
    const parenthesesNode = parseParenthesesNode(query, escapedQuery.currentIndex)
    if (parenthesesNode !== undefined) return parenthesesNode


    // not
    const logicalNot = parseLogicalNot(query, escapedQuery.currentIndex, priority)
    if (logicalNot !== undefined) return logicalNot


    // filter
    return parseFilter(query, escapedQuery.currentIndex)

}

export class ParsedRawMessageNode extends ParsedRawNode {
    public readonly value?: string

    constructor(value?: string, start?: number) {
        super(RAW_NODE_TYPE.MESSAGE, value, start)
    }
}


export class ParsedErrorNode extends ParsedOperativeNode {
    constructor(value: ParsedRawMessageNode, left?: ParsedNode) {
        super(OPERATIVE_NODE_TYPE.ERROR, value, left)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return false
    }
}


export function parseSubQuery(query: string, startIndex: number, priority: number): ParsedNode | undefined {
    let escapedQuery = new EscapedQuery(query, startIndex)

    // uniary element on the left hand side
    let leftHandSide = parseUnaryNode(query, escapedQuery.currentIndex, priority)
    if (leftHandSide === undefined) return undefined
    if (!leftHandSide.isValid) return leftHandSide

    // binary logical operators
    escapedQuery = new EscapedQuery(query, leftHandSide.stop!!)
    while (!escapedQuery.isEnded) {
        // and
        const logicalAnd = parseLogicalAnd(query, escapedQuery.currentIndex, priority, leftHandSide)
        if (logicalAnd !== undefined) {
            leftHandSide = logicalAnd
            if (!leftHandSide.isValid) break
            escapedQuery = new EscapedQuery(query, leftHandSide.stop!!)
        }

        const logicalOr = parseLogicalOr(query, escapedQuery.startIndex, priority, leftHandSide)
        if (logicalOr === undefined) break // found no more
        leftHandSide = logicalOr
        if (!leftHandSide.isValid) break

        escapedQuery = new EscapedQuery(query, leftHandSide.stop!!)

    }

    return leftHandSide
}

export function parseQuery(query?: string) {
    if (query == null) return undefined
    const parsedNode = parseSubQuery(query, 0, 0)

    if (parsedNode ===undefined) return undefined

    // check if the parsedNode used all the query
    const escapedQuery = new EscapedQuery(query, parsedNode.stop!!)

    if (escapedQuery.isEnded) {
        return parsedNode
    }

    return new ParsedErrorNode(
        new ParsedRawMessageNode(`Missing expression at ${escapedQuery.currentIndex}`, escapedQuery.currentIndex),
        parsedNode
    )


}
