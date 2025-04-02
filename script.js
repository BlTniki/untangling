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

    isHitboxHit(x, y) {
        return (this.x - this.hitboxRadius <= x && x <= this.x + this.hitboxRadius)
            && (this.y - this.hitboxRadius <= y && y <= this.y + this.hitboxRadius)
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


// function freeVertices() {
//     selectedVertices = [];
//     highlightedVertices = [];
// }

// canvas.addEventListener('mousedown', (e) => {
//     const mouseP = WindowToPlane(e.clientX, e.clientY);

//     touchedVertex = vertices.filter(v => v.isHitboxHit(mouseP.x, mouseP.y))[0];
//     selectedVertices.push(touchedVertex);
// });

// canvas.addEventListener('mousemove', (e) => {
//     selectedVertices.forEach(vertex => {
//         const mouseP = WindowToPlane(e.clientX, e.clientY);
//         if (vertex) {
//             vertex.x = mouseP.x;
//             vertex.y = mouseP.y;
//         }
//     });
// });

// canvas.addEventListener('mouseup', () => {
//     freeVertices();
// });
// canvas.addEventListener('mouseleave', () => {
//     freeVertices();
// });


function drawBackground() {
    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVertices() {
    vertices.forEach(vertex => {
        let point = PlaneToWindow(vertex.x, vertex.y);

        context.beginPath();
        context.arc(point.x, point.y, config.vertexRadius, 0, Math.PI*2);
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(point.x, point.y, config.vertexRadius * 0.9, 0, Math.PI*2);
        context.fillStyle = config.basicVertexColor;
        context.fill();
        context.closePath();
    });
}

function drawEdges() {
    let visitedVertices = new Set();
    vertices.forEach(vertex => {
        vertex.neighbors.forEach(neighborVertex => {
            if (neighborVertex in visitedVertices) {
                return;
            }

            let point = PlaneToWindow(vertex.x, vertex.y);
            let neighborPoint = PlaneToWindow(vertex.x, vertex.y);

            context.lineWidth = config.edgeWidth;
            // context.strokeStyle = 'rgba(64, 30, 91, '+ opacity +')';

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
    // for (var i = 0; i < config.verticesCount; i++) {
    //     x = i / (config.verticesCount - 1) * (config.gamePlaneWidth - config.vertexRadius * 2) + config.vertexRadius;
    //     y = i / (config.verticesCount - 1) * (config.gamePlaneHeight - config.vertexRadius * 2) + config.vertexRadius;

    //     vertices.push(new Vertex(x, y));
    // }
    let v1 = new Vertex(250, 250, config.vertexRadius);
    let v2 = new Vertex(750, 250, config.vertexRadius);
    let v3 = new Vertex(250, 750, config.vertexRadius);
    let v4 = new Vertex(750, 750, config.vertexRadius);
    v1.neighbors = [v2, v3, v4];
    v2.neighbors = [v1, v3, v4];
    v3.neighbors = [v1, v2, v4];
    v4.neighbors = [v1, v2, v3];
    vertices = [v1, v2, v3, v4];

    loop();
}

init();