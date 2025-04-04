var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
/**
 * avl v1.6.0
 * Fast AVL tree for Node and browser
 *
 * @author Alexander Milevski <alex@milevski.co>
 * @license MIT
 * @preserve
 */
function print(root, printNode = (n) => n.key) {
  const out = [];
  row(root, "", true, (v) => out.push(v), printNode);
  return out.join("");
}
function row(root, prefix, isTail, out, printNode) {
  if (root) {
    out(`${prefix}${isTail ? "└── " : "├── "}${printNode(root)}
`);
    const indent = prefix + (isTail ? "    " : "│   ");
    if (root.left) row(root.left, indent, false, out, printNode);
    if (root.right) row(root.right, indent, true, out, printNode);
  }
}
function isBalanced(root) {
  if (root === null) return true;
  const lh = height(root.left);
  const rh = height(root.right);
  if (Math.abs(lh - rh) <= 1 && isBalanced(root.left) && isBalanced(root.right))
    return true;
  return false;
}
function height(node) {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
}
function loadRecursive(parent, keys, values, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const key = keys[middle];
    const data = values[middle];
    const node = { key, data, parent };
    node.left = loadRecursive(node, keys, values, start, middle);
    node.right = loadRecursive(node, keys, values, middle + 1, end);
    return node;
  }
  return null;
}
function markBalance(node) {
  if (node === null) return 0;
  const lh = markBalance(node.left);
  const rh = markBalance(node.right);
  node.balanceFactor = lh - rh;
  return Math.max(lh, rh) + 1;
}
function sort(keys, values, left, right, compare) {
  if (left >= right) return;
  const pivot = keys[left + right >> 1];
  let i = left - 1;
  let j = right + 1;
  while (true) {
    do
      i++;
    while (compare(keys[i], pivot) < 0);
    do
      j--;
    while (compare(keys[j], pivot) > 0);
    if (i >= j) break;
    const tmpk = keys[i];
    keys[i] = keys[j];
    keys[j] = tmpk;
    const tmpv = values[i];
    values[i] = values[j];
    values[j] = tmpv;
  }
  sort(keys, values, left, j, compare);
  sort(keys, values, j + 1, right, compare);
}
function DEFAULT_COMPARE(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
function rotateLeft(node) {
  const rightNode = node.right;
  node.right = rightNode.left;
  if (rightNode.left) rightNode.left.parent = node;
  rightNode.parent = node.parent;
  if (rightNode.parent) {
    if (rightNode.parent.left === node) {
      rightNode.parent.left = rightNode;
    } else {
      rightNode.parent.right = rightNode;
    }
  }
  node.parent = rightNode;
  rightNode.left = node;
  node.balanceFactor += 1;
  if (rightNode.balanceFactor < 0) {
    node.balanceFactor -= rightNode.balanceFactor;
  }
  rightNode.balanceFactor += 1;
  if (node.balanceFactor > 0) {
    rightNode.balanceFactor += node.balanceFactor;
  }
  return rightNode;
}
function rotateRight(node) {
  const leftNode = node.left;
  node.left = leftNode.right;
  if (node.left) node.left.parent = node;
  leftNode.parent = node.parent;
  if (leftNode.parent) {
    if (leftNode.parent.left === node) {
      leftNode.parent.left = leftNode;
    } else {
      leftNode.parent.right = leftNode;
    }
  }
  node.parent = leftNode;
  leftNode.right = node;
  node.balanceFactor -= 1;
  if (leftNode.balanceFactor > 0) {
    node.balanceFactor -= leftNode.balanceFactor;
  }
  leftNode.balanceFactor -= 1;
  if (node.balanceFactor < 0) {
    leftNode.balanceFactor += node.balanceFactor;
  }
  return leftNode;
}
class AVLTree {
  constructor(comparator = DEFAULT_COMPARE, noDuplicates = false) {
    __publicField(this, "_comparator");
    __publicField(this, "_root");
    __publicField(this, "_size");
    __publicField(this, "_noDuplicates");
    this._comparator = comparator || DEFAULT_COMPARE;
    this._root = null;
    this._size = 0;
    this._noDuplicates = !!noDuplicates;
  }
  /**
   * Clear the tree
   */
  destroy() {
    return this.clear();
  }
  /**
   * Clear the tree
   * @return {AVLTree}
   */
  clear() {
    this._root = null;
    this._size = 0;
    return this;
  }
  /**
   * Number of nodes
   * @return {number}
   */
  get size() {
    return this._size;
  }
  get root() {
    return this._root;
  }
  /**
   * Whether the tree contains a node with the given key
   */
  contains(key) {
    if (this._root) {
      let node = this._root;
      const comparator = this._comparator;
      while (node) {
        const cmp = comparator(key, node.key);
        if (cmp === 0) return true;
        else if (cmp < 0) node = node.left;
        else node = node.right;
      }
    }
    return false;
  }
  /**
   * Successor node
   */
  next(node) {
    let successor = node;
    if (successor) {
      if (successor.right) {
        successor = successor.right;
        while (successor.left) successor = successor.left;
      } else {
        successor = node.parent;
        while (successor && successor.right === node) {
          node = successor;
          successor = successor.parent;
        }
      }
    }
    return successor;
  }
  /**
   * Predecessor node
   */
  prev(node) {
    let predecessor = node;
    if (predecessor) {
      if (predecessor.left) {
        predecessor = predecessor.left;
        while (predecessor.right) predecessor = predecessor.right;
      } else {
        predecessor = node.parent;
        while (predecessor && predecessor.left === node) {
          node = predecessor;
          predecessor = predecessor.parent;
        }
      }
    }
    return predecessor;
  }
  /**
   * @param  {forEachCallback} callback
   * @return {AVLTree}
   */
  forEach(callback) {
    let current = this._root;
    const s = [];
    let done = false;
    let i = 0;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          callback(current, i++);
          current = current.right;
        } else done = true;
      }
    }
    return this;
  }
  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param  {Key}      low
   * @param  {Key}      high
   * @param  {Function} fn
   * @param  {*?}       ctx
   * @return {SplayTree}
   */
  range(low, high, fn, ctx) {
    const Q = [];
    const compare = this._comparator;
    let node = this._root;
    while (Q.length !== 0 || node) {
      if (node) {
        Q.push(node);
        node = node.left;
      } else {
        node = Q.pop();
        const cmp = compare(node.key, high);
        if (cmp > 0) break;
        else if (compare(node.key, low) >= 0) {
          if (fn.call(ctx, node)) return this;
        }
        node = node.right;
      }
    }
    return this;
  }
  /**
   * Returns all keys in order
   */
  keys() {
    let current = this._root;
    const s = [];
    const r = [];
    let done = false;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          r.push(current.key);
          current = current.right;
        } else done = true;
      }
    }
    return r;
  }
  /**
   * Returns `data` fields of all nodes in order.
   */
  values() {
    let current = this._root;
    const s = [];
    const r = [];
    let done = false;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          r.push(current.data);
          current = current.right;
        } else done = true;
      }
    }
    return r;
  }
  /**
   * Returns node at given index
   */
  at(index) {
    let current = this._root;
    const s = [];
    let done = false;
    let i = 0;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          if (i === index) return current;
          i++;
          current = current.right;
        } else done = true;
      }
    }
    return null;
  }
  /**
   * Returns node with the minimum key
   */
  minNode() {
    let node = this._root;
    if (!node) return null;
    while (node.left) node = node.left;
    return node;
  }
  /**
   * Returns node with the max key
   */
  maxNode() {
    let node = this._root;
    if (!node) return null;
    while (node.right) node = node.right;
    return node;
  }
  /**
   * Min key
   */
  min() {
    let node = this._root;
    if (!node) return null;
    while (node.left) node = node.left;
    return node.key;
  }
  /**
   * Max key
   */
  max() {
    let node = this._root;
    if (!node) return null;
    while (node.right) node = node.right;
    return node.key;
  }
  /**
   * @return {boolean} true/false
   */
  isEmpty() {
    return this._root === null;
  }
  /**
   * Removes and returns the node with smallest key
   */
  pop() {
    let node = this._root;
    let returnValue = null;
    if (node) {
      while (node.left) node = node.left;
      returnValue = { key: node.key, data: node.data };
      this.remove(node.key);
    }
    return returnValue;
  }
  /**
   * Removes and returns the node with highest key
   */
  popMax() {
    let node = this._root;
    let returnValue = null;
    if (node) {
      while (node.right) node = node.right;
      returnValue = { key: node.key, data: node.data };
      this.remove(node.key);
    }
    return returnValue;
  }
  /**
   * Find node by key
   */
  find(key) {
    const root = this._root;
    let subtree = root;
    const compare = this._comparator;
    while (subtree) {
      const cmp = compare(key, subtree.key);
      if (cmp === 0) return subtree;
      else if (cmp < 0) subtree = subtree.left;
      else subtree = subtree.right;
    }
    return null;
  }
  /**
   * Insert a node into the tree
   */
  insert(key, data) {
    if (!this._root) {
      this._root = {
        parent: null,
        left: null,
        right: null,
        balanceFactor: 0,
        key,
        data
      };
      this._size++;
      return this._root;
    }
    const compare = this._comparator;
    let node = this._root;
    let parent = null;
    let cmp = 0;
    if (this._noDuplicates) {
      while (node) {
        cmp = compare(key, node.key);
        parent = node;
        if (cmp === 0) return null;
        else if (cmp < 0) node = node.left;
        else node = node.right;
      }
    } else {
      while (node) {
        cmp = compare(key, node.key);
        parent = node;
        if (cmp <= 0) node = node.left;
        else node = node.right;
      }
    }
    const newNode = {
      left: null,
      right: null,
      balanceFactor: 0,
      parent,
      key,
      data
    };
    let newRoot = null;
    if (cmp <= 0) parent.left = newNode;
    else parent.right = newNode;
    while (parent) {
      cmp = compare(parent.key, key);
      if (cmp < 0) parent.balanceFactor -= 1;
      else parent.balanceFactor += 1;
      if (parent.balanceFactor === 0) break;
      else if (parent.balanceFactor < -1) {
        if (parent.right.balanceFactor === 1) rotateRight(parent.right);
        newRoot = rotateLeft(parent);
        if (parent === this._root) this._root = newRoot;
        break;
      } else if (parent.balanceFactor > 1) {
        if (parent.left.balanceFactor === -1) rotateLeft(parent.left);
        newRoot = rotateRight(parent);
        if (parent === this._root) this._root = newRoot;
        break;
      }
      parent = parent.parent;
    }
    this._size++;
    return newNode;
  }
  /**
   * Removes the node from the tree. If not found, returns null.
   */
  remove(key) {
    if (!this._root) return null;
    let node = this._root;
    const compare = this._comparator;
    let cmp = 0;
    while (node) {
      cmp = compare(key, node.key);
      if (cmp === 0) break;
      else if (cmp < 0) node = node.left;
      else node = node.right;
    }
    if (!node) return null;
    const returnValue = node.key;
    let max, min;
    if (node.left) {
      max = node.left;
      while (max.left || max.right) {
        while (max.right) max = max.right;
        node.key = max.key;
        node.data = max.data;
        if (max.left) {
          node = max;
          max = max.left;
        }
      }
      node.key = max.key;
      node.data = max.data;
      node = max;
    }
    if (node.right) {
      min = node.right;
      while (min.left || min.right) {
        while (min.left) min = min.left;
        node.key = min.key;
        node.data = min.data;
        if (min.right) {
          node = min;
          min = min.right;
        }
      }
      node.key = min.key;
      node.data = min.data;
      node = min;
    }
    let parent = node.parent;
    let pp = node;
    let newRoot;
    while (parent) {
      if (parent.left === pp) parent.balanceFactor -= 1;
      else parent.balanceFactor += 1;
      if (parent.balanceFactor < -1) {
        if (parent.right.balanceFactor === 1) rotateRight(parent.right);
        newRoot = rotateLeft(parent);
        if (parent === this._root) this._root = newRoot;
        parent = newRoot;
      } else if (parent.balanceFactor > 1) {
        if (parent.left.balanceFactor === -1) rotateLeft(parent.left);
        newRoot = rotateRight(parent);
        if (parent === this._root) this._root = newRoot;
        parent = newRoot;
      }
      if (parent.balanceFactor === -1 || parent.balanceFactor === 1) break;
      pp = parent;
      parent = parent.parent;
    }
    if (node.parent) {
      if (node.parent.left === node) node.parent.left = null;
      else node.parent.right = null;
    }
    if (node === this._root) this._root = null;
    this._size--;
    return returnValue;
  }
  /**
   * Bulk-load items
   */
  load(keys = [], values = [], presort) {
    if (this._size !== 0) throw new Error("bulk-load: tree is not empty");
    const size = keys.length;
    if (presort) sort(keys, values, 0, size - 1, this._comparator);
    this._root = loadRecursive(null, keys, values, 0, size);
    markBalance(this._root);
    this._size = size;
    return this;
  }
  /**
   * Returns true if the tree is balanced
   */
  isBalanced() {
    return isBalanced(this._root);
  }
  /**
   * String representation of the tree - primitive horizontal print-out
   */
  toString(printNode) {
    return print(this._root, printNode);
  }
}

