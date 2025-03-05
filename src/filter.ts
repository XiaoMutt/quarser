import {
    EscapedQuery,
    OPERATIVE_NODE_TYPE,
    ParsedNode,
    ParsedOperativeNode,
    ParsedRaw,
    ParsedRawNode,
    Primitive,
    RAW_NODE_TYPE
} from "./basis";

export const FILTER_OPERATOR = {
    // ATTENTION: do not switch the order. The order of the keys matters. E.g. >= and >. >= must be checked first than >
    STARTSWITH: "startswith",
    ENDSWITH: "endswith",
    CONTAINS: "contains",
    IN: "in",
    NOT_IN: "!in",
    EQUAL_TO: "==",
    UNEQUAL_TO: "!=",
    LESS_EQUAL: "<=",
    GREATER_EQUAL: ">=",
    LESS_THAN: "<",
    GREATER_THAN: ">",
    FUZZY_MATCH: ":"
} as const

export type FilterOperator = (typeof FILTER_OPERATOR)[keyof typeof FILTER_OPERATOR]

export const FILTER_OPERATOR_BOUNDARY = {
    [FILTER_OPERATOR.STARTSWITH]: /[\W\n\r]/,
    [FILTER_OPERATOR.ENDSWITH]: /[\W\n\r]/,
    [FILTER_OPERATOR.CONTAINS]: /[\W\n\r]/,
    [FILTER_OPERATOR.IN]: /[\W\n\r]/,
    [FILTER_OPERATOR.NOT_IN]: /[\W\n\r]/,
    [FILTER_OPERATOR.EQUAL_TO]: /[^!=><:]/,
    [FILTER_OPERATOR.UNEQUAL_TO]: /[^!=><:]/,
    [FILTER_OPERATOR.LESS_EQUAL]: /[^!=><:]/,
    [FILTER_OPERATOR.GREATER_EQUAL]: /[^!=><:]/,
    [FILTER_OPERATOR.LESS_THAN]: /[^!=><:]/,
    [FILTER_OPERATOR.GREATER_THAN]: /[^!=><:]/,
    [FILTER_OPERATOR.FUZZY_MATCH]: /[^!=><:]/,
}

export class ParsedFilterNode extends ParsedOperativeNode {
    constructor(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode) {
        super(OPERATIVE_NODE_TYPE.FILTER, value, left, right)
    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode): boolean {
        return value?.isValid===true && left?.isValid===true && right?.isValid === true
    }
}

export class ParsedRawFilterOperatorNode extends ParsedRawNode {
    public readonly value?: string | null

    constructor(value?: string | null, start?: number, stop?: number) {
        super(RAW_NODE_TYPE.FILTER_OPERATOR, value, start, stop)
    }
}

function convertCharsToKey(chars: string[]) {
    switch (true) {
        case chars === null:
            return null
        case chars === undefined:
        case chars[0] !== '"':
        case chars[chars.length - 1] !== '"':
            return undefined
        default:
            return chars.slice(1, chars.length - 1).join('')

    }
}


export class ParsedRawFilterKeyNode extends ParsedRawNode {
    public readonly value?: string

    constructor(value: string | null | undefined, start?: number, stop?: number) {
        super(RAW_NODE_TYPE.FILTER_KEY, value, start, stop)
    }
}


function convertCharsToValue(chars: string[]) {
    if (chars.length===0) return undefined

    const value = chars.join('')
    const lower = value.toLowerCase()
    let converted = undefined
    if (lower === "null") {
        converted = null
    } else if (lower === "true") {
        converted = true
    } else if (lower === "false") {
        converted = false
    } else if (value?.startsWith('"') && value?.endsWith('"')) {
        converted = value.substring(1, value.length - 1)
    } else {
        const n = parseFloat(value)
        if (!Number.isNaN(n)) {
            converted = n
        } else {
            converted = value
        }
    }

    return converted
}


export class ParsedRawFilterValueNode extends ParsedRawNode {
    public readonly value?: ParsedRaw

    constructor(value: ParsedRaw | undefined, start?: number, stop?: number) {
        super(RAW_NODE_TYPE.FILTER_VALUE, value, start, stop)
    }
}

/**
 * Parse Field Key. Field key must be enclosed by `` in the query expression.
 * @param query
 * @param startIndex
 * @returns
 */
