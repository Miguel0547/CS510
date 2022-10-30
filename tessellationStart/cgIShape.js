//
// fill in code that creates the triangles for a cube with dimensions 1x1x1
// on each side (and the origin in the center of the cube). with an equal
// number of subdivisions along each cube face as given by the parameter
//subdivisions
//
function makeCube(subdivisions) {

    const offset = 1 / subdivisions;

    //Front Face
    for (let y = 0.5; y > -0.499; y -= offset) {
        for (let x = -0.5; x < 0.499; x += offset) {
            addTriangle(
                x, y, 0.5,
                x + offset, y - offset, 0.5,
                x, y - offset, 0.5
            );
            addTriangle(
                x, y, 0.5,
                x + offset, y, 0.5,
                x + offset, y - offset, 0.5
            );
        }
    }

    //Back Face
    for (let y = 0.5; y > -0.499; y -= offset) {
        for (let x = -0.5; x < 0.499; x += offset) {
            addTriangle(
                x, y, -0.5,
                x, y - offset, -0.5,
                x + offset, y - offset, -0.5
            );
            addTriangle(
                x, y, -0.5,
                x + offset, y - offset, -0.5,
                x + offset, y, -0.5
            );
        }
    }

    //Right Side Face
    for (let y = 0.5; y > -0.499; y -= offset) {
        for (let z = 0.5; z > -0.499; z -= offset) {
            addTriangle(
                0.5, y, z,
                0.5, y - offset, z - offset,
                0.5, y - offset, z
            );
            addTriangle(
                0.5, y, z,
                0.5, y, z - offset,
                0.5, y - offset, z - offset
            );
        }
    }

    //Left Side Face
    for (let y = 0.5; y > -0.499; y -= offset) {
        for (let z = 0.5; z > -0.499; z -= offset) {
            addTriangle(
                -0.5, y, z,
                -0.5, y - offset, z,
                -0.5, y - offset, z - offset
            );
            addTriangle(
                -0.5, y, z,
                -0.5, y - offset, z - offset,
                -0.5, y, z - offset
            );
        }
    }
    // Top Face
    for (let z = 0.5; z > -0.499; z -= offset) {
        for (let x = -0.5; x < 0.499; x += offset) {
            addTriangle(
                x, 0.5, z,
                x, 0.5, z - offset,
                x + offset, 0.5, z - offset
            );
            addTriangle(
                x, 0.5, z,
                x + offset, 0.5, z - offset,
                x + offset, 0.5, z
            );
        }
    }

    //Botton Face
    for (let z = 0.5; z > -0.499; z -= offset) {
        for (let x = -0.5; x < 0.499; x += offset) {
            addTriangle(
                x, -0.5, z,
                x + offset, -0.5, z - offset,
                x, -0.5, z - offset
            );
            addTriangle(
                x, -0.5, z,
                x + offset, -0.5, z,
                x + offset, -0.5, z - offset
            );
        }
    }


}


//
// fill in code that creates the triangles for a cylinder with diameter 1
// and height of 1 (centered at the origin) with the number of subdivisions
// around the base and top of the cylinder (given by radialdivision) and
// the number of subdivisions along the surface of the cylinder given by
//heightdivision.
//
function makeCylinder(radialdivision, heightdivision) {

    const angle_offset = radians(360 / radialdivision);
    let curr_angle = 0;


    //Bottom Disk
    const radius = 0.49;
    let y = -0.5;
    let x = 0;
    let z = 0;
    let verticies = [0, -0.5, 0];
    let bttmVerticesCyl;

    for (let i = 0; i < radialdivision; i++) {
        for (let j = 0; j < 2; j++) {
            x = radius * Math.cos(curr_angle);
            z = radius * Math.sin(curr_angle);
            verticies.push(x);
            verticies.push(y);
            verticies.push(z);
            if (j == 1) {
                break
            }
            curr_angle += angle_offset;
        }

        addTriangle(
            verticies[0], verticies[1], verticies[2],
            verticies[6], verticies[7], verticies[8],
            verticies[3], verticies[4], verticies[5]
        );
        //Connect bottom edges to top edges
        bttmVerticesCyl = [
            verticies[3], -0.5, verticies[5],
            verticies[6], 0.49, verticies[8]
        ];
        makeFaceForEdgeOfTri(bttmVerticesCyl, heightdivision);

        verticies = [0, -0.5, 0];
    }

    //Top Disk
    verticies = [0, 0.5, 0]
    y = 0.5;
    for (let i = 0; i < radialdivision; i++) {
        for (let j = 0; j < 2; j++) {
            x = radius * Math.cos(curr_angle);
            z = radius * Math.sin(curr_angle);
            verticies.push(x);
            verticies.push(y);
            verticies.push(z);
            if (j == 1) {
                break;
            }
            curr_angle += angle_offset;
        }

        addTriangle(
            verticies[0], verticies[1], verticies[2],
            verticies[3], verticies[4], verticies[5],
            verticies[6], verticies[7], verticies[8]
        );

        verticies = [0, 0.5, 0];
    }


}


