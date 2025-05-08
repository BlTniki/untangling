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
        let d = 1 / Math.sqrt(r[0]*r[0] + r[1]*r[1]); // необходимая длина вектора смещения
        let dr = [d*r[0], d*r[1]]; // необходимый вектор смещения
        return [
            [this.v1.x + dr[0], this.v1.y + dr[1]],
            [this.v2.x - dr[0], this.v2.y - dr[1]]
        ]
    }
}

class GameTimer {
    constructor() {
        this.isNoIntersectionAchieved = true;
        this.outputState = (output => {
            console.log(output)
        });
        this.finalOutput = null;
    }

    measureTime() {
        const currentTime = performance.now();
        const elapsedTime = (currentTime - this.startTime) / 1000; // в секундах
        const roundedTime = Math.round(elapsedTime * 10) / 10; // округляем до 0.1
        return roundedTime;
    }

    start() {
        this.startTime = performance.now();
        this.isNoIntersectionAchieved = true;
        this.finalOutput = null;
    }
    updateState(countOfIntersections) {
        if (this.isNoIntersectionAchieved) {
            const output = `${countOfIntersections} intersections in ${this.measureTime()} s`;
            this.outputState(output);
            if (countOfIntersections === 0) {
                this.isNoIntersectionAchieved = false;
                this.finalOutput = output;
            }
        } else {
            this.outputState(this.finalOutput);
        }

    }
}

class GameState {
    constructor(vertices, edges) {
        this.vertices = vertices;
        this.selectedVertices = [];
        this.highlightedVertices = new Set();

        this.gameTimer = new GameTimer();

        this.edges = edges;

        this.edgesMap = {};
        edges.forEach(edge => {
            this.edgesMap[edge.ID] = edge;
        });

        this.intersectEdgeIDs = new Set();
        this.checkIntersections();


        this.prevMouseP = null;

    }

    checkIntersections() {
        /**
         * Находит все пересечения, обновляет список пересечений и возвращает кол-во пересечений
         */
        var segments = {}
        this.edges.forEach(edge => {
            segments[edge.ID] = edge.toSegment();
        });
        let newIntersectEdgeIDs = new Set(
            findIntersections(segments)
                .flatMap(intersect => intersect.segmentID)
        );
        let toIntersect = newIntersectEdgeIDs.difference(this.intersectEdgeIDs);
        let toClear = this.intersectEdgeIDs.difference(newIntersectEdgeIDs);
        toIntersect.forEach(edgeID => this.edgesMap[edgeID].isIntersect = true);
        toClear.forEach(edgeID => this.edgesMap[edgeID].isIntersect = false);
        this.intersectEdgeIDs = newIntersectEdgeIDs;

        return this.intersectEdgeIDs.size;
    }


    freeVertices() {
        this.selectedVertices = [];

        this.highlightedVertices.forEach(vertex => {
            vertex.isHighlighted = false;
        });
        this.highlightedVertices = new Set();
    }


    selectVertices(mouseP) {
        const touchedVertex =this. vertices.filter(v => isHitboxHit(mouseP.x, mouseP.y, v))[0];
        if (touchedVertex) {
            this.selectedVertices.push(touchedVertex);
        }

        // highlight selected vertices and their neighbors
        this.selectedVertices.forEach(vertex => {
            if (this.highlightedVertices.has(vertex)) {
                return;
            }
            vertex.isHighlighted = true;
            this.highlightedVertices.add(vertex);
            vertex.neighbors.forEach(neighborVertex => {
                if (this.highlightedVertices.has(neighborVertex)) {
                    return;
                }
                neighborVertex.isHighlighted = true;
                this.highlightedVertices.add(neighborVertex);
        });
        });

        this.prevMouseP = mouseP;
    }

    moveSelectedVertices(mouseP) {
        if (!this.prevMouseP) {
            return;
        }
        const deltaMouseP = {
            x: mouseP.x - this.prevMouseP.x,
            y: mouseP.y - this.prevMouseP.y,
        }
        this.selectedVertices.forEach(vertex => {
            if (vertex) {
                vertex.x += deltaMouseP.x;
                vertex.y += deltaMouseP.y;
            }
        });
        this.prevMouseP = mouseP;
    }
}

/**
 * 
 * @param {Edge} e1 
 * @param {Edge} e2 
 * @returns boolean
 */
function edgesIntersect(e1, e2) {
    const det = (a, b, c, d) => a * d - b * c;

    const x1 = e1.v1.x;
    const y1 = e1.v1.y;
    const x2 = e1.v2.x;
    const y2 = e1.v2.y;
    const x3 = e2.v1.x;
    const y3 = e2.v1.y;
    const x4 = e2.v2.x;
    const y4 = e2.v2.y;

    const denom = det(x1 - x2, y1 - y2, x3 - x4, y3 - y4);
    if (denom === 0) return false;

    const t = det(x1 - x3, y1 - y3, x3 - x4, y3 - y4) / denom;
    const u = det(x1 - x3, y1 - y3, x1 - x2, y1 - y2) / denom;

    return t > 0 && t < 1 && u > 0 && u < 1;
}