var Tree = AVLTree;

function Sweepline(position) {
    this.x = null;
    this.position = position;
}

Sweepline.prototype.setPosition = function (position) {
    this.position = position;
}

Sweepline.prototype.setX = function (x) {
    this.x = x;
}

var Point = function (coords, type, segmentID) {
	this.segmentID = segmentID;
    this.x = coords[0];
    this.y = coords[1];
    this.type = type;
    this.segments = [];
}

var EPS = 1E-9;

/**
 * @param a vector
 * @param b vector
 * @param c vector
 */
function onSegment(a, b, c) {
    var x1 = a[0],
        x2 = b[0],
        x3 = c[0],
        y1 = a[1],
        y2 = b[1],
        y3 = c[1];

    return (Math.min(x1, x2) <= x3) && (x3 <= Math.max(x1, x2)) &&
           (Math.min(y1, y2) <= y3) && (y3 <= Math.max(y1, y2));
}

/**
 * ac x bc
 * @param a vector
 * @param b vector
 * @param c vector
 */
function direction(a, b, c) {
    var x1 = a[0],
        x2 = b[0],
        x3 = c[0],
        y1 = a[1],
        y2 = b[1],
        y3 = c[1];

    return (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
}

/**
 * @param a segment1
 * @param b segment2
 */
function segmentsIntersect(a, b) {
    var p1 = a[0],
        p2 = a[1],
        p3 = b[0],
        p4 = b[1],
        d1 = direction(p3, p4, p1),
        d2 = direction(p3, p4, p2),
        d3 = direction(p1, p2, p3),
        d4 = direction(p1, p2, p4);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
        return true;
    } else if (d1 === 0 && onSegment(p3, p4, p1)) {
        return true;
    } else if (d2 === 0 && onSegment(p3, p4, p2)) {
        return true;
    } else if (d3 === 0 && onSegment(p1, p2, p3)) {
        return true;
    } else if (d4 === 0 && onSegment(p1, p2, p4)) {
        return true;
    }
    return false;
}

