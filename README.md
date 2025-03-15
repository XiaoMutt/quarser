# [Quarser](https://github.com/XiaoMutt/quarser)

Quarser, a JavaScript data query parser written in TypeScript.


       ____
      / __ \                                
     | |  | |_   _  __ _ _ __ ___  ___ _ __ 
     | |  | | | | |/ _` | '__/ __|/ _ \ '__|
     | |__| | |_| | (_| | |  \__ \  __/ |   
      \___\_\\__,_|\__,_|_|  |___/\___|_|   

# Introduction

Quarser is a parser designed for querying data. It parses a data query into a binary tree which can then be translated
to SQL or Elasticsearch queries structurally.

# Data Query

A Quarser data query consists of `filters` grouped by `logical operators` (not, and, or) and `parentheses`.

## Filter

### Description

A filter has three components:

- filter key: must be enclosed by ``
- filter operator: > < ==, in, :, etc (see source code for details)
- filter value: if double-quoted, then the value is parsed as a string; otherwise:
    - if the value is the text "null", then it is parsed as null.
    - if the value follows a number pattern, then it is parsed as a number. E.g. 1.0, 3e-9, 3.14, etc.
    - if the value follows a boolean pattern, then it is parsed as a boolean. E.g. true, false, TRUE, False, etc.
    - else the value is parsed as a string. E.g. abc, R2D2, etc.
- Notice the filter key and filter operator can be ignored altogether. In this case, how to interpret the filter
  depends on the programmer.

### Example

- abc
    - this query is a single filter with value "abc"
- \`isPublic\` == true
    - this query means the field \`isPublic\` should equal the value true
- \`pi\`: "3.14"
    - this query means the field \`pi\`'s value should match the string "3.14"

## ParsedNode

### Description

The node of in the parsed tree is called ParsedNode. It has the following properties:

- type, the type of this node
- value, the value of this node
- left, the left child which is also a ParsedNode or undefined
- right, the right branch which is also a ParsedNode or undefined
- start, the start position in the query string of this node
- stop, the stop position in the query string of this node
- isValid, whether this node is valid.

There are two types of ParsedNode: ParsedRawNode and ParsedOperativeNode.

### ParsedRawNode

These nodes are the leaves in the parsed tree. The value of the node is the raw value: string, number, boolean, null

### ParsedOperativeNode

These nodes are the connecting nodes in the parsed tree, representing an operation.

- for Filter Operative Nodes,
    - the value is the filter operator: >, <, ==, etc.
    - the left child is the parsed filter key
    - the right child is the parsed filter value
- for Logical Operative Nodes,
    - the value is a ParseRawNode of a logical operator
    - the left and right child are the nodes the operator apply to. For unary operator not, the right child is filled.
- for Parentheses Operative Nodes,
    - the value is the ParsedNode the parentheses enclosed
    - the left and right child are the ParsedRawNode of the text ( and ), respectively.

# Error Handling

Quarser parses a query from right to left. If there are parsing errors along the way it will exit at the error spot and
return a tree whose root node's isValid is false. The error position can be found by traversing the tree to find the
inValid leaf node. Notice that for an invalid node, the stop property will be undefined.

# Example:

```javascript
parseQuery('(abc or not `condition`: false) and `key`>1')
```

will result in a parsed tree:

```
ParsedLogicalAndNode {
  "isValid": true,
  "left": ParsedParenthesesNode {
    "isValid": true,
    "left": ParsedRawParenthesisNode {
      "isValid": true,
      "left": undefined,
      "right": undefined,
      "start": 0,
      "stop": 1,
      "type": "parenthesis",
      "value": "(",
    },
    "right": ParsedRawParenthesisNode {
      "isValid": true,
      "left": undefined,
      "right": undefined,
      "start": 30,
      "stop": 31,
      "type": "parenthesis",
      "value": ")",
    },
    "start": 0,
    "stop": 31,
    "type": "parentheses",
    "value": ParsedLogicalOrNode {
      "isValid": true,
      "left": ParsedFilterNode {
        "isValid": true,
        "left": ParsedRawFilterKeyNode {
          "isValid": true,
          "left": undefined,
          "right": undefined,
          "start": 1,
          "stop": 1,
          "type": "filter_key",
          "value": null,
        },
        "right": ParsedRawFilterValueNode {
          "isValid": true,
          "left": undefined,
          "right": undefined,
          "start": 1,
          "stop": 4,
          "type": "filter_value",
          "value": "abc",
        },
        "start": 1,
        "stop": 4,
        "type": "filter",
        "value": ParsedRawFilterOperatorNode {
          "isValid": true,
          "left": undefined,
          "right": undefined,
          "start": 1,
          "stop": 1,
          "type": "filter_operator",
          "value": null,
        },
      },
      "right": ParsedLogicalNotNode {
        "isValid": true,
        "left": undefined,
        "right": ParsedFilterNode {
          "isValid": true,
          "left": ParsedRawFilterKeyNode {
            "isValid": true,
            "left": undefined,
            "right": undefined,
            "start": 12,
            "stop": 23,
            "type": "filter_key",
            "value": "condition",
          },
          "right": ParsedRawFilterValueNode {
            "isValid": true,
            "left": undefined,
            "right": undefined,
            "start": 25,
            "stop": 30,
            "type": "filter_value",
            "value": false,
          },
          "start": 12,
          "stop": 30,
          "type": "filter",
          "value": ParsedRawFilterOperatorNode {
            "isValid": true,
            "left": undefined,
            "right": undefined,
            "start": 23,
            "stop": 24,
            "type": "filter_operator",
            "value": ":",
          },
        },
        "start": 8,
        "stop": 30,
        "type": "logic",
        "value": ParsedRawLogicalOperatorNode {
          "isValid": true,
          "left": undefined,
          "right": undefined,
          "start": 8,
          "stop": 11,
          "type": "logical_operator",
          "value": "not",
        },
      },
      "start": 1,
      "stop": 30,
      "type": "logic",
      "value": ParsedRawLogicalOperatorNode {
        "isValid": true,
        "left": undefined,
        "right": undefined,
        "start": 5,
        "stop": 7,
        "type": "logical_operator",
        "value": "or",
      },
    },
  },
  "right": ParsedFilterNode {
    "isValid": true,
    "left": ParsedRawFilterKeyNode {
      "isValid": true,
      "left": undefined,
      "right": undefined,
      "start": 36,
      "stop": 41,
      "type": "filter_key",
      "value": "key",
    },
    "right": ParsedRawFilterValueNode {
      "isValid": true,
      "left": undefined,
      "right": undefined,
      "start": 42,
      "stop": 43,
      "type": "filter_value",
      "value": 1,
    },
    "start": 36,
    "stop": 43,
    "type": "filter",
    "value": ParsedRawFilterOperatorNode {
      "isValid": true,
      "left": undefined,
      "right": undefined,
      "start": 41,
      "stop": 42,
      "type": "filter_operator",
      "value": ">",
    },
  },
  "start": 0,
  "stop": 43,
  "type": "logic",
  "value": ParsedRawLogicalOperatorNode {
    "isValid": true,
    "left": undefined,
    "right": undefined,
    "start": 32,
    "stop": 35,
    "type": "logical_operator",
    "value": "and",
  },
}
```

# LICENSE
Can you believe it? It is ISC!
