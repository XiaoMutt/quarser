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


export type LogicalOperator = (typeof LOGICAL_OPERATOR)[keyof typeof LOGICAL_OPERATOR]

export const FILTER_OPERATOR = {
    // ATTENTION: do not switch the order. The order of the keys matters. E.g. >= and >. >= must be checked first than >
    STARTSWITH: "startswith",
    ENDSWITH: "endswith",
    CONTAINS: "contains",
    EQUAL_TO: "==",
    LESS_EQUAL: "<=",
    GREATER_EQUAL: ">=",
    UNEQUAL_TO: "!=",
    LESS_THAN: "<",
    GREATER_THAN: ">",
    FUZZY_MATCH: ":"
} as const

export type FilterOperator = (typeof FILTER_OPERATOR)[keyof typeof FILTER_OPERATOR]

export const FILTER_NODE_TYPE = {
    /**
     * Indicate the child is a filter key
     */
    KEY: "__key__",

    /**
     * Indicate the child is an filter operator
     */
    OPERATOR: "__operator__",

    /**
     * Indicates the child is a filter value 
     */
    VALUE: "__value__",

    /**
     * Indicates the children are used to make a filter
     */
    FILTER: "__filter__"


} as const

export type FilterNodeType = (typeof FILTER_NODE_TYPE)[keyof typeof FILTER_NODE_TYPE]

export type NodeType = LogicalOperator | FilterNodeType

export type FilterKey = string
export type FilterValue = boolean | number | string

// when chldren is undefined indicating a partial parsing result

export interface ParsedNode {
    type: string
    children: Array<ParsedNode | FilterKey | FilterValue | null | undefined>
    start: number
    stop: number
    isValid: boolean
}

export interface ParsedFilterKey extends ParsedNode {
    type: typeof FILTER_NODE_TYPE.KEY
    children: [FilterKey | null | undefined]
}

export interface ParsedFilterOperator extends ParsedNode {
    type: typeof FILTER_NODE_TYPE.OPERATOR
    children: [FilterOperator | undefined]
}


export interface ParsedFilterValue extends ParsedNode {
    type: typeof FILTER_NODE_TYPE.VALUE
    children: [FilterValue | null | undefined]
}

export interface ParsedFilter extends ParsedNode {
    type: typeof FILTER_NODE_TYPE.FILTER
    children: [ParsedFilterKey, undefined, undefined] |
    [ParsedFilterKey, ParsedFilterOperator, undefined] |
    [ParsedFilterKey, ParsedFilterOperator, ParsedFilterValue] |
    [null, null, ParsedFilterValue]
}


export interface ParsedLogicalNode extends ParsedNode {
    type: LogicalOperator,
    children: Array<ParsedNode>


}
class EscapedQuery {
    private readonly _query: string
    private _index: number
    private _escapeCharMap: { [escaped: string]: string } | undefined
    private _startIndex: number

    constructor(query: string, startIndex: number, escapeCharMap?: { [escaped: string]: string }) {
        this._query = query
        this._index = startIndex
        this._escapeCharMap = escapeCharMap

        // skip spaces
        while (this._query[this._index] === ' ') ++this._index
        this._startIndex = this._index
    }

    setEscapeCharMap(escapeCharMap?: { [escaped: string]: string }) {
        this._escapeCharMap = escapeCharMap
    }

    next() {
        if (this._escapeCharMap) {
            for (const [escaped, char] of Object.entries(this._escapeCharMap)) {
                const value = this._query.substring(this._index, this._index + escaped.length)
                if (value === escaped) {
                    this._index += escaped.length
                    return char
                }
            }
        }

        const c = this._query[this._index]
        if (c !== undefined) ++this._index
        return c
    }

    peek() {
        if (this._escapeCharMap) {
            for (const [escaped, char] of Object.entries(this._escapeCharMap)) {
                const value = this._query.substring(this._index, this._index + escaped.length)
                if (value === escaped) {
                    return char
                }
            }
        }

        return this._query[this._index]
    }

    get startIndex() {
        return this._startIndex
    }

    get currentIndex() {
        return this._index
    }

