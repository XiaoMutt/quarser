import {expect, test} from 'vitest'
import {parseQuery} from '../src/index'
import {
    ParsedFilterNode,
    ParsedRawFilterKeyNode,
    ParsedRawFilterOperatorNode,
    ParsedRawFilterValueNode
} from "../src/filter";


test('startswith', ()=>{
    expect(parseQuery('`key` startswith "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("startswith", 6, 16),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 17, 22)
        )
    )
})

test('endswith', ()=>{
    expect(parseQuery('`key` endswith "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("endswith", 6, 14),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 15, 20)
        )
    )
})

test('contains', ()=>{
    expect(parseQuery('`key` contains "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("contains", 6, 14),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 15, 20)
        )
    )
})

test('==', ()=>{
    expect(parseQuery('`key` == "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("==", 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 9, 14)
        )
    )
})

test('<=', ()=>{
    expect(parseQuery('`key` <= "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("<=", 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 9, 14)
        )
    )
})

test('>=', ()=>{
    expect(parseQuery('`key` >= "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(">=", 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 9, 14)
        )
    )
})

test('!=', ()=>{
    expect(parseQuery('`key` != "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("!=", 6, 8),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 9, 14)
        )
    )
})


test('>', ()=>{
    expect(parseQuery('`key` > "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(">", 6, 7),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 8, 13)
        )
    )
})

test('<', ()=>{
    expect(parseQuery('`key` < "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode("<", 6, 7),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 8, 13)
        )
    )
})

test(':', ()=>{
    expect(parseQuery('`key` : "abc"')).toEqual(
        new ParsedFilterNode(
            new ParsedRawFilterOperatorNode(":", 6, 7),
            new ParsedRawFilterKeyNode("key", 0, 5),
            new ParsedRawFilterValueNode("abc", 8, 13)
        )
    )
})