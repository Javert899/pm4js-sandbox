(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IsolationForest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var treeNode_1 = require("./treeNode");
var ITree = /** @class */ (function () {
    function ITree(X, heightLimit) {
        this.rootNode = new treeNode_1.TreeNode(X, 0, heightLimit);
    }
    ITree.prototype.pathLength = function (x, treeNode, currentPathLength) {
        if (treeNode.isExternalNode()) {
            return currentPathLength + averagePathLength(treeNode.size());
        }
        var splitAttr = treeNode.splitAttribute;
        if (x[splitAttr] < treeNode.splitValue) {
            return this.pathLength(x, treeNode.leftChild, currentPathLength + 1);
        }
        else {
            return this.pathLength(x, treeNode.rightChild, currentPathLength + 1);
        }
    };
    ITree.prototype.size = function () {
        return this.rootNode.size();
    };
    ITree.prototype.getRootNode = function () {
        return this.rootNode;
    };
    return ITree;
}());
exports.ITree = ITree;
function averagePathLength(n) {
    if (n === 0 || n === 1) {
        return 0;
    }
    else if (n === 2) {
        return 1;
    }
    return 2 * harmonicNumber(n - 1) - (2 * (n - 1)) / n;
}
exports.averagePathLength = averagePathLength;
exports.EULER_MASCHERONI = 0.57721;
function harmonicNumber(i) {
    return Math.log(i) + exports.EULER_MASCHERONI;
}
exports.harmonicNumber = harmonicNumber;

},{"./treeNode":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TreeNode = /** @class */ (function () {
    function TreeNode(X, height, heightLimit) {
        var _this = this;
        this.leftChild = undefined;
        this.rightChild = undefined;
        this.splitAttribute = undefined;
        this.splitValue = undefined;
        this.height = height;
        this.heightLimit = heightLimit;
        if (height >= heightLimit || X.length <= 1) {
            this.X = X;
            return this;
        }
        else {
            var attributes = this.getAttributes(X[0]);
            this.splitAttribute = attributes[Math.floor(Math.random() * attributes.length)];
            var splitAttributeArray = X.map(function (x) { return x[_this.splitAttribute]; });
            var attributeMax = this.max(splitAttributeArray);
            var attributeMin = this.min(splitAttributeArray);
            this.splitValue = Math.random() * (attributeMax - attributeMin) + attributeMin;
            var dataSplitA = X.filter(function (x) { return x[_this.splitAttribute] < _this.splitValue; });
            var dataSplitB = X.filter(function (x) { return x[_this.splitAttribute] >= _this.splitValue; });
            this.leftChild = new TreeNode(dataSplitA, height + 1, heightLimit);
            this.rightChild = new TreeNode(dataSplitB, height + 1, heightLimit);
            return this;
        }
    }
    TreeNode.prototype.max = function (arr) {
        var len = arr.length;
        var max = arr[0];
        while (len--) {
            max = max >= arr[len] ? max : arr[len];
        }
        return max;
    };
    TreeNode.prototype.min = function (arr) {
        var len = arr.length;
        var min = arr[0];
        while (len--) {
            min = min >= arr[len] ? arr[len] : min;
        }
        return min;
    };
    TreeNode.prototype.isExternalNode = function () {
        return this.leftChild === undefined && this.rightChild === undefined;
    };
    TreeNode.prototype.isInternalNode = function () {
        return this.leftChild !== undefined && this.rightChild !== undefined;
    };
    TreeNode.prototype.size = function () {
        if (this.X !== undefined) {
            return this.X.length;
        }
        return 0;
    };
    TreeNode.prototype.getAttributes = function (x) {
        return Object.keys(x);
    };
    return TreeNode;
}());
exports.TreeNode = TreeNode;

},{}],3:[function(require,module,exports){
(function (global){(function (){
/*jshint -W054 */
(function (exports) {
  'use strict';

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  exports.knuthShuffle = shuffle;
}('undefined' !== typeof exports && exports || 'undefined' !== typeof window && window || global));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iTree_1 = require("./iTree");
var shuffle = require('knuth-shuffle').knuthShuffle;
var IsolationForest = /** @class */ (function () {
    function IsolationForest(numberOfTrees, subsamplingSize) {
        if (numberOfTrees === void 0) { numberOfTrees = 100; }
        if (subsamplingSize === void 0) { subsamplingSize = 256; }
        this.subsamplingSize = subsamplingSize;
        this.numberOfTrees = numberOfTrees;
        this.trees = [];
        this.X = [];
    }
    IsolationForest.prototype.fit = function (X) {
        this.X = X;
        if (this.X.length < this.subsamplingSize) {
            this.subsamplingSize = this.X.length;
        }
        var heightLimit = Math.ceil(Math.log2(this.subsamplingSize));
        for (var i = 0; i < this.numberOfTrees; i++) {
            var subsample = this.getSubsample(this.subsamplingSize);
            var iTree = new iTree_1.ITree(this.X, heightLimit);
            this.trees.push(iTree);
        }
        return this.trees;
    };
    IsolationForest.prototype.scores = function () {
        return this.predict(this.X);
    };
    IsolationForest.prototype.predict = function (X) {
        var scoreArray = [];
        for (var _i = 0, X_1 = X; _i < X_1.length; _i++) {
            var x = X_1[_i];
            var pathLength = 0;
            for (var j = 0; j < this.numberOfTrees; j++) {
                pathLength += this.trees[j].pathLength(x, this.trees[j].getRootNode(), 0);
            }
            var meanPathLength = pathLength / this.numberOfTrees;
            var score = Math.pow(2, -(meanPathLength / iTree_1.averagePathLength(this.subsamplingSize)));
            scoreArray.push(score);
        }
        return scoreArray;
    };
    IsolationForest.prototype.getSubsample = function (subsampleSize) {
        var subsample = [];
        var data = shuffle(this.X.slice(0));
        return data.slice(0, subsampleSize);
    };
    return IsolationForest;
}());
exports.IsolationForest = IsolationForest;

},{"./iTree":1,"knuth-shuffle":3}]},{},[4])(4)
});