    get isEnded() {
        return this._query[this._index] === undefined
    }
}


function convertCharsToFilterKeyOrValue(chars: string[]): FilterKey | FilterValue | null | undefined {
    const value = chars.join('')

    const lower = value.toLowerCase()
    if (lower === "null") {
        return null
    } else if (lower === "true") {
        return true
    } else if (lower === "false") {
        return false
    } else if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1)
    } else {
        const n = parseFloat(value)
        if (Number.isNaN(n)) {
            return undefined
        } else {
            return n
        }
    }
}


/**
 * Parse Field Key. Field key musted be enclosed by `` in the query expression.
 * @param query 
 * @param startIndex 
 * @returns 
 */
function parseFilterKey(query: string, startIndex: number): ParsedFilterKey | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex, { "\\\\": '\\', "\\`": '`' })
    if (escapedQuery.isEnded) return undefined
    if (escapedQuery.peek() !== '`') return undefined

    const chars: string[] = []

    while (true) {
        const c = escapedQuery.next()
        switch (c) {
            case undefined:
                return {
                    type: FILTER_NODE_TYPE.KEY,
                    children: [undefined],
                    start: escapedQuery.startIndex,
                    stop: escapedQuery.currentIndex,
                    isValid: false
                }

            case '`':
                if (chars.length === 0) {
                    // initial `
                    chars.push('"')
                } else {
                    // end
                    chars.push('"')
                    const value = convertCharsToFilterKeyOrValue(chars) as string | undefined
                    return {
                        type: FILTER_NODE_TYPE.KEY,
                        children: [value],
                        start: escapedQuery.startIndex,
                        stop: escapedQuery.currentIndex,
                        isValid: value !== undefined
                    }
                }
                break
            default:
                chars.push(c)
        }
    }
}

function parseFilterOperator(query: string, startIndex: number): ParsedFilterOperator | undefined {
    function isBoundaryValid(b: string, op: string) {
        switch (op) {
            // english words operators
            case FILTER_OPERATOR.CONTAINS:
            case FILTER_OPERATOR.STARTSWITH:
            case FILTER_OPERATOR.ENDSWITH:
                return b === ' '
            default:
                // symbol operators
                return b.match(/\s|[a-zA-Z]|\d|"/)

        }
    }



    let cur = startIndex;
    while (query[cur] === ' ') cur++
    if (query[cur] === undefined) return undefined;
    const currentStart = cur
    // no need to use trie, since operator string is very short
    for (const op of Object.values(FILTER_OPERATOR)) {
        const value = query.substring(cur, cur + op.length).toLowerCase()
        const boundary = query[cur + op.length]
        if (value === op && isBoundaryValid(boundary, op)) {
            // found
            return {
                type: FILTER_NODE_TYPE.OPERATOR,
                children: [op],
                start: currentStart,
                stop: currentStart + op.length,
                isValid: true
            }
        }
    }
    return undefined
}


function parseFilterValue(query: string, startIndex: number): ParsedFilterValue | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined;

    const chars: string[] = []

    while (true) {
        const c = escapedQuery.next()
        switch (c) {
            case undefined:
                // end of string
                const value = convertCharsToFilterKeyOrValue(chars)
                return {
                    type: FILTER_NODE_TYPE.VALUE,
                    children: [value],
                    start: escapedQuery.startIndex,
                    stop: escapedQuery.currentIndex,
                    isValid: value !== undefined
                }
            case ' ':
            case '(':
            case ')':
                if (chars[0] === '"') {
                    // inside value
                    chars.push(c)
                } else {
                    // ending condition
                    const value = convertCharsToFilterKeyOrValue(chars)
                    return {
                        type: FILTER_NODE_TYPE.VALUE,
                        children: [value],
                        start: escapedQuery.startIndex,
                        stop: escapedQuery.currentIndex - 1, // do not consume this char
                        isValid: value !== undefined
                    }
                }
                break

            case '"':
                if (chars.length === 0) {
                    // start of value string
                    chars.push('"')
                    escapedQuery.setEscapeCharMap({ "\\\\": '\\', "\\\"": '"' }) // enable escape char map
                } else {
                    // end of value string
                    chars.push('"')
                    const value = convertCharsToFilterKeyOrValue(chars)
                    return {
                        type: FILTER_NODE_TYPE.VALUE,
                        children: [value],
                        start: escapedQuery.startIndex,
                        stop: escapedQuery.currentIndex,
                        isValid: value !== undefined
                    }
                }
                break
            default:
                chars.push(c)
        }
    }
}


