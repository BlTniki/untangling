config = {
    gamePlaneWidth: 1000,
    gamePlaneHeight: 1000,
    verticesCount: 20,
    vertexRadius: 12,
    basicVertexColor: 'rgb(0, 80, 177)',
    highlightedVertexColor: 'rgb(177, 0, 0)',
    edgeWidth: 3,
    basicEdgeColor: 'rgb(0,0,0)',
    highlightedEdgeColor: 'rgb(223, 216, 0)',
    backgroundColor: 'rgb(255, 255, 255)'
}

if (!EPS) {
    var EPS = 1E-9;
}


var canvas = document.querySelector('canvas');
var canvasBoundary = canvas.getBoundingClientRect();
canvas.width = canvasBoundary.width;
canvas.height = canvasBoundary.height;
context = canvas.getContext('2d');

function PlaneToCanvas(x, y) {
    return {
        x: x * canvas.width / config.gamePlaneWidth,
        y: y * canvas.height / config.gamePlaneHeight
    }
}

function CanvasToPlane(x, y) {
    return {
        x: x / canvas.width * config.gamePlaneWidth,
        y: y / canvas.height * config.gamePlaneHeight
    }
}

function WindowToCanvas(x, y) {
    const boundary = canvas.getBoundingClientRect();
    return {
        x: x - boundary.x,
        y: y - boundary.y
    }
}

window.onresize = function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}





function drawBackground() {
    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVertices(vertices) {
    vertices.forEach(vertex => {
        let point = PlaneToCanvas(vertex.x, vertex.y);

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

function drawEdges(edges) {
    edges.forEach(edge => {
        let planeSegment = edge.toSegment();
        let windowSegmentStart = PlaneToCanvas(planeSegment[0][0], planeSegment[0][1]);
        let windowSegmentEnd = PlaneToCanvas(planeSegment[1][0], planeSegment[1][1]);

        context.beginPath();
        context.moveTo(windowSegmentStart.x, windowSegmentStart.y);
        context.lineTo(windowSegmentEnd.x, windowSegmentEnd.y);
        const prevStrokeStyle = context.strokeStyle;
        const prevStrokeWidth = context.lineWidth;
        if (edge.isIntersect) {
            context.strokeStyle = config.basicEdgeColor;
        } else {
            context.strokeStyle = config.highlightedEdgeColor;
        }
        context.lineWidth = config.edgeWidth;
        context.stroke();
        context.strokeStyle = prevStrokeStyle;
        context.lineWidth = prevStrokeWidth;
        context.closePath();
    });
}



function loop(gameState) {
    let intersectCount = gameState.checkIntersections();

    drawBackground();

    drawEdges(gameState.edges);
    drawVertices(gameState.vertices);

    gameState.gameTimer.updateState(intersectCount);
    requestAnimationFrame(() => loop(gameState));
}


function init() {
    var gameState = initDelaunatorPlanarGraph();
    gameState.gameTimer.outputState = (output => document.getElementById("textOutput").textContent = output);
    canvas.addEventListener('mousedown', (e) => {
        const mouseC = WindowToCanvas(e.clientX, e.clientY)
        const mouseP = CanvasToPlane(mouseC.x, mouseC.y);
        gameState.selectVertices(mouseP);
    });
    canvas.addEventListener('mousemove', (e) => {
        const mouseC = WindowToCanvas(e.clientX, e.clientY)
        const mouseP = CanvasToPlane(mouseC.x, mouseC.y);
        gameState.moveSelectedVertices(mouseP)
    });
    canvas.addEventListener('mouseup', () => {
        gameState.freeVertices();
    });
    canvas.addEventListener('mouseleave', () => {
        gameState.freeVertices();
    });

    gameState.gameTimer.start(); 

    loop(gameState);
}

document.addEventListener("DOMContentLoaded", () => {
    const verticesInput = document.getElementById("verticesInput");
    const startButton = document.getElementById("startButton");


    startButton.addEventListener("click", () => {
        config.verticesCount = Number(verticesInput.value);
        init();
    });
});