function isHitboxHit(x, y, vertex) {
    // Так как у нас есть отображение одного базиса на другой,
    // а хитбокс обрабатывается в игровом поле,
    // при сжатии окна хитбокс будет сжиматься,
    // а нарисованный радиус вершины -- нет,
    // поэтому мы тут отжимаем хитбокс обратно
    hitbox = {"x": vertex.hitboxRadius, "y":vertex.hitboxRadius};// Будем пытаться избавиться от этого маппинга CanvasToPlane(vertex.hitboxRadius, vertex.hitboxRadius);
    return (vertex.x - hitbox.x <= x && x <= vertex.x + hitbox.x)
            && (vertex.y - hitbox.y <= y && y <= vertex.y + hitbox.y)
}

function initDelaunatorPlanarGraph(gameConfig) {


    function generateDelaunatorPlanarGraph(vertexCount, width, height, hitboxRadius = 5) {
        // Generate random vertices
        const vertices = [];
        const points = [];

        for (let i = 0; i < vertexCount; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;
            const vertex = new Vertex(x, y, hitboxRadius);
            vertices.push(vertex);
            points.push([x, y]);
        }

        // Perform Delaunay triangulation
        const delaunay = Delaunator.from(points);
        const edgesSet = new Set();
        const edges = [];

        // Helper to create unique edge key
        function edgeKey(i, j) {
            return i < j ? `${i}-${j}` : `${j}-${i}`;
        }

        // Extract edges from triangles
        for (let i = 0; i < delaunay.triangles.length; i += 3) {
            const tri = [
                delaunay.triangles[i],
                delaunay.triangles[i + 1],
                delaunay.triangles[i + 2]
            ];

            for (let j = 0; j < 3; j++) {
                const a = tri[j];
                const b = tri[(j + 1) % 3];
                const key = edgeKey(a, b);
                if (!edgesSet.has(key)) {
                    edgesSet.add(key);
                    const edge = new Edge(vertices[a], vertices[b]);
                    edges.push(edge);

                    // Add neighbors
                    if (!vertices[a].neighbors.includes(vertices[b])) {
                        vertices[a].neighbors.push(vertices[b]);
                    }
                    if (!vertices[b].neighbors.includes(vertices[a])) {
                        vertices[b].neighbors.push(vertices[a]);
                    }
                }
            }
        }

        return {
            "vertices": vertices,
            "edges": edges
        };
    }

    /**
     * Мешает вершины случайным образом по игровому полю
     * @param {Vertex[]} vertices - массив вершин графа
     * @param {number} width - ширина игрового поля
     * @param {number} height - высота игрового поля
     * @param {number} margin - отступ от краёв (обычно равен радиусу вершины)
     */
    function scatterVerticesRandomly(vertices, width, height, margin) {
        for (let v of vertices) {
            v.x = Math.random() * (width - 2 * margin) + margin;
            v.y = Math.random() * (height - 2 * margin) + margin;
        }
    }



    var output = generateDelaunatorPlanarGraph(
        gameConfig.verticesCount,
        gameConfig.gamePlaneWidth,
        gameConfig.gamePlaneHeight,
        gameConfig.vertexRadius
    );
    var gameState =  new GameState(output.vertices, output.edges);
    scatterVerticesRandomly(gameState.vertices,
        gameConfig.gamePlaneWidth,
        gameConfig.gamePlaneHeight,
        gameConfig.vertexRadius
    );

    return gameState;
}


function initManualGraph(gameConfig) {
    var v1 = new Vertex(250, 250, gameConfig.vertexRadius);
    var v2 = new Vertex(750, 250, gameConfig.vertexRadius);
    var v3 = new Vertex(250, 750, gameConfig.vertexRadius);
    var v4 = new Vertex(750, 750, gameConfig.vertexRadius);
    v1.neighbors = [v2, v3, v4];
    v2.neighbors = [v1, v3, v4];
    v3.neighbors = [v1, v2, v4];
    v4.neighbors = [v1, v2, v3];
    var vertices = [v1, v2, v3, v4];

    var edges = [
        new Edge(v1, v2),
        new Edge(v1, v3),
        new Edge(v1, v4),
        new Edge(v2, v3),
        new Edge(v2, v4),
        new Edge(v3, v4)
    ];

    return new GameState(vertices, edges)
}

function initPlanarGraph(gameConfig) {
    return initDelaunatorPlanarGraph(gameConfig);
}