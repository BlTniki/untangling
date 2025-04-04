config = {
    gamePlaneWidth: 1000,
    gamePlaneHeight: 1000,
    verticesCount: 5,
    vertexRadius: 25,
    basicVertexColor: 'rgb(0, 80, 177)',
    highlightedVertexColor: 'rgb(177, 0, 0)',
    edgeWidth: 2,
    basicEdgeColor: 'rgb(0,0,0)',
    highlightedEdgeColor: 'rgb(223, 216, 0)',
    backgroundColor: 'rgb(255, 255, 255)'
}

class Vertex {
    constructor (x, y, hitboxRadius, neighbors=null) {
        this.x = x;
        this.y = y;
        if (neighbors == null) {
            this.neighbors = [];
        } else {
            this.neighbors = neighbors;
        }
        this.hitboxRadius = hitboxRadius
        this.isHighlighted = false;
    }
}

// class Segment {
//     constructor(x1, y1, x2, y2) {
//         // Ensure the start point is the left-most (or lower if vertical)
//         if (x1 < x2 || (x1 === x2 && y1 < y2)) {
//             this.start = { x: x1, y: y1 };
//             this.end = { x: x2, y: y2 };
//         } else {
//             this.start = { x: x2, y: y2 };
//             this.end = { x: x1, y: y1 };
//         }
//     }
//     // Get the y-coordinate at a given x-position on this segment
//     getY(x) {
//         // Handle vertical segments
//         if (this.start.x === this.end.x) return this.start.y;
//         let t = (x - this.start.x) / (this.end.x - this.start.x);
//         return this.start.y + t * (this.end.y - this.start.y);
//     }
// }

//   // Class representing an event in the sweep line algorithm
// class Event {
//     constructor(x, type, seg1, seg2 = null) {
//         this.x = x;          // x-coordinate of event
//         this.type = type;    // "start", "end", or "intersection"
//         this.seg1 = seg1;    // primary segment
//         this.seg2 = seg2;    // secondary segment for intersections
//     }
// }

// // Helper: compute intersection point of two segments (if it exists)
// function getIntersection(seg1, seg2) {
//     // Using parametric form:
//     let p = seg1.start;
//     let r = { x: seg1.end.x - seg1.start.x, y: seg1.end.y - seg1.start.y };
//     let q = seg2.start;
//     let s = { x: seg2.end.x - seg2.start.x, y: seg2.end.y - seg2.start.y };

//     // Compute cross product of r and s
//     let rxs = r.x * s.y - r.y * s.x;
//     if (rxs === 0) return null; // Segments are parallel or collinear

//     let t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / rxs;
//     let u = ((q.x - p.x) * r.y - (q.y - p.y) * r.x) / rxs;

//     // t and u within [0,1] mean the segments intersect
//     if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
//         return { x: p.x + t * r.x, y: p.y + t * r.y };
//     }
//     return null;
// }

// // Main function: finds intersections among an array of Segment objects
// function findIntersections(segments) {
//     // Build event queue: add start and end events for each segment.
//     let events = [];
//     for (let seg of segments) {
//         events.push(new Event(seg.start.x, "start", seg));
//         events.push(new Event(seg.end.x, "end", seg));
//     }
//     // Sort events by x-coordinate. For equal x's, "start" events are processed first.
//     events.sort((a, b) => {
//         if (a.x !== b.x) return a.x - b.x;
//         if (a.type === b.type) return 0;
//         return a.type === "start" ? -1 : 1;
//     });

//     // Active list: segments currently intersecting the sweep line
//     let active = [];
//     let intersections = [];

//     // Helper function to check intersections between two segments
//     function checkNeighbors(segA, segB, currentX) {
//         let inter = getIntersection(segA, segB);
//         if (inter && inter.x > currentX) {
//             // Schedule an intersection event if found later than current x
//             // (We check for duplicates when processing events.)
//             events.push(new Event(inter.x, "intersection", segA, segB));
//             events.sort((a, b) => a.x - b.x);
//         }
//     }