/**
 * @param a segment1
 * @param b segment2
 */
function findSegmentsIntersection (a, b) {
    var x1 = a[0][0],
        y1 = a[0][1],
        x2 = a[1][0],
        y2 = a[1][1],
        x3 = b[0][0],
        y3 = b[0][1],
        x4 = b[1][0],
        y4 = b[1][1];
    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1 >= y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3 >= x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3 >= y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return [x, y];
}

function between (a, b, c) {
    return a - EPS <= b && b <= c + EPS;
}

/**
 * @param a segment1
 * @param b segment2
 */
function compareSegments(a, b) {
    var x1 = a[0][0],
        y1 = a[0][1],
        x2 = a[1][0],
        y2 = a[1][1],
        x3 = b[0][0],
        y3 = b[0][1],
        x4 = b[1][0],
        y4 = b[1][1];

    var currentX,
        ay,
        by,
        deltaY,
        deltaX1,
        deltaX2;

    if (a === b) {
        return 0;
    }

    currentX = this.x;
    ay = getY(a, currentX);
    by = getY(b, currentX);
    deltaY = ay - by;

    if (Math.abs(deltaY) > EPS) {
        return deltaY < 0 ? -1 : 1;
    } else {
        var aSlope = getSlope(a),
            bSlope = getSlope(b);

        if (aSlope !== bSlope) {
            if (this.position === 'before') {
                return aSlope > bSlope ? -1 : 1;
            } else {
                return aSlope > bSlope ? 1 : -1;
            }
        }
    }
    deltaX1 = x1 - x3;

    if (deltaX1 !== 0) {
        return deltaX1 < 0 ? -1 : 1;
    }

    deltaX2 = x2 - x4;

    if (deltaX2 !== 0) {
        return deltaX2 < 0 ? -1 : 1;
    }

    return 0;
};

