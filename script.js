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

var vertices = [];
var selectedVertices = [];
var highlightedVertices = [];

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
    highlightedVertices = [];
}

function colorSelectedNeighbors() {}

var prevMouseP = null;

canvas.addEventListener('mousedown', (e) => {
    const mouseP = WindowToPlane(e.clientX, e.clientY);

    touchedVertex = vertices.filter(v => isHitboxHit(mouseP.x, mouseP.y, v))[0];
    selectedVertices.push(touchedVertex);

    prevMouseP = mouseP;
    console.log(prevMouseP);
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
        context.fillStyle = config.basicVertexColor;
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

            let point = PlaneToWindow(vertex.x, vertex.y);
            let neighborPoint = PlaneToWindow(neighborVertex.x, neighborVertex.y);

            context.lineWidth = config.edgeWidth;
            context.strokeStyle = config.basicEdgeColor;

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

function init() {
    let v1 = new Vertex(250, 250, config.vertexRadius);
    let v2 = new Vertex(750, 250, config.vertexRadius);
    let v3 = new Vertex(250, 750, config.vertexRadius);
    let v4 = new Vertex(750, 750, config.vertexRadius);
    v1.neighbors = [v2, v3];
    v2.neighbors = [v1, v3, v4];
    v3.neighbors = [v1, v2, v4];
    v4.neighbors = [v2, v3];
    vertices = [v1, v2, v3, v4];

    loop();
}

init();