//     // Process events in order
//     while (events.length > 0) {
//         let event = events.shift();
//         let x = event.x;
//         if (event.type === "start") {
//             // Insert segment in active list; sort by y value at current x
//             active.push(event.seg1);
//             active.sort((a, b) => a.getY(x) - b.getY(x));
//             let idx = active.indexOf(event.seg1);
//             // Check with previous neighbor
//             if (idx > 0) {
//                 checkNeighbors(active[idx - 1], active[idx], x);
//             }
//             // Check with next neighbor
//             if (idx < active.length - 1) {
//                 checkNeighbors(active[idx], active[idx + 1], x);
//             }
//         } else if (event.type === "end") {
//             // Find and remove the segment from active list
//             let idx = active.indexOf(event.seg1);
//             if (idx !== -1) {
//                 // Before removal, check if the two neighbors now intersect
//                 if (idx > 0 && idx < active.length - 1) {
//                     checkNeighbors(active[idx - 1], active[idx + 1], x);
//                 }
//                 active.splice(idx, 1);
//             }
//         } else if (event.type === "intersection") {
//             // Record the intersection
//             intersections.push({
//                 x: event.x,
//                 segments: [event.seg1, event.seg2],
//             });
//             // Swap the order of seg1 and seg2 in the active list
//             let i = active.indexOf(event.seg1);
//             let j = active.indexOf(event.seg2);
//             if (i > -1 && j > -1) {
//                 [active[i], active[j]] = [active[j], active[i]];
//             }
//             // After swapping, check new neighbors for both segments
//             let index = Math.min(i, j);
//             if (index > 0) {
//                 checkNeighbors(active[index - 1], active[index], x);
//             }
//             if (index < active.length - 1) {
//                 checkNeighbors(active[index], active[index + 1], x);
//             }
//         }
//     }
//     return intersections;
// }

var vertices = [];
var selectedVertices = [];
var highlightedVertices = new Set();

var edges = [];

var canvas = document.createElement('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
context = canvas.getContext('2d');

function PlaneToWindow(x, y) {
    return {
        x: x * canvas.width / config.gamePlaneWidth,
        y: y * canvas.height / config.gamePlaneHeight
    }
}

function WindowToPlane(x, y) {
    return {
        x: x / canvas.width * config.gamePlaneWidth,
        y: y / canvas.height * config.gamePlaneHeight
    }
}


document.querySelector('body').appendChild(canvas);

window.onresize = function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}


function isHitboxHit(x, y, vertex) {
    // Так как у нас есть отображение одного базиса на другой,
    // а хитбокс обрабатывается в игровом поле,
    // при сжатии окна хитбокс будет сжиматься,
    // а нарисованный радиус вершины -- нет,
    // поэтому мы тут отжимаем хитбокс обратно
    hitbox = WindowToPlane(vertex.hitboxRadius, vertex.hitboxRadius);
    return (vertex.x - hitbox.x <= x && x <= vertex.x + hitbox.x)
            && (vertex.y - hitbox.y <= y && y <= vertex.y + hitbox.y)
}

function freeVertices() {
    selectedVertices = [];

    highlightedVertices.forEach(vertex => {
        vertex.isHighlighted = false;
    });
    highlightedVertices = new Set();
}


var prevMouseP = null;

canvas.addEventListener('mousedown', (e) => {
    const mouseP = WindowToPlane(e.clientX, e.clientY);
    console.log(mouseP);

    const touchedVertex = vertices.filter(v => isHitboxHit(mouseP.x, mouseP.y, v))[0];
    if (touchedVertex) {
        selectedVertices.push(touchedVertex);
    }

    // highlight selected vertices and their neighbors
    selectedVertices.forEach(vertex => {
        if (highlightedVertices.has(vertex)) {
            return;
        }
        vertex.isHighlighted = true;
        highlightedVertices.add(vertex);
        vertex.neighbors.forEach(neighborVertex => {
            if (highlightedVertices.has(neighborVertex)) {
                return;
            }
            neighborVertex.isHighlighted = true;
            highlightedVertices.add(neighborVertex);
    });
    });

    prevMouseP = mouseP;
});

