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

    // NOTE: this has to contain enough points for the initial drawing!
    vertices = new Float32Array(12000);
    verticesSize = 0;

    // Setting up the VBO - vertex buffer object
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// We call draw to render to our canvas
function draw() {
    // Clear the scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Below: This tells WebGL the -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the buffers we've constructed
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // args for vertexAttribPointer: 
    // arg 1) index == aVertexPosition == location of var in vertex shader
    // arg 2) size of aVertexPos (2D is 3, 3D is 4)
    // arg 3) Type of Data -> Float
    // arg 4) should vals of vertex be normalized? -> false because we already do that
    // arg 5) stride: always 0 -> if different google webgl vertexAttribPointer
    // arg 6) offset: always 0 -> if different google webgl vertexAttribPointer

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
    canvas.onmouseup = function (ev) { addMousePoint(ev) };

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
    initBuffers();
    draw();

    // Main function to draw initials for Miguel A Reyes - MAR
    drawInitials()

}

function drawInitials() {
    // some type of code for drawing your initials should be in here
    // note that it should use the midPointLineDrawing algorithm
    const startXForA = drawLetterM(500, 475, 550, 375, 4)
    const startXForR = drawLetterA(startXForA, 475, startXForA + 30, 375, 2)
    drawLetterR(startXForR + 60, 475, startXForR + 60, 375)

}

function drawLetterM(startX, startY, endX, endY, lines) {

    if (lines == 0) {
        return endX
    } else {
        const newStartX = midpointLineDrawing(startX, startY, endX, endY)
        const newEndY = startY
        return drawLetterM(newStartX, endY, newStartX + 40, newEndY, lines - 1)
    }
}

function drawLetterA(startX, startY, endX, endY) {
    const strLineStartX = startX + 40
    const newStartX = midpointLineDrawing(startX, startY, endX, endY)
    const newEndY = startY
    const strLineEndX = (midpointLineDrawing(newStartX, endY, newStartX + 50, newEndY) - 25)
    //Draws straight line
    midpointLineDrawing(strLineStartX, endY + 60, strLineEndX, endY + 60)
    return strLineEndX
}

function drawLetterR(startX, startY, endX, endY) {

    midpointLineDrawing(startX, startY, endX, endY) //  |

    let newEndX = midpointLineDrawing(startX, endY, startX + 70, endY) // --

    newEndX = midpointLineDrawing(newEndX, endY, newEndX, parseInt((startY + endY) / 2, 10)) // |
    
    midpointLineDrawing(startX, endY + 50, newEndX, endY + 50) // --

    midpointLineDrawing(startX, endY + 50, startX + 70, startY) //R

}

function midpointLineDrawing(startX, startY, endX, endY) {

    const dy = endY - startY
    const dx = endX - startX

    if (Math.abs(dy) <= dx) {
        return drawLineOnX(startX, startY, endX, dx, dy)

    } else {
        return drawLineOnY(startX, startY, endY, dx, dy)
    }
}

//Implementation of midpointline algo for looping along x
function drawLineOnX(startX, startY, endX, dx, dy) {
    const selectE = 2 * dy
    const selectNE = 2 * (dy - dx)

    let d = selectE - dx
    for (let x = startX, y = startY; x <= endX; ++x) {
        console.log("adding " + x + " " + y);
        let bufferStart = 0;
        if (verticesSize > 0) {
            bufferStart = verticesSize * 3;
        }
        let coords = normalizeCoordinates(x, y)
        addPoint(coords[0], coords[1])

        if (d <= 0) {
            d += selectE
        } else if(dy != 0){
            ++y
            d += selectNE
            console.log("adding " + x + " " + y);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, bufferStart * 4, vertices, bufferStart, 3);
        // Clean
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // draw the new buffer stuff
        draw();
    }
    //Capture where we left off so subsequent lines are spaced evenly
    return endX

}

//Implementation of midpointline algo for looping along y
function drawLineOnY(startX, startY, endY, dx, dy) {
    let condition;
    if ((endY - startY) < 0) {
        //if slope is positive
        condition = "--y >= endY"
    } else {
        // if slope is negative
        condition = "++y <= endY"
    }
    let x = startX, y = startY
    let d = 2 * dx - dy
    while (eval(condition)) {
        console.log("adding " + x + " " + y);
        let bufferStart = 0;
        if (verticesSize > 0) {
            bufferStart = verticesSize * 3;
        }
        let coords = normalizeCoordinates(x, y)
        console.log("adding " + coords[0] + " " + coords[1]);

        addPoint(coords[0], coords[1])

        if (d <= 0) {
            d += 2 * dx
        } else if(dx != 0) {
            ++x
            d += 2 * (dx - dy)
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, bufferStart * 4, vertices, bufferStart, 3);
        // Clean
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // draw the new buffer stuff
        draw();
    }
    //when |slope| > 1 were looping on the y so endX value
    //is not the same value we pass in
    return x

}

//convert from pixel coord to Clip Window coord (normalized coord)
function normalizeCoordinates(x, y) {
    const coords = []
    x = ((x - drawingLeft) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - drawingTop)) / (canvas.height / 2);
    coords.push(x)
    coords.push(y)
    return coords
}

// adds a point to a vertex array to then be drawn
function addPoint(x, y) {
    let arrayPos = verticesSize * 3;
    vertices[arrayPos] = x;
    vertices[arrayPos + 1] = y;
    vertices[arrayPos + 2] = 0;
    verticesSize += 1;
}

function addMousePoint(ev) {
    console.log("adding " + ev.clientX + " " + ev.clientY);
    let x = ((ev.clientX - drawingLeft) - canvas.width / 2) / (canvas.width / 2);
    let y = (canvas.height / 2 - (ev.clientY - drawingTop)) / (canvas.height / 2);
    let bufferStart = 0;
    if (verticesSize > 0) {
        bufferStart = verticesSize * 3;
    }
    console.log("adding " + x + " " + y);
    addPoint(x, y);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferStart * 4, vertices, bufferStart, 3);
    // Clean
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // draw the new buffer stuff
    draw();
}

// Call init once the webpage has loaded
window.onload = init;