/**
 * @param a point1
 * @param b point2
 */
function comparePoints(a, b) {
    var aIsArray = Array.isArray(a),
        bIsArray = Array.isArray(b),
        x1 = aIsArray ? a[0] : a.x,
        y1 = aIsArray ? a[1] : a.y,
        x2 = bIsArray ? b[0] : b.x,
        y2 = bIsArray ? b[1] : b.y;

    if (x1 - x2 > EPS || (Math.abs(x1 - x2) < EPS && y1 - y2 > EPS)) {
        return 1;
    } else if (x2 - x1 > EPS || (Math.abs(x1 - x2) < EPS && y2 - y1 > EPS)) {
        return -1;
    } else if (Math.abs(x1 - x2) < EPS && Math.abs(y1 - y2) < EPS ) {
        return 0;
    }
}

function getSlope(segment) {
    var x1 = segment[0][0],
        y1 = segment[0][1],
        x2 = segment[1][0],
        y2 = segment[1][1];

    if (x1 === x2) {
        return (y1 < y2) ? Infinity : - Infinity;
    } else {
        return (y2 - y1) / (x2 - x1);
    }
};

function getY(segment, x) {
    var begin = segment[0],
        end = segment[1],
        span = segment[1][0] - segment[0][0],
        deltaX0,
        deltaX1,
        ifac,
        fac;

    if (x <= begin[0]) {
        return begin[1];
    } else if (x >= end[0]) {
        return end[1];
    }

    deltaX0 = x - begin[0];
    deltaX1 = end[0] - x;

    if (deltaX0 > deltaX1) {
        ifac = deltaX0 / span
        fac = 1 - ifac;
    } else {
        fac = deltaX1 / span
        ifac = 1 - fac;
    }

    return (begin[1] * fac) + (end[1] * ifac);
};

