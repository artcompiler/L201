/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Art Compiler LLC */

import {assert, message, messages, reserveCodeRange} from "./assert.js"

reserveCodeRange(1000, 1999, "compile");
messages[1001] = "Node ID %1 not found in pool.";
messages[1002] = "Invalid tag in node with Node ID %1.";
messages[1003] = "No aync callback provided.";
messages[1004] = "No visitor method defined for '%1'.";

let translate = function() {
  function print(str) {
    console.log(str);
  }
  let nodePool;
  function translate(pool, resume) {
    print("pool=" + JSON.stringify(pool, null, 2));
    nodePool = pool;
    return visit(pool.root, {}, resume);
  }
  function visit(nid, options, resume) {
    assert(typeof resume === "function", message(1003));
    // Get the node from the pool of nodes.
    let node = nodePool[nid];
    assert(node, message(1001, [nid]));
    assert(node.tag, message(1001, [nid]));
    assert(typeof table[node.tag] === "function", message(1004, [node.tag]));
    return table[node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  let edgesNode;
  function str(node, options, resume) {
    let val = node.elts[0];
    resume(null, val);
  }
  function num(node, options, resume) {
    let val = node.elts[0];
    resume(null, val);
  }
  function ident(node, options, resume) {
    let val = node.elts[0];
    resume(null, val);
  }
  function bool(node, options, resume) {
    let val = node.elts[0];
    resume(null, val);
  }
  function add(node, options, resume) {
    visit(node.elts[0], options, function (err, v1) {
      visit(node.elts[1], options, function (err, v2) {
        let val = +v1 + +v2;
        if (isNaN(val)) {
          console.log("add() val=" + val);
          resume("NaN", null);
        } else {
          resume(null, val);
        }
      });
    });
  };
  function mul(node, options, resume) {
    visit(node.elts[0], options, function (err, v1) {
      visit(node.elts[1], options, function (err, v2) {
        let val = +v1 * +v2;
        if (isNaN(val)) {
          console.log("mul() val=" + val);
          resume("NaN", null);
        } else {
          resume(null, val);
        }
      });
    });
  };
  function addD(node, options, resume) {
    add(node, options, function(err, val){
      if (isNaN(val)) {
        resume("NaN", null);
      } else {
        val = Math.round(val*100) / 100;
        resume(null, val);
      }
   });
  };
  function mulD(node, options, resume) {
    mul(node, options, function(err, val){
      if (isNaN(val)) {
        resume("NaN", null);
      } else {
        val = Math.round(val*100) / 100;
        resume(null, val);
      }
   });
  };
  function current(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      if(isNaN(val)){
        resume("Current is NaN", null);
      } else {
        let value = {current: (Math.round(val*100) / 100)}
        resume(null, value);
      }
    });
  }
  function goal(node, options, resume) {
    visit(node.elts[0], options, function (err, v1) {
      visit(node.elts[1], options, function (err, v2) {
        if(isNaN(v2)){
          resume("Goal is NaN", null);
        } else if(typeof v1 !== "object" || !v1) {
          resume("Valid Current value not given", null);
        } else {
          v1.goal = Math.round(v2*100) / 100;
          resume(null, v1);
        }
      });
    });
  }  
  function list(node, options, resume) {
    visit(node.elts[0], options, function (err, val) {
      if (!(val instanceof Array)) {
        val = [val];
      }
      resume(null, val);
    });
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, resume);
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length) {
      visit(node.elts[0], options, function (error, val) {
        node.elts.shift();
        exprs(node, options, function (err, data) {
          data.unshift(val);
          if(err && error){//if neither is null we add them
            err = error + ", " + err;
          } else if(error){//if err is null we use error
            err = error;
          }//otherwise we use err, null or not
          resume (err, data);
        });
      });
    } else {
      resume(null, []);
    }
  };
  let table = {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST" : list,
    "ADD" : add,
    "MUL" : mul,
    "ADDD" : addD,
    "MULD" : mulD,
    "GOAL" : goal,
    "CURRENT" : current,
  }
  return translate;
}();

let render = function() {
  function escapeXML(str) {
    return String(str)
      .replace(/&(?!\w+;)/g, "&amp;")
      .replace(/\n/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function render(node, resume) {
    resume(null, node);
  }
  return render;
}();

export let compiler = function () {
  exports.compile = function compile(pool, resume) {
    // Compiler takes an AST in the form of a node pool and translates it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      translate(pool, function (err, data) {
        console.log("translate data=" + JSON.stringify(data, null, 2));
        if (err) {
          resume(err, data);
        } else {
          render(data, function (err, data) {
            console.log("render " + "data=" + JSON.stringify(data, null, 2));
            resume(err, data);
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume("Compiler error", {
        score: 0
      });
    }
  }
}();
