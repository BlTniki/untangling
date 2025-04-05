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

if (!EPS) {
    var EPS = 1E-9;
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

class Edge {
    /** 
    * @param {Vertex} v1 segment start vertex
    * @param {Vertex} v2 segment end vertex
    */
    constructor(v1, v2) {
        // смещение начала сегмента и конца на радиус хитбокса вершины
        // чтобы при поиске пересечений сегментов 
        this.v1 = v1;
        this.v2 = v2;
        this.isIntersect = false;
        this.ID = `x${v1.x}y${v1.y}x${v2.x}y${v2.y}`;
    }

    toSegment() {
        // смещение начала сегмента и конца на радиус хитбокса вершины
        // чтобы при поиске пересечений сегментов пересечения на концах сегментов не учитывалось
        let r = [this.v2.x - this.v1.x, this.v2.y - this.v1.y]; // вектор перехода из v1 в v2
        let d = 10 / Math.sqrt(r[0]*r[0] + r[1]*r[1]); // необходимая длина вектора смещения
        let dr = [d*r[0], d*r[1]]; // необходимый вектор смещения
        return [
            [this.v1.x + dr[0], this.v1.y + dr[1]],
            [this.v2.x - dr[0], this.v2.y - dr[1]]
        ]
    }
}

var vertices = [];
var selectedVertices = [];
var highlightedVertices = new Set();

var edges = [];
var edgesMap = {};
var intersectEdgeIDs = new Set();

function checkIntersections() {
    segments = {}
    edges.forEach(edge => {
        segments[edge.ID] = edge.toSegment();
    });
    let newIntersectEdgeIDs = new Set(
        findIntersections(segments)
            .flatMap(intersect => intersect.segmentID)
    );
    let toIntersect = newIntersectEdgeIDs.difference(intersectEdgeIDs);
    let toClear = intersectEdgeIDs.difference(newIntersectEdgeIDs);
    toIntersect.forEach(edgeID => edgesMap[edgeID].isIntersect = true);
    toClear.forEach(edgeID => edgesMap[edgeID].isIntersect = false);
    intersectEdgeIDs = newIntersectEdgeIDs;
}

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
    edges.forEach(edge => {
        let planeSegment = edge.toSegment();
        let windowSegmentStart = PlaneToWindow(planeSegment[0][0], planeSegment[0][1]);
        let windowSegmentEnd = PlaneToWindow(planeSegment[1][0], planeSegment[1][1]);

        if (edge.isIntersect) {
            context.strokeStyle = config.basicEdgeColor;
        } else {
            context.strokeStyle = config.highlightedEdgeColor;
        }

        context.beginPath();
        context.moveTo(windowSegmentStart.x, windowSegmentStart.y);
        context.lineTo(windowSegmentEnd.x, windowSegmentEnd.y);
        context.stroke();
        context.closePath();
    });
}



function loop() {
    checkIntersections();

    drawBackground();

    drawEdges();
    drawVertices();

    requestAnimationFrame(loop);
}



function init() {
    var v1 = new Vertex(250, 250, config.vertexRadius);
    var v2 = new Vertex(750, 250, config.vertexRadius);
    var v3 = new Vertex(250, 750, config.vertexRadius);
    var v4 = new Vertex(750, 750, config.vertexRadius);
    v1.neighbors = [v2, v3];
    v2.neighbors = [v1, v3, v4];
    v3.neighbors = [v1, v2, v4];
    v4.neighbors = [v2, v3];
    vertices = [v1, v2, v3, v4];

    edges = [
        new Edge(v1, v2),
        new Edge(v1, v3),
        new Edge(v2, v3),
        new Edge(v2, v4),
        new Edge(v3, v4)
    ];
    edges.forEach(edge => {
        edgesMap[edge.ID] = edge;
    });

    loop();
}

init();