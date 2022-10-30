'use strict';

// Global variables that are set and used
// across the application
let gl,
    program,
    verticesSize,
    vertexBuffer,
    vertices,
    drawingTop,
    drawingLeft,
    canvas;

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
    const script = document.getElementById(id);
    const shaderString = script.text.trim();

    // Assign shader depending on the type of shader
    let shader;
    if (script.type === 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (script.type === 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else {
        return null;
    }

    // Compile the shader using the supplied shader code
    gl.shaderSource(shader, shaderString);
    gl.compileShader(shader);

    // Ensure the shader is valid
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// Create a program with the appropriate vertex and fragment shaders
function initProgram() {
    const vertexShader = getShader('vertex-shader');
    const fragmentShader = getShader('fragment-shader');

    // Create a program
    program = gl.createProgram();
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Could not initialize shaders');
    }

    // Use this program instance
    gl.useProgram(program);
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
}

// Set up the buffers
function initBuffers() {

    // Setting up the VBO
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// We call draw to render to our canvas
function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the buffers we've constructed
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aVertexPosition);

    // Draw to the scene using an array of points
    gl.drawArrays(gl.POINTS, 0, verticesSize);

    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Entry point to our application
function init() {

    // Retrieve the canvas
    canvas = utils.getCanvas('webgl-canvas');
    // Set the canvas to the size of the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.onmouseup = function (ev) { addMousePoint(ev, gl, canvas) };

    // array for buffering data
    vertices = new Float32Array(canvas.width * canvas.height * 3 * 3);
    verticesSize = 0;

    // figure out the top and left of our particular window
    drawingTop = 0;
    drawingLeft = 0;
    let tmpCanvas = canvas;
    while (tmpCanvas && tmpCanvas.tagName !== 'BODY') {
        drawingTop += tmpCanvas.offsetTop;
        drawingLeft += tmpCanvas.offsetLeft;
        tmpCanvas = tmpCanvas.offsetParent;
    }
    drawingLeft += window.pageXOffset;
    drawingTop -= window.pageYOffset;

    // Retrieve a WebGL context
    gl = utils.getGLContext(canvas);
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);


    // Call the functions in an appropriate order
    initProgram();
    setDataForPolygon();
    initBuffers();
    draw();
}

function drawPoint(x, y) {
    let arrayPos = verticesSize * 3;
    vertices[arrayPos] = x;
    vertices[arrayPos + 1] = y;
    vertices[arrayPos + 2] = 0;
    verticesSize += 1;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices, 0, arrayPos + 3);

    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    draw();
}

function getXPosition(x) {
    return ((x - drawingLeft) - canvas.width / 2) / (canvas.width / 2);
}

function getYPosition(y) {
    return (canvas.height / 2 - (y - drawingTop)) / (canvas.height / 2);
}

function fillPolygon(linesForPolygon) {

    // check to make sure there are at least 
    // 3 lines (18 pt) or else just return
    let isCorrectAmountOfLines = false

    let isCounterClockWise = true

    if (linesForPolygon.length >= 3) {
        isCorrectAmountOfLines = true
        if (linesForPolygon.length == 3) {
            isCounterClockWise = false
        }          
    }else{

    }

    if (isCorrectAmountOfLines) {
        //
        //  find the bounding box - minX, minY, maxX, maxY
        //
        const xYminsAndMax = findBoundingBox(linesForPolygon)
        const xMin = xYminsAndMax[0]
        const yMin = xYminsAndMax[3]
        const xMax = xYminsAndMax[2]
        const yMax = xYminsAndMax[1]

        // set up all of the arrays for keeping track of var's
        // there are a number of them


        // calculate the equation for inside/outside for all lines
        // and set all var's for the equation per line
        // E(x,y) = (x-X)dY - (y-Y)dX
        const edges = []
        for (let i = 0; i < linesForPolygon.length; i++) {
            let xStart = linesForPolygon[i][0]
            let xEnd = linesForPolygon[i][3]
            let yStart = linesForPolygon[i][1]
            let yEnd = linesForPolygon[i][4]
            let dy = yStart - yEnd
            var dx = xEnd - xStart
            let edge = [((xMin - xStart) * dy - (yStart - yMin) * dx), dx, dy]
            edges.push(edge)
        }

        // over the bounding box calculate fill (and add points)
        // use the formulas/rules:
        // E(x+1,y) = E(x,y) + dY
        // E(x,y+1) = E(x,y) - dX
        // make sure it's ok to go left to right OR right to left around the 
        // polygon to fill     

        //Counter-Clockwise - last edge will go from left to right
        if (isCounterClockWise) {
            for (let y = yMin; y > yMax; y--) {
                for (let x = xMax; x > xMin; x--) {
                    let offsetX = x - xMin
                    let offsetY = y - yMax
                    if (edgeFunction(edges, offsetX, offsetY, false)) {                                           
                        let xVal = getXPosition(x)
                        let yVal = getXPosition(y)
                        drawPoint(xVal, yVal)
                    }
                }
            }
        }
        //Clockwise - last edge will go from right to left
        else {
            for (let y = yMin; y > yMax; y--) {
                for (let x = xMin; x < xMax; x++) {
                    let offsetX = x - xMin
                    let offsetY = y - yMax
                    if (edgeFunction(edges, offsetX, offsetY, true)) {                        
                        let xVal = getXPosition(x)
                        let yVal = getXPosition(y)
                        drawPoint(xVal, yVal)
                    }
                }
            }
        }


    } else {
        console.error("Incorrect number of lines/edges or vertices")
        return
    }

}

