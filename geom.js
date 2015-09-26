/**
 * This is a set of classes that help in the calculation of point coordinates on
 * the plane. The core idea is to hide linear algebra and trigonometry in the
 * classes and use them like ruler and compasses.
 */

(function(module) {

"use strict";

var Vector2d = function(x, y) {
    if (y === undefined && x instanceof Array && x.length == 2)
        this.p = x.slice(0);
    else if (typeof x === 'number' && typeof y === 'number')
        this.p = [x, y];
    else
        throw new Error("wrong type of input arguments");
};

Vector2d.prototype = {
    norm: function() {
        return Math.sqrt( this.p[0]*this.p[0] + this.p[1]*this.p[1] );
    },
    unit: function() {
        var n = this.norm();
        return new Vector2d(this.p[0]/n, this.p[1]/n);
    },
    dot: function(v) {
        return this.p[0]*v.p[0] + this.p[1]*v.p[1];
    },
    cross: function(v) {
        return this.p[0]*v.p[1] - this.p[1]*v.p[0];
    },
    add: function(v) {
        if (v instanceof Vector2d)
            return new Vector2d(this.p[0]+v.p[0], this.p[1]+v.p[1]);
        else if (v instanceof Array && v.length == 2)
            return new Vector2d(this.p[0]+v[0], this.p[1]+v[1]);
        else
            throw new Error("input argument is neither Vector2d nor 2D array");
    },
    sub: function(v) {
        if (v instanceof Vector2d)
            return new Vector2d(this.p[0]-v.p[0], this.p[1]-v.p[1]);
        else if (v instanceof Array && v.length == 2)
            return new Vector2d(this.p[0]-v[0], this.p[1]-v[1]);
        else
            throw new Error("input argument is neither Vector2d nor 2D array");
    },
    scale: function(c) {
        return new Vector2d(c*this.p[0], c*this.p[1]);
    },
    rotate: function(ang) {
        var c = Math.cos(ang);
        var s = Math.sin(ang);
        return new Vector2d(c*this.p[0]-s*this.p[1], s*this.p[0]+c*this.p[1]);
    },
    reflect: function(ln) {
        if (ln === undefined || ln instanceof Line)
            throw new Error("input argument must be a Line");
        return null;
    },
    clone: function() {
        return new Vector2d(this.p[0], this.p[1]);
    },
    toArray: function() {
        return this.p.slice(0);
    }
};

/**
 * Line class helps to find intersection points, projections, distances to the
 * geometrical lines.
 */

var Line = function(p, n) {
    // add point
    if (p instanceof Vector2d)
        this.p = p.clone();
    else if (p instanceof Array && p.length == 2)
        this.p = new Vector2d(p[0], p[1]);
    else
        throw new Error("point must be a Vector2d or 2D array");
    // add normal
    if (n instanceof Vector2d)
        this.n = n.clone();
    else if (n instanceof Array && n.length == 2)
        this.n = new Vector2d(n[0], n[1]);
    else
        throw new Error("normal must be a Vector2d or 2D array");
    // distance to line
    this.d = this.p.dot(this.n)/this.n.norm();
};

Line.prototype = {
    intersect: function(ln) {
        if (!(ln instanceof Line))
            throw new Error("input argument is not an instance of Line class");
        // check for parallel
        var det = this.n.cross(ln.n);
        var norm1 = this.n.norm();
        var norm2 = ln.n.norm();
        var RelTol = 2e-16;
        if (Math.abs(det) < RelTol*norm1*norm2)
            throw new Error("linear system is bad conditioned");
        var pi2 = Math.PI/2;
        return this.n.rotate(pi2).scale(ln.d/det).sub(ln.n.rotate(pi2).scale(this.d/det));
    },
    reflect: function(ln) {
        return null;
    },
    clone: function() {
        return new Line(this.p, this.n);
    }
};

/**
 * Creates object representing arc properties
 *
 * Arc({p1:[1,0], p2:[0,1], p3:[-1,0]})
 * Arc({p1:[1,0], p2:[-1,0], bulge:1})
 * Arc({center: [0,0], radius: 1, start: 0, end: Math.PI/2, isccw: true})
 */
var Arc = function(prm) {
    
    var p1, p2, p3;
    var p0, r, phi1, phi2, isccw;
    
    if (Object.keys(prm).length == 3 && 'p1' in prm && 'p2' in prm && 'p3' in prm) {
        if (typeof prm.p1 !== 'object' || prm.p1.length != 2)
            throw new Error("p1 is not 1x2 array");
        if (typeof prm.p2 !== 'object' || prm.p2.length != 2)
            throw new Error("p2 is not 1x2 array");
        if (typeof prm.p3 !== 'object' || prm.p3.length != 2)
            throw new Error("p3 is not 1x2 array");

        p1 = prm.p1;
        p2 = prm.p2;
        p3 = prm.p3;

        var det3x3 = function(a,b,c) {
            return a[0]*b[1]*c[2] + a[2]*b[0]*c[1] + a[1]*b[2]*c[0] - 
                   a[2]*b[1]*c[0] - a[1]*b[0]*c[2] - a[0]*b[2]*c[1];
        };
        
        var tmp1 = [p1[0], p2[0], p3[0]];
        var tmp2 = [p1[1], p2[1], p3[1]];
        var tmp3 = [p1[0]*p1[0]+p1[1]*p1[1],
                    p2[0]*p2[0]+p2[1]*p2[1],
                    p3[0]*p3[0]+p3[1]*p3[1]];

        var a  =  det3x3(tmp1, tmp2, [1,1,1]);
        var bx = -det3x3(tmp3, tmp2, [1,1,1]);
        var by =  det3x3(tmp3, tmp1, [1,1,1]);
        var c  = -det3x3(tmp3, tmp1, tmp2);

        var x0 = -bx/2.0/a;
        var y0 = -by/2.0/a;
        
        r = Math.sqrt(bx*bx+by*by-4*a*c)/2.0/Math.abs(a);

        isccw = (p2[0]-p1[0])*(p3[1]-p1[1])-(p3[0]-p1[0])*(p2[1]-p1[1]) > 0;

        if (isccw) {
            phi1 = Math.atan2(p1[1]-y0, p1[0]-x0);
            phi2 = Math.atan2(p3[1]-y0, p3[0]-x0);
        } else {
            phi1 = Math.atan2(p3[1]-y0, p3[0]-x0);
            phi2 = Math.atan2(p1[1]-y0, p1[0]-x0);
        }
        if (phi2<phi1) phi2 += 2.0 * Math.PI;

        this.StartPoint = p1.slice(0);
        this.EndPoint = p3.slice(0);
        this.Center = [x0, y0];
        this.Radius = r;
        this.isCCW = isccw;
        this.StartAngle = phi1;
        this.EndAngle = phi2;
        this.Bulge = (isccw ? 1.0 : -1.0) * Math.tan((phi2-phi1)/4.0);

    } else if (Object.keys(prm).length == 3 && 'p1' in prm && 'p2' in prm && 'bulge' in prm) {
        if (typeof prm.p1 !== 'object' || prm.p1.length != 2)
            throw new Error("p1 is not 1x2 array");
        if (typeof prm.p2 !== 'object' || prm.p2.length != 2)
            throw new Error("p2 is not 1x2 array");
        if (typeof prm.bulge !== "number")
            throw new Error("bulge is not a number");

        p1 = prm.p1;
        p2 = prm.p2;
        
        var bulge = prm.bulge;
        var dpx = p2[0] - p1[0];
        var dpy = p2[1] - p1[1];
        var h = Math.sqrt(dpx*dpx+dpy*dpy);
        var s = 0.5 * bulge * h;
        var nx =  dpy/h;
        var ny = -dpx/h;

        return new Arc({
            p1: p1,
            p2: [0.5*(p1[0]+p2[0]) + s*nx,
                 0.5*(p1[1]+p2[1]) + s*ny],
            p3: p2
        });

    } else if (Object.keys(prm).length == 5 && 'center' in prm && 'radius' in prm && 'start' in prm && 'end' in prm && 'isccw' in prm) {
        if (typeof prm.center !== 'object' || prm.center.length != 2)
            throw new Error("center is not 1x2 array");
        if (typeof prm.radius !== 'number')
            throw new Error("radius is not a number");
        if (typeof prm.start !== 'number')
            throw new Error("start is not a number");
        if (typeof prm.end !== 'number')
            throw new Error("end is not a number");
        if (typeof prm.isccw !== 'boolean')
            throw new Error("end is not a number");

        p0 = prm.center;
        r = prm.radius;
        if (r <= 0)
            throw new Error("radius is not a positive number");
        isccw = prm.isccw;
        phi1 = prm.start;
        phi2 = prm.end;
        if (phi2<phi1) phi2 += 2.0 * Math.PI;

        if (isccw) {
            p1 = [p0[0] + r * Math.cos(phi1),
                  p0[1] + r * Math.sin(phi1)];
            p3 = [p0[0] + r * Math.cos(phi2),
                  p0[1] + r * Math.sin(phi2)];
        } else {
            p1 = [p0[0] + r * Math.cos(phi2),
                  p0[1] + r * Math.sin(phi2)];
            p3 = [p0[0] + r * Math.cos(phi1),
                  p0[1] + r * Math.sin(phi1)];
        }

        this.StartPoint = p1;
        this.EndPoint = p3;
        this.Center = p0;
        this.Radius = r;
        this.isCCW = isccw;
        this.StartAngle = phi1;
        this.EndAngle = phi2;
        this.Bulge = (isccw ? 1.0 : -1.0) * Math.tan((phi2-phi1)/4.0);

    } else
        throw new Error("unsupported list of parameters");
};

Arc.prototype = {
    points: function(AbsTol) {
        // AbsTol - maximal distance between arc and segments
        if (typeof AbsTol === undefined)
            AbsTol = 0.1; // [mm], should be enough for 3D printing
        if (typeof AbsTol !== 'number')
            throw new Error("AbsTol is not a number");
        if (AbsTol <= 0)
            throw new Error("AbsTol is not a positive number");

        var dphi = 2 * Math.acos(1-AbsTol/this.Radius);
        var theta = this.EndAngle - this.StartAngle;
        var N = Math.ceil(theta/dphi)+1;

        var n, pts = [], px, py, phi, phi0;
        if (this.isCCW) {
            dphi = theta/(N-1);
            phi0 = this.StartAngle;
        } else {
            dphi = -theta/(N-1);
            phi0 = this.EndAngle;
        }
        for (n = 0; n < N; n++) {
            phi = phi0 + dphi * n;
            px = this.Center[0] + this.Radius*Math.cos(phi);
            py = this.Center[1] + this.Radius*Math.sin(phi);
            pts.push([px, py]);
        }
        return pts;
    }
};

function createCuttingObject(p) {
    /*
     Creates printable cylinder without overhanging faces.
     Parameters:
     style: 'octagon', 'corner', 'flat'
     diameter: diameter of the hole
     resolution: resolution of the circle
     */
    if (typeof p === undefined) p = {};

    var d = 'diameter' in p ? p.diameter : 8;
    var CutStyle = 'style' in p ? p.style : 'flat';
    var Resolution = 'resolution' in p ? p.resolution : 64;

    var Points = [];
    var phi = 0;
    var R = 0;
    var n = 0;

    switch (CutStyle) {
        case 'octagon':
            R = 0.5 * d / Math.cos(Math.PI / 8.0);
            for (n = 0; n < 8; n++) {
                phi = -7.0 * Math.PI / 8.0 + n * Math.PI / 4.0;
                Points.push([R * Math.cos(phi), R * Math.sin(phi)]);
            }
            break;
        case 'corner':
            Resolution = 3 * Math.ceil(Resolution / 4.0);
            R = 0.5 * d / Math.cos(0.75 * Math.PI / Resolution);
            for (n = 0; n < Resolution; n++) {
                phi = -0.75 * Math.PI + (n + 0.5) * 1.5 * Math.PI / Resolution;
                Points.push([R * Math.cos(phi), R * Math.sin(phi)]);
            }
            Points.push([-R * Math.sqrt(2), 0]);
            break;
        default:
            Resolution = 3 * Math.ceil(Resolution / 4.0);
            R = 0.5 * d / Math.cos(0.75 * Math.PI / Resolution);
            for (n = 0; n < Resolution; n++) {
                phi = -0.75 * Math.PI + (n + 0.5) * 1.5 * Math.PI / Resolution;
                Points.push([R * Math.cos(phi), R * Math.sin(phi)]);
            }
            R = 0.5 * d / Math.cos(Math.PI / 8.0);
            phi = 7.0 * Math.PI / 8.0;
            Points.push([R * Math.cos(phi), R * Math.sin(phi)]);
            phi = -7.0 * Math.PI / 8.0;
            Points.push([R * Math.cos(phi), R * Math.sin(phi)]);
            break;
    }
    return Points;
}

module.geom = {
	
	point: function(x, y) {
		return new Vector2d(x, y);
	},
	
    line: function(p, n) {
    	return new Line(p, n);
    },

    arc: function(prm) {
        return new Arc(prm);
    },

    /*
     "octagon", "drop", "flat" are patterns that can be used for cutting printable holes when the axis of the hole
     lies in horizontal plane.
     d - diameter of the inscribed circle
     */
    octagon: function (d) {
        var p = {};
        p.style = 'octagon';
        if (typeof d === undefined)
            throw new Error("input argument d is undefined");
        p.diameter = d;
        return createCuttingObject(p);
    },

    drop: function (d) {
        var p = {};
        p.style = 'corner';
        if (typeof d === undefined)
            throw new Error("input argument d is undefined");
        p.diameter = d;
        return createCuttingObject(p);
    },

    flat: function (d) {
        var p = {};
        p.style = 'flat';
        if (typeof d === undefined)
            throw new Error("input argument d is undefined");
        p.diameter = d;
        return createCuttingObject(p);
    }

};

}(this));
