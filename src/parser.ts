import {parseFilter} from "./filter";
import {EscapedQuery, ParsedNode} from "./types";
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

export function parseQuery(s?: string) {
    if (s == null) return undefined
    return parseSubQuery(s, 0, 0)
}
