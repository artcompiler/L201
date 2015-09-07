exports.globalLexicon = {
    "let" : { "tk": 0x12, "cls": "keyword" },
    "if" : { "tk": 0x05, "cls": "keyword" },
    "then" : { "tk": 0x06, "cls": "keyword" },
    "else" : { "tk": 0x07, "cls": "keyword" },
    "case" : { "tk": 0x0F, "cls": "keyword" },
    "of" : { "tk": 0x10, "cls": "keyword" },
    "end" : { "tk": 0x11, "cls": "keyword", "length": 0 },
    "true" : { "tk": 0x14, "cls": "val", "length": 0 },
    "false" : { "tk": 0x14, "cls": "val", "length": 0 },
    "add" : { "tk": 0x01, "name": "ADD", "cls": "function", "length": 2 , "arity": 2 },  
    "mul" : { "tk": 0x01, "name": "MUL", "cls": "function", "length": 2 , "arity": 2 },
    "addD" : { "tk": 0x01, "name": "ADDD", "cls": "function", "length": 2 , "arity": 2 },  
    "mulD" : { "tk": 0x01, "name": "MULD", "cls": "function", "length": 2 , "arity": 2 },
    "data" : { "tk" : 0x01, "name": "DATA", "cls": "function", "length": 1, "arity": 1 },
    "bar" : { "tk": 0x01, "name": "BAR", "cls": "function", "length": 1, "arity": 1},
    "radial" : { "tk": 0x01, "name": "RADIAL", "cls": "function", "length": 1, "arity": 1},
    "animate" : { "tk": 0x01, "name": "ANIMATE", "cls": "function", "length": 2, "arity": 2},
    "size" : { "tk": 0x01, "name": "SIZE", "cls" : "function", "length": 2, "arity": 2},
    "rgb" : { "tk": 0x01, "name": "RGB", "cls" : "function", "length": 3, "arity": 3},
    "thickness" : { "tk": 0x01, "name": "THICK", "cls" : "function", "length": 2, "arity": 2},
    "rotate" : { "tk": 0x01, "name": "ROTATE", "cls": "function", "length": 2, "arity": 2},
    "fraction" : { "tk": 0x01, "name": "FRACTION", "cls": "function", "length": 1, "arity": 1},
    "style" : { "tk": 0x01, "name": "STYLE", "cls": "function", "length": 2, "arity": 2 },
    "bar-background" : { "tk": 0x01, "name": "BBGD", "cls": "function", "length": 2, "arity": 2},
    "fill" : { "tk": 0x01, "name": "FILL", "cls": "function", "length": 2, "arity": 2},
    "backopacity" : { "tk": 0x01, "name": "BACKOPACITY", "cls": "function", "length": 2, "arity": 2},
    "opacity" : { "tk": 0x01, "name": "OPACITY", "cls": "function", "length": 2, "arity": 2},
    "background" : { "tk": 0x01, "name": "BGD", "cls": "function", "length": 1, "arity": 1},
    "rounding" : { "tk": 0x01, "name": "ROUNDING", "cls": "function", "length": 2, "arity": 2},
    "inner-radius" : { "tk": 0x01, "name": "INNER", "cls": "function", "length": 2, "arity": 2},
    "outer-radius" : { "tk": 0x01, "name": "OUTER", "cls": "function", "length": 2, "arity": 2},
    "labels" : { "tk": 0x01, "name": "LABELS", "cls": "function", "length": 2, "arity": 2},
    "dividers" : { "tk": 0x01, "name": "DIVIDERS", "cls": "function", "length": 2, "arity": 2},
    "divider-width" : { "tk": 0x01, "name": "DIVWIDTH", "cls": "function", "length": 2, "arity": 2},
    "brewer" : { "tk": 0x01, "name": "BREWER", "cls": "function", "length": 2, "arity": 2},
    "gap" : { "tk": 0x01, "name": "GAP", "cls": "function", "length": 2, "arity": 2},   
    "get" : { "tk" : 0x01, "name": "GET", "cls": "function", "length": 1, "arity": 1 },
    "secondary-bar" : { "tk": 0x01, "name": "SECBAR", "cls": "function", "length": 1, "arity": 1},  
}