//
// fill in code that creates the triangles for a cone with diameter 1
// and height of 1 (centered at the origin) with the number of
// subdivisions around the base of the cone (given by radialdivision)
// and the number of subdivisions along the surface of the cone
//given by heightdivision.
//
function makeCone(radialdivision, heightdivision) {

    const angle_offset = radians(360 / radialdivision);
    const radius = 0.5;
    const offset = 1 / heightdivision;

    let curr_angle = 0;
    let y = -0.5;
    let x = 0;
    let z = 0;
    let currRadius = radius;
    let totalBttmVertices = [];

    //Iterate number of total disks -> value is dependent on value of heightdivision
    for (let h = 0; h < heightdivision; h++) {                
        let totalTopVertices = [];
        //Creates Disk
        for (let i = 0; i < radialdivision; i++) {

            //Reset for new triangle
            let verticies = [0, y, 0];

            for (let j = 0; j < 2; j++) {
                x = currRadius * Math.cos(curr_angle)
                z = currRadius * Math.sin(curr_angle)
                verticies.push(x);
                verticies.push(y);
                verticies.push(z);
                totalTopVertices.push(x);
                totalTopVertices.push(y);
                totalTopVertices.push(z);
                if (j == 1) {
                    //Dont want to update curr_angle after this point
                    break;
                }

                curr_angle += angle_offset;
            }

            addTriangle(
                verticies[0], verticies[1], verticies[2],
                verticies[6], verticies[7], verticies[8],
                verticies[3], verticies[4], verticies[5]
            );

            if (h == heightdivision - 1) {
                //At final disk construct tip                
                topVerticesCone = [verticies[3], verticies[4], verticies[5], verticies[6], verticies[7], verticies[8]];
                makeFaceforApex(topVerticesCone);
            }
        }
        
        if (totalBttmVertices.length != 0) {            
            connectDisk(totalBttmVertices, totalTopVertices.slice());
        }
        totalBttmVertices = totalTopVertices.slice();

        //Update verticle height by offset
        y = y + offset;

        //Update radius for new disk
        currRadius = currRadius - (radius * offset);
    }
}

//
// fill in code that creates the triangles for a sphere with diameter 1
// (centered at the origin) with number of slides (longitude) given by
// slices and the number of stacks (lattitude) given by stacks.
// For this function, you will implement the tessellation method based
// on spherical coordinates as described in the video (as opposed to the
//recursive subdivision method).
//
function makeSphere(slices, stacks) {

    //For testing purposes
    if (slices < 15 || stacks < 15){
        slices = 20;
        stacks = 15;
    }    
    

    let i;
    let j;  
    let totalBttmVertices = [];
    let vertices = [];

    for (j = 0; j <= stacks; j++) {
        // Vertices
        vertices = [];

        currAngle0 = j * Math.PI / stacks;
        xj = Math.cos(currAngle0);
        yj = Math.sin(currAngle0);
        for (i = 0; i <= slices; i++) {
        currAngle1 = i * 2 * Math.PI / slices;
        xi = Math.cos(currAngle1);
        yi = Math.sin(currAngle1);

        vertices.push(yi * yj);  // X
        vertices.push(xj);       // Y
        vertices.push(xi * yj);  // Z
        
        }

        if (totalBttmVertices.length != 0) {            
        connectDisk(totalBttmVertices, vertices.slice());
    }
    totalBttmVertices = vertices.slice();
    }
}