/**
* @param {Array} segments set of segments intersecting sweepline [[[x1, y1], [x2, y2]] ... [[xm, ym], [xn, yn]]]
*/
function findIntersections(segments) {
	var sweepline = new Sweepline('before');
	try{
	    var queue = new Tree(comparePoints, true),
	        status = new Tree(compareSegments.bind(sweepline), true),
	        output = new Tree(comparePoints, true);
	}
	catch(uwu){
		if (!(/is not a constructor/i.test(uwu.message))){
			throw uwu
		}
		var queue = new Tree.default(comparePoints, true),
			status = new Tree.default(compareSegments.bind(sweepline), true),
			output = new Tree.default(comparePoints, true);
	}

	for(let segmentID in segments) {
		let segment = segments[segmentID];
		segment[0].ID = segmentID;
		segment[1].ID = segmentID;
        segment.sort(comparePoints);
        let begin = new Point(segment[0], 'begin', segmentID),
            end   = new Point(segment[1], 'end', segmentID);

        queue.insert(begin, begin);
        begin = queue.find(begin).key;
        begin.segments.push(segment);

        queue.insert(end, end);
    }

    while (!queue.isEmpty()) {
        var point = queue.pop();
        handleEventPoint(point.key, status, output, queue, sweepline);
    }

    return output.keys().map(function(key){
        return {x: key.x, y: key.y, segmentID: key.segmentID};
    });
}

