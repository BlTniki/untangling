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

function buildGameLoop(gameState, scene) {
    /**
     * Просто удобный конструктор loop функции,
     * чтобы меньше колдовать с передачей параметров в requestAnimationFrame ()
     */
    function loop() {
        let intersectCount = gameState.checkIntersections();

        scene.drawBackground();

        scene.drawEdges(gameState.edges);
        scene.drawVertices(gameState.vertices);

        gameState.gameTimer.updateState(intersectCount);
        requestAnimationFrame(loop);
    }

    return loop;
}

function init() {
    const canvas = document.querySelector('canvas');
    window.onresize = function() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }

    const scene = new Scene(canvas, config);


    const gameState = initDelaunatorPlanarGraph(config);
    gameState.gameTimer.outputState = (output => document.getElementById("textOutput").textContent = output);
    canvas.addEventListener('mousedown', (e) => {
        const mouseC = scene.WindowToCanvas(e.clientX, e.clientY, canvas);
        const mouseP = scene.CanvasToPlane(mouseC.x, mouseC.y, canvas);
        gameState.selectVertices(mouseP);
    });
    canvas.addEventListener('mousemove', (e) => {
        const mouseC = scene.WindowToCanvas(e.clientX, e.clientY, canvas);
        const mouseP = scene.CanvasToPlane(mouseC.x, mouseC.y, canvas);
        gameState.moveSelectedVertices(mouseP)
    });
    canvas.addEventListener('mouseup', () => {
        gameState.freeVertices();
    });
    canvas.addEventListener('mouseleave', () => {
        gameState.freeVertices();
    });


    const loop = buildGameLoop(gameState, scene);

    gameState.gameTimer.start(); 
    loop();
}

document.addEventListener("DOMContentLoaded", () => {
    const verticesInput = document.getElementById("verticesInput");
    const startButton = document.getElementById("startButton");


    startButton.addEventListener("click", () => {
        config.verticesCount = Number(verticesInput.value);
        init();
    });
});