canvas.addEventListener('mousemove', (e) => {
    if (!prevMouseP) {
        return;
    }
    const mouseP = WindowToPlane(e.clientX, e.clientY);
    deltaMouseP = {
        x: mouseP.x - prevMouseP.x,
        y: mouseP.y - prevMouseP.y,
    }
    selectedVertices.forEach(vertex => {
        if (vertex) {
            vertex.x += deltaMouseP.x;
            vertex.y += deltaMouseP.y;
        }
    });
    prevMouseP = mouseP;
});

canvas.addEventListener('mouseup', () => {
    freeVertices();
});
canvas.addEventListener('mouseleave', () => {
    freeVertices();
});



function drawBackground() {
    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVertices() {
    vertices.forEach(vertex => {
        let point = PlaneToWindow(vertex.x, vertex.y);

        context.beginPath();
        context.arc(point.x, point.y, config.vertexRadius, 0, Math.PI*2);
        if (vertex.isHighlighted) {
            context.fillStyle = config.highlightedVertexColor;
        } else {
            context.fillStyle = config.basicVertexColor;
        }
        context.fill();
        context.lineWidth = config.vertexRadius * 0.1;
        context.stroke();
        context.closePath();
    });
}

function drawEdges() {
    let visitedVertices = new Set();
    vertices.forEach(vertex => {
        vertex.neighbors.forEach(neighborVertex => {
            if (visitedVertices.has(neighborVertex)) {
                return;
            }

            // const needToHighlight = vertex.isHighlighted && neighborVertex.isHighlighted;

            let point = PlaneToWindow(vertex.x, vertex.y);
            let neighborPoint = PlaneToWindow(neighborVertex.x, neighborVertex.y);

            // context.lineWidth = config.edgeWidth;
            // if (needToHighlight) {
            //     context.strokeStyle = config.highlightedEdgeColor;
            // } else {
                context.strokeStyle = config.basicEdgeColor;
            // }

            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(neighborPoint.x, neighborPoint.y);
            context.stroke();
            context.closePath();
        });
        visitedVertices.add(vertex);
    });
}



function loop() {
    drawBackground();

    drawEdges();
    drawVertices();

    requestAnimationFrame(loop);
}

var v1 = new Vertex(250, 250, config.vertexRadius);
var v2 = new Vertex(750, 250, config.vertexRadius);
var v3 = new Vertex(250, 750, config.vertexRadius);
var v4 = new Vertex(750, 750, config.vertexRadius);
v1.neighbors = [v2, v3];
v2.neighbors = [v1, v3, v4];
v3.neighbors = [v1, v2, v4];
v4.neighbors = [v2, v3];
vertices = [v1, v2, v3, v4];

function init() {
    // let v1 = new Vertex(250, 250, config.vertexRadius);
    // let v2 = new Vertex(750, 250, config.vertexRadius);
    // let v3 = new Vertex(250, 750, config.vertexRadius);
    // let v4 = new Vertex(750, 750, config.vertexRadius);
    // v1.neighbors = [v2, v3];
    // v2.neighbors = [v1, v3, v4];
    // v3.neighbors = [v1, v2, v4];
    // v4.neighbors = [v2, v3];
    // vertices = [v1, v2, v3, v4];

    loop();
}

init();


// let segments = [
// new Segment(v1.x, v1.y, v2.x, v2.y),
// new Segment(v1.x, v1.y, v3.x, v3.y),
// new Segment(v2.x, v2.y, v3.x, v3.y),
// new Segment(v2.x, v2.y, v4.x, v4.y),
// new Segment(v3.x, v3.y, v4.x, v4.y)
// ];
segments = [
	[[v1.x, v1.y], [v2.x, v2.y]],
	[[v1.x, v1.y], [v3.x, v3.y]],
	[[v2.x, v2.y], [v3.x, v3.y]],
	[[v2.x, v2.y], [v4.x, v4.y]],
	[[v3.x, v3.y], [v4.x, v4.y]]
];

console.log(JSON.stringify(findIntersections(segments)));