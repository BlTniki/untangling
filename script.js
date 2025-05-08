config = {
    verticesCount: 20,
    vertexRadius: 10,
    basicVertexColor: 'rgb(0, 80, 177)',
    highlightedVertexColor: 'rgb(177, 0, 0)',
    edgeWidth: 2,
    basicEdgeColor: 'rgb(0,0,0)',
    highlightedEdgeColor: 'rgb(223, 216, 0)',
    backgroundColor: 'rgb(255, 255, 255)'
}

if (!EPS) {
    const EPS = 1E-9;
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
    console.debug("Init game scene");
    const canvas = document.querySelector('canvas');
    window.onresize = function() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }

    const scene = new Scene(canvas, config);
    console.debug("Game scene initiated");


    console.debug("Init game");
    const gameState = initDelaunatorPlanarGraph(config);
    gameState.gameTimer.outputState = (output => document.getElementById("textOutput").textContent = output);
    const logInput = (eventType, e, mouseC, mouseP) => {
        console.debug(
            `Input "${eventType}": at window {x:${e.clientX}, y:${e.clientY}}, at canvas {x:${mouseC.x}, y:${mouseC.y}}, at plane {x:${mouseP.x}, y:${mouseP.y}}`
        );
    };
    canvas.addEventListener('mousedown', (e) => {
        const mouseC = scene.WindowToCanvas(e.clientX, e.clientY);
        const mouseP = scene.CanvasToPlane(mouseC.x, mouseC.y);
        const hitZone = scene.HitRadiusOnPlane();

        logInput('mousedown', e, mouseC, mouseP);
        gameState.selectVertices(mouseP, hitZone);
    });
    canvas.addEventListener('mousemove', (e) => {
        const mouseC = scene.WindowToCanvas(e.clientX, e.clientY);
        const mouseP = scene.CanvasToPlane(mouseC.x, mouseC.y);

        logInput('mousemove', e, mouseC, mouseP);
        gameState.moveSelectedVertices(mouseP)
    });
    canvas.addEventListener('mouseup', () => {
        gameState.freeVertices();
    });
    canvas.addEventListener('mouseleave', () => {
        gameState.freeVertices();
    });
    console.debug("Game initiated");


    const loop = buildGameLoop(gameState, scene);

    console.debug("Starting the game...");
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