function parseFilterKey(query: string, startIndex: number): ParsedRawFilterKeyNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex, {"\\\\": '\\', "\\`": '`'})
    if (escapedQuery.isEnded) return undefined
    if (escapedQuery.peek() !== '`') return undefined

    const chars: string[] = []

    while (true) {
        const c = escapedQuery.next()
        switch (c) {
            case undefined:
                // early stopped
                return new ParsedRawFilterKeyNode(undefined, escapedQuery.startIndex, escapedQuery.currentIndex)

            case '`':
                if (chars.length === 0) {
                    // initial `
                    chars.push('"')
                } else {
                    // end
                    chars.push('"')
                    return new ParsedRawFilterKeyNode(convertCharsToKey(chars), escapedQuery.startIndex, escapedQuery.currentIndex)
                }
                break
            default:
                chars.push(c)
        }
    }
}


function parseFilterOperator(query: string, startIndex: number): ParsedRawFilterOperatorNode | undefined {
    let cur = startIndex;
    while (query[cur] === ' ') cur++
    if (query[cur] === undefined) return undefined;
    const currentStart = cur
    // no need to use trie, since operator string is very short
    for (const op of Object.values(FILTER_OPERATOR)) {
        const value = query.substring(cur, cur + op.length).toLowerCase()
        const boundary = query[cur + op.length]
        if (value === op && FILTER_OPERATOR_BOUNDARY[op].test(boundary)) {
            // found
            return new ParsedRawFilterOperatorNode(op, currentStart, currentStart + op.length)
        }
    }
    return undefined
}


function parseFilterPrimitiveValue(query: string, startIndex: number): ParsedRawFilterValueNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined;

    const chars: string[] = []

    while (true) {
        const c = escapedQuery.next()
        switch (true) {
            case c === undefined:
                // end of string
                return new ParsedRawFilterValueNode(convertCharsToValue(chars), escapedQuery.startIndex, escapedQuery.currentIndex)
            case c === '"':
                if (chars.length === 0) {
                    // start of value string
                    chars.push('"')
                    escapedQuery.setEscapeCharMap({"\\\\": '\\', "\\\"": '"'}) // enable escape char map
                } else {
                    // end of value string
                    chars.push('"')
                    return new ParsedRawFilterValueNode(convertCharsToValue(chars), escapedQuery.startIndex, escapedQuery.currentIndex)
                }
                break
            case /[^\w\.\-+]/.test(c):
                // not a word not a number
                if (chars[0] === '"') {
                    // inside quote
                    chars.push(c)
                } else {
                    // ending condition
                    return new ParsedRawFilterValueNode(convertCharsToValue(chars), escapedQuery.startIndex, escapedQuery.currentIndex - 1)
                }
                break

            default:
                chars.push(c)
        }
    }
}

function parseFilterArrayValue(query: string, startIndex: number): ParsedNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined
    if (escapedQuery.next() !== '[') return undefined


    const values: Primitive[] = []
    while (true) {
        const parsedValue = parseFilterPrimitiveValue(query, escapedQuery.currentIndex)
        if (!parsedValue?.isValid) return undefined
        escapedQuery.setIndex(parsedValue.stop!!)

        values.push(parsedValue.value as Primitive)

        while (true) {
            const next = escapedQuery.next()
            if (next === undefined) {
                return undefined
            } else if (next === ']') {
                return new ParsedRawFilterValueNode(values, escapedQuery.startIndex, escapedQuery.currentIndex)
            } else if (next === ',') {
                break
            } else if (next === '\n') {
                break
            }
        }
    }
}

export function parseFilter(query: string, startIndex: number): ParsedFilterNode | undefined {
    const escapedQuery = new EscapedQuery(query, startIndex)
    if (escapedQuery.isEnded) return undefined;

    const key = parseFilterKey(query, escapedQuery.currentIndex)

    if (key === undefined) {
        // no key found; parse value directly
        const value = parseFilterPrimitiveValue(query, escapedQuery.currentIndex)
        if (value === undefined) return undefined

        // found
        const nullRawFilterOperatorNode = new ParsedRawFilterOperatorNode(null, escapedQuery.currentIndex, escapedQuery.currentIndex)
        const nullRawFilterKeyNode = new ParsedRawFilterKeyNode(null, escapedQuery.currentIndex, escapedQuery.currentIndex)
        return new ParsedFilterNode(nullRawFilterOperatorNode, nullRawFilterKeyNode, value)
    } else {
        // tailing chain conditions: expanding out.
        if (!key.isValid) {
            return new ParsedFilterNode(undefined, key)
        }

        // valid key found:
        const operator = parseFilterOperator(query, key.stop!!)

        if (!operator?.isValid) {
            return new ParsedFilterNode(operator, key)
        }

        // valid operator found
        const value = (operator.value === FILTER_OPERATOR.IN || operator.value === FILTER_OPERATOR.NOT_IN) ?
            parseFilterArrayValue(query, operator.stop!!) :
            parseFilterPrimitiveValue(query, operator.stop!!)
        return new ParsedFilterNode(operator, key, value)
    }
}