function parseFilter(query: string, startIndex: number): ParsedFilter | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined;

    const key = parseFilterKey(query, escapedQuery.currentIndex)

    if (key === undefined) {
        // no key found; parse value directly
        const value = parseFilterValue(query, escapedQuery.currentIndex)
        if (value === undefined) return undefined

        // found
        return {
            type: FILTER_NODE_TYPE.FILTER,
            children: [null, null, value],
            start: value.start,
            stop: value.stop,
            isValid: value.isValid
        }
    } else {
        // tailing chain conditions: expanding out.
        if (!key.isValid) {
            // partial key
            return {
                type: FILTER_NODE_TYPE.FILTER,
                children: [key, undefined, undefined],
                start: key.start,
                stop: key.stop,
                isValid: false
            }
        }

        // valid key found:
        const operator = parseFilterOperator(query, key.stop)

        if (operator === undefined) {
            return {
                type: FILTER_NODE_TYPE.FILTER,
                children: [key, undefined, undefined],
                start: key.start,
                stop: key.stop,
                isValid: false
            }
        }

        if (!operator.isValid) {
            return {
                type: FILTER_NODE_TYPE.FILTER,
                children: [key, operator, undefined],
                start: key.start,
                stop: operator.stop,
                isValid: false
            }
        }

        // valid operator found
        const value = parseFilterValue(query, operator.stop)

        if (value === undefined) {
            return {
                type: FILTER_NODE_TYPE.FILTER,
                children: [key, operator, undefined],
                start: key.start,
                stop: operator.stop,
                isValid: false
            }
        }

        return {
            type: FILTER_NODE_TYPE.FILTER,
            children: [key, operator, value],
            start: key.start,
            stop: value.stop,
            isValid: value.isValid
        }
    }
}


function parseLogicalOperator(query: string, startIndex: number,
    operator: LogicalOperator, priority: LOGICAL_OPERATOR_PRIORITY): ParsedLogicalNode | undefined {

    function isBoundaryValid(b: string) {
        return b === ' ' || b === '('
    }

    let cur = startIndex;
    while (query[cur] === ' ') ++cur
    if (query[cur] === undefined) return undefined
    const currentStart = cur

    const value = query.substring(cur, cur + operator.length).toLowerCase()
    const boundary = query[cur + operator.length]

    if (value === operator && isBoundaryValid(boundary)) {
        // valid boundary
        cur += operator.length
        const subQuery = parseSubQuery(query, cur, priority)

        if (subQuery === undefined) {
            return {
                type: operator,
                children: [],
                start: currentStart,
                stop: currentStart + operator.length,
                isValid: false // no right hand side found
            }
        }

        return {
            type: operator,
            children: [subQuery],
            start: currentStart,
            stop: subQuery.stop,
            isValid: subQuery.isValid
        }

    }
    return undefined
}

function parseLogicalNot(query: string, startIndex: number, priortiy: number): ParsedLogicalNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.NOT < priortiy) return undefined
    return parseLogicalOperator(query, startIndex, LOGICAL_OPERATOR.NOT, LOGICAL_OPERATOR_PRIORITY.NOT)
}


function mergeSameTypeNodes(leftHandSide: ParsedNode, parsedRight: ParsedNode): ParsedLogicalNode {
    if (leftHandSide.type === parsedRight.type) {
        // combine
        leftHandSide = {
            type: parsedRight.type,
            children: [...leftHandSide.children, ...parsedRight.children],
            start: leftHandSide.start,
            stop: parsedRight.stop,
            isValid: parsedRight.isValid
        }
    } else {
        // attach
        leftHandSide = {
            type: parsedRight.type,
            children: [leftHandSide, ...parsedRight.children],
            start: leftHandSide.start,
            stop: parsedRight.stop,
            isValid: parsedRight.isValid
        }
    }
    return leftHandSide as ParsedLogicalNode
}

