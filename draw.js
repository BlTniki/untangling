class Scene {
    constructor (canvas, sceneConfig) {
        this.canvas = canvas;
        this.canvasBoundary = canvas.getBoundingClientRect();
        canvas.width = this.canvasBoundary.width;
        canvas.height = this.canvasBoundary.height;
        this.context = canvas.getContext('2d');

        this.sceneConfig = sceneConfig;
    }

    PlaneToCanvas(x, y) {
        return {
            x: x * this.canvas.width / this.sceneConfig.gamePlaneWidth,
            y: y * this.canvas.height / this.sceneConfig.gamePlaneHeight
        }
    }

    CanvasToPlane(x, y) {
        return {
            x: x / this.canvas.width * this.sceneConfig.gamePlaneWidth,
            y: y / this.canvas.height * this.sceneConfig.gamePlaneHeight
        }
    }

    WindowToCanvas(x, y) {
        return {
            x: x - this.canvasBoundary.x,
            y: y - this.canvasBoundary.y
        }
    }

    drawBackground() {
        this.context.fillStyle = this.sceneConfig.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawVertices(vertices) {
        vertices.forEach(vertex => {
            let point = this.PlaneToCanvas(vertex.x, vertex.y, this.canvas);

            this.context.beginPath();
            this.context.arc(point.x, point.y, this.sceneConfig.vertexRadius, 0, Math.PI*2);
            if (vertex.isHighlighted) {
                this.context.fillStyle = this.sceneConfig.highlightedVertexColor;
            } else {
                this.context.fillStyle = this.sceneConfig.basicVertexColor;
            }
            this.context.fill();
            this.context.lineWidth = this.sceneConfig.vertexRadius * 0.1;
            this.context.stroke();
            this.context.closePath();
        });
    }

    drawEdges(edges) {
        edges.forEach(edge => {
            let planeSegment = edge.toSegment();
            let windowSegmentStart = this.PlaneToCanvas(planeSegment[0][0], planeSegment[0][1], this.canvas);
            let windowSegmentEnd = this.PlaneToCanvas(planeSegment[1][0], planeSegment[1][1], this.canvas);

            this.context.beginPath();
            this.context.moveTo(windowSegmentStart.x, windowSegmentStart.y);
            this.context.lineTo(windowSegmentEnd.x, windowSegmentEnd.y);
            const prevStrokeStyle = this.context.strokeStyle;
            const prevStrokeWidth = this.context.lineWidth;
            if (edge.isIntersect) {
                this.context.strokeStyle = this.sceneConfig.basicEdgeColor;
            } else {
                this.context.strokeStyle = this.sceneConfig.highlightedEdgeColor;
            }
            this.context.lineWidth = this.sceneConfig.edgeWidth;
            this.context.stroke();
            this.context.strokeStyle = prevStrokeStyle;
            this.context.lineWidth = prevStrokeWidth;
            this.context.closePath();
        });
    }
}