function handleEventPoint(point, status, output, queue, sweepline) {
    sweepline.setPosition('before');
    sweepline.setX(point.x);

    var Up = point.segments, // segments, for which this is the left end
        Lp = [],             // segments, for which this is the right end
        Cp = [];             // // segments, for which this is an inner point

    // step 2
    status.forEach(function(node) {
        var segment = node.key,
            segmentBegin = segment[0],
            segmentEnd = segment[1];

        // count right-ends
        if (Math.abs(point.x - segmentEnd[0]) < EPS && Math.abs(point.y - segmentEnd[1]) < EPS) {
            Lp.push(segment);
        // count inner points
        } else {
            // filter left ends
            if (!(Math.abs(point.x - segmentBegin[0]) < EPS && Math.abs(point.y - segmentBegin[1]) < EPS)) {
                if (Math.abs(direction(segmentBegin, segmentEnd, [point.x, point.y])) < EPS && onSegment(segmentBegin, segmentEnd, [point.x, point.y])) {
                    Cp.push(segment);
                }
            }
        }
    });

    if ([].concat(Up, Lp, Cp).length > 1) {
        output.insert(point, point);
    };

    for (var j = 0; j < Cp.length; j++) {
        status.remove(Cp[j]);
    }

    sweepline.setPosition('after');

    for (var k = 0; k < Up.length; k++) {
        if (!status.contains(Up[k])) {
            status.insert(Up[k]);
        }
    }
    for (var l = 0; l < Cp.length; l++) {
        if (!status.contains(Cp[l])) {
            status.insert(Cp[l]);
        }
    }

    if (Up.length === 0 && Cp.length === 0) {
        for (var i = 0; i < Lp.length; i++) {
            var s = Lp[i],
                sNode = status.find(s),
                sl = status.prev(sNode),
                sr = status.next(sNode);

            if (sl && sr) {
                findNewEvent(sl.key, sr.key, point, output, queue);
            }

            status.remove(s);
        }
    } else {
        var UCp = [].concat(Up, Cp).sort(compareSegments),
            UCpmin = UCp[0],
            sllNode = status.find(UCpmin),
            UCpmax = UCp[UCp.length-1],
            srrNode = status.find(UCpmax),
            sll = sllNode && status.prev(sllNode),
            srr = srrNode && status.next(srrNode);

        if (sll && UCpmin) {
            findNewEvent(sll.key, UCpmin, point, output, queue);
        }

        if (srr && UCpmax) {
            findNewEvent(srr.key, UCpmax, point, output, queue);
        }

        for (var p = 0; p < Lp.length; p++) {
            status.remove(Lp[p]);
        }
    }
    return output;
}

function findNewEvent(sl, sr, point, output, queue) {
    var intersectionCoords = findSegmentsIntersection(sl, sr),
        intersectionPoint;

    if (intersectionCoords) {
        intersectionPoint = new Point(intersectionCoords, 'intersection', [sl[0].ID, sr[0].ID]);

        if (!output.contains(intersectionPoint)) {
            queue.insert(intersectionPoint, intersectionPoint);
        }

        output.insert(intersectionPoint, intersectionPoint);
    }
}