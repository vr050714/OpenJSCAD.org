/**
 * std.geom namespace is a set of classes that help in the calculation of point coordinates on the plane.
 * The core idea is to hide linear algebra and trigonometry in the classes and use them like ruler and compasses.
 */

(function(module) {

var Line = function(prm) {
	if (typeof(prm)==='undefined') throw new Error('parameters are undefined');
	if ('p1' in prm && 'p2' in prm) {
		if (typeof(prm['p1']) !== 'object' || prm['p1'].length != 2) throw new Error('p1 is not 1x2 element array');
		if (typeof(prm['p2']) !== 'object' || prm['p2'].length != 2) throw new Error('p2 is not 1x2 element array');
		var p1 = prm['p1'].slice(0);
		var p2 = prm['p2'].slice(0);
		var tx = p2[0]-p1[0];
		var ty = p2[1]-p1[1];
		var tn = Math.sqrt(tx*tx+ty*ty);
		this.norm = [-ty/tn, tx/tn];
		this.dist = this.norm[0]*p1[0]+this.norm[1]*p1[1];
	} else if ('norm' in prm && 'dist' in prm) {
		if (typeof(prm['norm']) !== 'object' || prm['norm'].length != 2) throw new Error('norm is not 1x2 element array');
		if (typeof(prm['dist']) !== 'number') throw new Error('dist is not a number');
		this.norm = prm['norm'].slice(0);
		this.dist = prm['dist'];
	} else throw new Error('wrong parameters');
};

Line.prototype = {
	intersect: function (that) {
		if (that instanceof Line) {
			var det = this.norm[0] * that.norm[1] - that.norm[0] * this.norm[1];
			if (Math.abs(det) > 1e-15)
				return [(this.dist * that.norm[1] - that.dist * this.norm[1]) / det,
					(this.norm[0] * that.dist - that.norm[0] * this.dist   ) / det];
			else return null; // lines are parallel
		} else if (that instanceof Segment)
			return this.intersect(new Line({p1: that.p1, p2: that.p2}));
		else throw new Error('unsupported type');
	},

	distance: function (p) {
		if (typeof(p) !== 'object' || p.length != 2) throw new Error('p is not 1x2 element array');
		return this.norm[0] * p[0] + this.norm[1] * p[1] - this.dist;
	},

	projection: function (p) {
		if (typeof(p) !== 'object' && p.length != 2) throw new Error('p is not 1x2 element array');
		var s = this.norm[0] * p[0] + this.norm[1] * p[1] - this.dist;
		return [p[0] - s * this.norm[0], p[1] - s * this.norm[1]];
	}
};

var Segment = function(p1, p2) {
	if (typeof(p1) !== 'object' || p1.length != 2) throw new Error('p1 is not 1x2 element array');
	if (typeof(p2) !== 'object' || p2.length != 2) throw new Error('p2 is not 1x2 element array');
	this.p1 = p1.slice(0);
	this.p2 = p2.slice(0);
};

Segment.prototype = {
	intersect: function (that) {
		if (that instanceof Segment) {
			var l1 = this.toLine();
			var l2 = that.toLine();
			if (l1.distance(that.p1) * l1.distance(that.p2) <= 0 &&
				l2.distance(this.p1) * l2.distance(this.p2) <= 0)
				return l1.intersect(l2);
			else return null;
		} else if (that instanceof Line)
			if (that.distance(this.p1) * that.distance(this.p2) <= 0)
				return that.intersect(new geom.Line({p1: this.p1, p2: this.p2}));
			else return null;
		else throw new Error('unsupported type');
	},

	toLine: function () {
		return new geom.Line({p1: this.p1, p2: this.p2});
	}
};

var Arc = function(prm) {
	if (Object.keys(prm).length == 3 && 'p1' in prm && 'p2' in prm && 'p3' in prm) {
		if (typeof(prm['p1']) !== 'object' || prm['p1'].length != 2) throw new Error('p1 is not 1x2 array');
		if (typeof(prm['p2']) !== 'object' || prm['p2'].length != 2) throw new Error('p2 is not 1x2 array');
		if (typeof(prm['p3']) !== 'object' || prm['p3'].length != 2) throw new Error('p3 is not 1x2 array');

		var det3x3 = function(a,b,c) {
			return a[0]*b[1]*c[2]+a[2]*b[0]*c[1]+a[1]*b[2]*c[0]
			      -a[2]*b[1]*c[0]-a[1]*b[0]*c[2]-a[0]*b[2]*c[1];
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
		var r = Math.sqrt(bx*bx+by*by-4*a*c)/2.0/Math.abs(a);
		
		var isccw = (p2[0]-p1[0])*(p3[1]-p1[1])-(p3[0]-p1[0])*(p2[1]-p1[1]) > 0;
		var phi1, phi2;
		if (isccw) {
			phi1 = Math.atan2(p1[1]-y0, p1[0]-x0);
			phi2 = Math.atan2(p3[1]-y0, p3[0]-x0);
		} else {
			phi1 = Math.atan2(p3[1]-y0, p3[0]-x0);
			phi2 = Math.atan2(p1[1]-y0, p1[0]-x0);
		}
		if (phi2<phi1) phi2 += 2.0 * Math.PI;
		
		this.StartPoint = p1;
		this.EndPoint = p3;
		this.Center = [x0, y0];
		this.Radius = r;
		this.isCCW = isccw;
		this.StartAngle = phi1;
		this.EndAngle = phi2;
		this.Bulge = (isccw ? 1.0 : -1.0) * Math.tan((phi2-phi1)/4.0);
		
	} else if (Object.keys(prm).length == 3 && 'p1' in prm && 'p2' in prm && 'bulge' in prm) {
		if (typeof(prm['p1']) !== 'object' || prm['p1'].length != 2) throw new Error('p1 is not 1x2 array');
		if (typeof(prm['p2']) !== 'object' || prm['p2'].length != 2) throw new Error('p2 is not 1x2 array');
		if (typeof(prm['bulge']) !== 'number') throw new Error('bulge is not a number');
		
		var p1 = prm['p1'];
		var p2 = prm['p2'];
		var bulge = prm['bulge'];
		var dpx = p2[0] - p1[0];
		var dpy = p2[1] - p1[1];
		var h = Math.sqrt(dpx*dpx+dpy*dpy);
		var s = 0.5 * b * h;
		var nx =  dpy/h;
		var ny = -dpx/h;
		
		return new Arc({
			p1: p1,
			p2: [0.5*(p1[0]+p2[0]) + s*nx,
			     0.5*(p1[1]+p2[1]) + s*ny],
			p3: p2
		});
		
	} else if (Object.keys(prm).length == 5 && 'center' in prm && 'r' in prm && 'start' in prm && 'end' in prm && 'isccw' in prm) {
		if (typeof(prm['center']) !== 'object' || prm['center'].length != 2) throw new Error('center is not 1x2 array');
		if (typeof(prm['r']) !== 'number') throw new Error('r is not a number');
		if (typeof(prm['start']) !== 'number') throw new Error('start is not a number');
		if (typeof(prm['end']) !== 'number') throw new Error('end is not a number');
		if (typeof(prm['isccw']) !== 'boolean') throw new Error('end is not a number');

		var p0 = prm['center'];
		var r = prm['r'];
		if (r <= 0) throw new Error('radius is not a positive number');
		var isccw = prm['isccw'];
		var phi1 = prm['start'];
		var phi2 = prm['end'];
		if (phi2<phi1) phi2 += 2.0 * Math.PI;
		
		var p1, p3;
		
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
		
	} else {
		throw new Error('unsupported list of parameters');
	}
};

Arc.prototype = {
	points: function(AbsTol) {
		// AbsTol - maximal distance between arc and segments
		if (typeof(AbsTol) === 'undefined') AbsTol = 0.1; // [mm], should be enough for 3D printing
		if (typeof(AbsTol) !== 'number') throw new Error('AbsTol is not a number');
		if (AbsTol <= 0) throw new Error('AbsTol is not a positive number');
		
		var dphi = 2 * Math.acos(1-AbsTol/this.Radius);
		var theta = this.EndAngle - this.StartAngle;
		var N = Math.ceil(theta/dphi)+1;
		
		var n, pts = [], px, py, phi, phi0;
		if (isccw) {
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

module.geom = {
	
	line: function(prm) {
		return new Line(prm);
	},
	
	segment: function(p1, p2) {
		return new Segment(p1, p2);
	},
	
	arc: function(prm) {
		return new Arc(prm);
	}
};

}(this));
