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
    return intersectEdgeIDs.size
}

function isHitboxHit(x, y, vertex) {
    // Так как у нас есть отображение одного базиса на другой,
    // а хитбокс обрабатывается в игровом поле,
    // при сжатии окна хитбокс будет сжиматься,
    // а нарисованный радиус вершины -- нет,
    // поэтому мы тут отжимаем хитбокс обратно
    hitbox = CanvasToPlane(vertex.hitboxRadius, vertex.hitboxRadius);
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

function selectVertices(mouseP) {
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
}

function moveSelectedVertices(e) {
    if (!prevMouseP) {
        return;
    }
    const mouseC = WindowToCanvas(e.clientX, e.clientY)
    const mouseP = CanvasToPlane(mouseC.x, mouseC.y);
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
}



function initPlanarGraph() {
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

    function addEdge(edges, newEdge) {
        for (let edge of edges) {
            if (edgesIntersect(edge, newEdge)) return false;
        }
        edges.push(newEdge);
        return true;
    }

    function generatePlanarGraph(n = 10) {
        vertices = [];
        edges = [];
        edgesMap = {};
        intersectEdgeIDs = new Set();

        for (let i = 0; i < n; i++) {
            let x = Math.random() * (config.gamePlaneWidth - 2 * config.vertexRadius) + config.vertexRadius;
            let y = Math.random() * (config.gamePlaneHeight - 2 * config.vertexRadius) + config.vertexRadius;
            vertices.push(new Vertex(x, y, config.vertexRadius));
        }

        // Основной проход: случайные рёбра
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (Math.random() < 0.2) {
                    const edge = new Edge(vertices[i], vertices[j]);
                    if (addEdge(edges, edge)) {
                        vertices[i].neighbors.push(vertices[j]);
                        vertices[j].neighbors.push(vertices[i]);
                    }
                }
            }
        }

        // Гарантируем минимум 2 соседа
        let attemptsCounter = 0;
        for (let i = 0; i < n; i++) {
            while (vertices[i].neighbors.length < 2 && attemptsCounter++ < 1000) {
                // Пытаемся соединить с другой случайной вершиной
                const candidates = vertices
                    .filter((v, j) => i !== j && !vertices[i].neighbors.includes(v));

                if (candidates.length === 0) break;

                const randIndex = Math.floor(Math.random() * candidates.length);
                const vj = candidates[randIndex];
                const edge = new Edge(vertices[i], vj);

                if (addEdge(edges, edge)) {
                    vertices[i].neighbors.push(vj);
                    vj.neighbors.push(vertices[i]);
                }
            }
        }
        edges.forEach(edge => {
            edgesMap[edge.ID] = edge;
        });

        if (attemptsCounter >= 1000) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Перераскидывает вершины случайным образом по игровому полю
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

    // пытаемся сгенерировать граф столько раз, пока не выйдет
    while (!generatePlanarGraph(config.verticesCount)) {
        console.warn('Failed to generate planar graph. Retrying...');
    }
    scatterVerticesRandomly(vertices, config.gamePlaneWidth, config.gamePlaneHeight, config.vertexRadius)
}

function initManualGraph() {
    var v1 = new Vertex(250, 250, config.vertexRadius);
    var v2 = new Vertex(750, 250, config.vertexRadius);
    var v3 = new Vertex(250, 750, config.vertexRadius);
    var v4 = new Vertex(750, 750, config.vertexRadius);
    v1.neighbors = [v2, v3, v4];
    v2.neighbors = [v1, v3, v4];
    v3.neighbors = [v1, v2, v4];
    v4.neighbors = [v1, v2, v3];
    vertices = [v1, v2, v3, v4];

    edges = [
        new Edge(v1, v2),
        new Edge(v1, v3),
        new Edge(v1, v4),
        new Edge(v2, v3),
        new Edge(v2, v4),
        new Edge(v3, v4)
    ];
    edges.forEach(edge => {
        edgesMap[edge.ID] = edge;
    });
}