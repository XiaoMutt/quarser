export const enum RAW_NODE_TYPE {
    MESSAGE = "message",
    FILTER_KEY = "filter_key",
    FILTER_VALUE = "filter_value",
    FILTER_OPERATOR = "filter_operator",
    LOGIC_OPERATOR = "logical_operator",
    PARENTHESIS = "parenthesis"
}

export const enum OPERATIVE_NODE_TYPE {
    ERROR = "error",
    FILTER = "filter",
    LOGIC = "logic",
    PARENTHESES = "parentheses"
}

export type NodeType = RAW_NODE_TYPE | OPERATIVE_NODE_TYPE
export type Primitive = boolean | number | string | null
export type ParsedRaw = Primitive | Array<Primitive>

export interface ParsedNode {
    readonly value?: ParsedNode | ParsedRaw
    readonly left?: ParsedNode
    readonly right?: ParsedNode
    readonly start?: number
    readonly stop?: number
    readonly isValid: boolean
    readonly type: NodeType
}


/**
 * Operative node are node with value as operator and left and right as operons.
 */
export class ParsedOperativeNode implements ParsedNode {
    public readonly type: OPERATIVE_NODE_TYPE
    public readonly value?: ParsedNode
    public readonly left?: ParsedNode
    public readonly right?: ParsedNode
    public readonly start?: number
    public readonly stop?: number
    public readonly isValid: boolean

    constructor(type: OPERATIVE_NODE_TYPE, value?: ParsedNode, left?: ParsedNode, right?: ParsedNode) {
        const isValid = this.checkIsValid(value, left, right)
        this.type = type
        this.value = value
        this.left = left
        this.right = right
        this.start = (left?.start !== undefined && value?.start !== undefined) ?
            Math.min(left.start, value.start) : (left?.start == null ? value?.start : left.start)
        this.stop = isValid ?
            ((right?.stop !== undefined && value?.stop !== undefined) ?
                Math.max(right.stop, value.stop) :
                (right?.stop == null ? value?.stop : right.stop)) :
            undefined
        this.isValid = this.checkIsValid(value, left, right)

    }

    checkIsValid(value?: ParsedNode, left?: ParsedNode, right?: ParsedNode) {
        return (value?.isValid === true) && (left === undefined || left?.isValid === true) && (right === undefined || right?.isValid === true)
    }

}

export class ParsedRawNode implements ParsedNode {
    public readonly value?: ParsedRaw
    public readonly left?: ParsedNode
    public readonly right?: ParsedNode
    public readonly start?: number
    public readonly stop?: number
    public readonly isValid: boolean
    public readonly type: RAW_NODE_TYPE

    constructor(type: RAW_NODE_TYPE, value?: ParsedRaw, start?: number, stop?: number) {
        const isValid = value !== undefined && start !== undefined && stop !== undefined

        this.value = value
        this.left = undefined
        this.right = undefined
        this.start = start
        this.stop = isValid ? stop : undefined
        this.isValid = isValid
        this.type = type
    }
}

export class EscapedQuery {
    private readonly _query: string
    private _index: number
    private _escapeCharMap: { [escaped: string]: string } | undefined
    private readonly _startIndex: number

    constructor(query: string, startIndex: number, escapeCharMap?: { [escaped: string]: string }) {
        this._query = query
        this._index = startIndex
        this._escapeCharMap = escapeCharMap

        // skip spaces
        while (/[\s\n\r]/.test(this._query[this._index])) ++this._index
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

    skip(s: string) {
        for (const c of s) {
            if (c !== this.peek()) return false
            this._index++
        }
        return true
    }

    setIndex(index: number) {
        this._index = index
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