/**
 * Connects edges of top and bottom disk of same radius
 * @param {C} bottomVertices Bottom disk of cylinder
 * @param {*} heightdivision Height division provided by makeCylinder
 */
 function makeFaceForEdgeOfTri(bottomVertices, heightdivision) {

    let x0 = bottomVertices[0];
    let x1 = bottomVertices[3];
    let y0 = bottomVertices[1];
    let y1 = bottomVertices[4];
    let z0 = bottomVertices[2];
    let z1 = bottomVertices[5];

    const offset = 1 / heightdivision;

    for (let y = y0; y < y1; y += offset) {
        addTriangle(x0, y, z0, x1, y, z1, x0, y + offset, z0)
        addTriangle(x1, y, z1, x1, y + offset, z1, x0, y + offset, z0)
    }

}

/**
 * Connect last disk from cone to apex point
 * @param {*} disk Last disk in Cone
 */
 function makeFaceforApex(disk) {

    let x0 = disk[0];
    let x1 = disk[3];
    let y0 = disk[1];
    let y1 = disk[4];
    let z0 = disk[2];
    let z1 = disk[5];

    addTriangle(x0, y0, z0, x1, y1, z1, 0, 0.5, 0)

}

/**
 * Connects edges of top and bottom disk of different radius.
 * @param {*} bottomVertices Vertices for bottom disk
 * @param {*} topVertices Vertices for top disk
 */
function connectDisk(bottomVertices, topVertices) {

    const topVertLength = topVertices.length

    let x0 = bottomVertices[0];
    let x1 = bottomVertices[3];
    let y0 = bottomVertices[1];
    let y1 = bottomVertices[4];
    let z0 = bottomVertices[2];
    let z1 = bottomVertices[5];

    let xt0 = topVertices[0];
    let xt1 = topVertices[3];
    let yt0 = topVertices[1];
    let yt1 = topVertices[4];
    let zt0 = topVertices[2];
    let zt1 = topVertices[5];

    let counter = 0;

    for (let i = 0; i < topVertLength; i++) {
        if (counter == 6 && topVertices.length > 5) {
            //Get rid of vertices already mapped
            bottomVertices.splice(0, 6);
            topVertices.splice(0, 6);

            //Bottom edge
            x0 = bottomVertices[0];
            y0 = bottomVertices[1];
            z0 = bottomVertices[2];

            x1 = bottomVertices[3];
            y1 = bottomVertices[4];
            z1 = bottomVertices[5];

            //Top edge
            xt0 = topVertices[0];
            yt0 = topVertices[1];
            zt0 = topVertices[2];

            xt1 = topVertices[3];
            yt1 = topVertices[4];
            zt1 = topVertices[5];

            counter = 0;
        }

        addTriangle(
            x0, y0, z0,
            x1, y1, z1,
            xt1, yt1, zt1
        );
        addTriangle(
            xt1, yt1, zt1,
            xt0, yt0, zt0,
            x0, y0, z0
        );
        counter++;
    }

}


////////////////////////////////////////////////////////////////////
//
//  Do not edit below this line
//
///////////////////////////////////////////////////////////////////

function radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function addTriangle(x0, y0, z0, x1, y1, z1, x2, y2, z2) {


    var nverts = points.length / 4;

    // push first vertex
    points.push(x0); bary.push(1.0);
    points.push(y0); bary.push(0.0);
    points.push(z0); bary.push(0.0);
    points.push(1.0);
    indices.push(nverts);
    nverts++;

    // push second vertex
    points.push(x1); bary.push(0.0);
    points.push(y1); bary.push(1.0);
    points.push(z1); bary.push(0.0);
    points.push(1.0);
    indices.push(nverts);
    nverts++

    // push third vertex
    points.push(x2); bary.push(0.0);
    points.push(y2); bary.push(0.0);
    points.push(z2); bary.push(1.0);
    points.push(1.0);
    indices.push(nverts);
    nverts++;
}

