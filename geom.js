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

module.geom = {
	
	line: function(prm) {
		return new Line(prm);
	},
	
	segment: function(p1, p2) {
		return new Segment(p1, p2);
	}
};

}(this));