function parseLogicalAnd(query: string, startIndex: number, priority: number, leftHandSide: ParsedNode): ParsedLogicalNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.AND < priority) return undefined
    const parsedRight = parseLogicalOperator(query, startIndex, LOGICAL_OPERATOR.AND, LOGICAL_OPERATOR_PRIORITY.AND)
    if (parsedRight === undefined) return undefined

    return mergeSameTypeNodes(leftHandSide, parsedRight)
}

function parseLogicalOr(query: string, startIndex: number, priority: number, leftHandSide: ParsedNode): ParsedLogicalNode | undefined {
    if (LOGICAL_OPERATOR_PRIORITY.OR < priority) return undefined
    const parsedRight = parseLogicalOperator(query, startIndex, LOGICAL_OPERATOR.OR, LOGICAL_OPERATOR_PRIORITY.OR)
    if (parsedRight === undefined) return undefined
    return mergeSameTypeNodes(leftHandSide, parsedRight)
}

function parseParenthesesNode(query: string, startIndex: number): ParsedNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined
    if (escapedQuery.peek() !== '(') return undefined

    const node = parseSubQuery(query, escapedQuery.currentIndex + 1, 0)
    if (node === undefined) return undefined

    if (!node.isValid) {
        return {
            type: node.type,
            children: node.children,
            start: escapedQuery.startIndex,
            stop: node.stop,
            isValid: false
        }
    }

    const newEscapedQuery = new EscapedQuery(query, node.stop)

    if (newEscapedQuery.peek() !== ')') {
        // partial parentheses
        return {
            type: node.type,
            children: node.children,
            start: escapedQuery.startIndex,
            stop: newEscapedQuery.currentIndex,
            isValid: false
        }
    }


    return {
        type: node.type,
        children: node.children,
        start: escapedQuery.startIndex,
        stop: newEscapedQuery.currentIndex + 1,
        isValid: true
    }
}

function parseUnaryNode(query: string, startIndex: number, priority: number): ParsedNode | undefined {
    let escapedQuery = new EscapedQuery(query, startIndex)

    // parentheses
    const parenthesesNode = parseParenthesesNode(query, escapedQuery.currentIndex)
    if (parenthesesNode !== undefined) return parenthesesNode


    // not
    const logicalNot = parseLogicalNot(query, escapedQuery.currentIndex, priority)
    if (logicalNot !== undefined) return logicalNot


    // filter
    const filter = parseFilter(query, escapedQuery.currentIndex)
    return filter

}

function parseSubQuery(query: string, startIndex: number, priority: number): ParsedNode | undefined {
    let escapedQuery = new EscapedQuery(query, startIndex)

    // uniary element at the left hand side
    let leftHandSide = parseUnaryNode(query, escapedQuery.currentIndex, priority)
    if (leftHandSide === undefined) return undefined
    if (!leftHandSide.isValid) return leftHandSide

    // binary logical operators
    escapedQuery = new EscapedQuery(query, leftHandSide.stop)
    while (!escapedQuery.isEnded) {
        // and
        const logicalAnd = parseLogicalAnd(query, escapedQuery.currentIndex, priority, leftHandSide)
        console.log("and", logicalAnd)
        if (logicalAnd !== undefined) {
            leftHandSide = logicalAnd
            if (!leftHandSide.isValid) break
            escapedQuery = new EscapedQuery(query, leftHandSide.stop)
        }

        const logicalOr = parseLogicalOr(query, escapedQuery.startIndex, priority, leftHandSide)
        if (logicalOr === undefined) break // found no more
        leftHandSide = logicalOr
        if (!leftHandSide.isValid) break
        escapedQuery = new EscapedQuery(query, leftHandSide.stop)

    }
    return leftHandSide
}

export function parseQuery(s?: string) {
    if (s == null) return undefined
    return parseSubQuery(s, 0, 0)
}


const p = parseQuery('"abc" and "def"')
console.log(p)