function edgeFunction(edges, offsetX, offsetY, isClockwise) {

    if (isClockwise) {
        for (let i = 0; i < edges.length; i++) {
            if (edges[i][0] + (offsetX * edges[i][2] - offsetY * edges[i][1]) < 0) {
                return false
            }
        }
        return true
    } else {
        for (let i = 0; i < edges.length; i++) {
            if (edges[i][0] + (offsetX * edges[i][2] - offsetY * edges[i][1]) > 0) {
                return false
            }
        }
        return true
    }

}

function findBoundingBox(linesForPolygon) {
    let x0 = 0
    let y0 = 1

    let x1 = 3
    let y1 = 4

    let xMin = linesForPolygon[0][0]
    let yMin = linesForPolygon[0][1]
    let xMax = linesForPolygon[0][0]
    let yMax = linesForPolygon[0][1]

    for (let i = 0; i < linesForPolygon.length; i++) {
        let vertex0 = [linesForPolygon[i][x0], linesForPolygon[i][y0]]
        let vertex1 = [linesForPolygon[i][x1], linesForPolygon[i][y1]]
        //Vertex 0
        if (vertex0[0] < xMin) {
            xMin = vertex0[0]
        } else if (vertex0[0] > xMax) {
            xMax = vertex0[0]
        }

        if (vertex0[1] < yMin) {
            yMin = vertex0[1]
        } else if (vertex0[1] > yMax) {
            yMax = vertex0[1]
        }

        //Vertex 1
        if (vertex1[0] < xMin) {
            xMin = vertex1[0]
        } else if (vertex1[0] > xMax) {
            xMax = vertex1[0]
        }

        if (vertex1[1] < yMin) {
            yMin = vertex1[1]
        } else if (vertex1[1] > yMax) {
            yMax = vertex1[1]
        }
    }
    console.log("XMin:" + xMin + " YMin:" + yMin + "\nXMax:" + xMax + " Ymax:" + yMax)
    return [xMin, yMin, xMax, yMax]
}

function setDataForPolygon() {


    // create polygon such as the following in integer coords
    // note that this particular example has mouse coords
    /*Format: Every row contains 2 points(3D space)
    */

    //Triangle
    let linesForPolygon0 = [
        [162, 400, 0, 322, 252, 0],
        [322, 252, 0, 436, 431, 0],
        [436, 431, 0, 162, 400, 0]
    ];

    //Diamond
    let linesForPolygon3 = [
        [575, 300, 0, 675, 150, 0],
        [675, 150, 0, 575, 1, 0],
        [575, 1, 0, 475, 150, 0],
        [475, 150, 0, 575, 300, 0]
    ];

    //Pentagon
    let linesForPolygon1 = [
        [550, 900, 0, 600, 700, 0],
        [600, 700, 0, 450, 500, 0],
        [450, 500, 0, 300, 700, 0],
        [300, 700, 0, 350, 900, 0],
        [350, 900, 0, 550, 900, 0]
    ];

    //Square
    let linesForPolygon2 = [
        [1000, 1000, 0, 1000, 700, 0],
        [1000, 700, 0, 700, 700, 0],
        [700, 700, 0, 700, 1000, 0],
        [700, 1000, 0, 1000, 1000, 0]
    ];

    // fill polygon
    fillPolygon(linesForPolygon0);

    console.log("NOW STARTING COUNTER CLOCKWISE")

    fillPolygon(linesForPolygon1)
    // fillPolygon(linesForPolygon2)
    // fillPolygon(linesForPolygon3)
    

}

function addMousePoint(ev, gl, canvas) {
    let x = ((ev.clientX - drawingLeft) - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - drawingTop)) / (canvas.height / 2);
    let arrayPos = verticesSize * 3;
    vertices[arrayPos] = x;
    vertices[arrayPos + 1] = y;
    vertices[arrayPos + 2] = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices, 0, arrayPos + 3);

    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    verticesSize = verticesSize + 1;
    console.log("adding " + ev.clientX + " " + ev.clientY);

    // draw the new buffer stuff
    draw();
}

// Call init once the webpage has loaded
window.onload = init;