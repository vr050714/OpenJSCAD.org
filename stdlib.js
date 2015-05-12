/* 
 * library of standard objects like NEMA motors, washers, nuts, bolts, etc
 */

(function(module) {

module.std = {

    washer: {

        create: function (Din, Dout, h) {
            return CAG.circle({center: [0, 0], radius: 0.5 * Dout, resolution: 32})
                .subtract(CAG.circle({center: [0, 0], radius: 0.5 * Din, resolution: 32}))
                .extrude({offset: [0, 0, h]});
        },

        /* ISO 7089 */
        M2:   function () { return this.create(2.2, 5, 0.3); },
        M2p5: function () { return this.create(2.7, 6, 0.5); },
        M2p6: function () { return this.create(2.8, 7, 0.5); },
        M3:   function () { return this.create(3.2, 7, 0.5); },
        M3p5: function () { return this.create(3.7, 8, 0.5); },
        M4:   function () { return this.create(4.3, 9, 0.8); },
        M5:   function () { return this.create(5.3, 10, 1.0); },
        M6:   function () { return this.create(6.4, 12, 1.6); },
        M7:   function () { return this.create(7.4, 14, 1.6); },
        M8:   function () { return this.create(8.4, 16, 1.6); },
        M10:  function () { return this.create(10.5, 20, 2.0); },
        M12:  function () { return this.create(13.0, 24, 2.5); },
        M14:  function () { return this.create(15.0, 28, 2.5); }
    },

    nut: {

        create: function (Din, S, h) {
            var a = 1 / Math.sqrt(3);
            var x0 = 0.5 * S;
            var y0 = a * x0;
            var s0 = a * S;
            var hole = CAG.circle({centre: [0, 0, 0], radius: 0.5 * Din, resolution: 32});
            var pts = [[x0, y0], [0, s0], [-x0, y0], [-x0, -y0], [0, -s0], [x0, -y0]];
            return CAG.fromPoints(pts)
                .subtract(hole)
                .extrude({offset: [0, 0, h]});
        },

        /* ISO 4032 */
        M2:   function () { return this.create(2.0, 4.0, 1.6); },
        M2p5: function () { return this.create(2.5, 5.0, 2.0); },
        M3:   function () { return this.create(3.0, 5.5, 2.4); },
        M3p5: function () { return this.create(3.5, 6.0, 2.8); },
        M4:   function () { return this.create(4.0, 7.0, 3.2); },
        M5:   function () { return this.create(5.0, 8.0, 4.7); },
        M6:   function () { return this.create(6.0, 10.0, 5.2); },
        M8:   function () { return this.create(8.0, 13.0, 6.8); },
        M10:  function () { return this.create(10.0, 16.0, 8.4); },
        M12:  function () { return this.create(12.0, 18.0, 10.8); },
        M14:  function () { return this.create(14.0, 21.0, 12.8); }
    },

    bolt: {

        create: function () {
            return null;
        }

        /*
         TODO: add bolts
         */
    },

    stepper: {

        createNEMA: function (D, L, d, e, b, c, a, f, g) {
            // D - body width
            // L - body height
            // d - bumper outer diameter
            // e - bumper height
            // b - shaft diameter
            // c - shaft length
            // a - distance between bolt holes
            // f - bolt hole diameter
            // g - bolt hole depth

            var d1 = b + 4; // bumper inner diameter

            var shaft = CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, c],
                radius: b / 2.0,
                resolution: 16
            });

            var screwM3 = CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, -g],
                radius: f / 2.0,
                resolution: 16
            });

            var bumper = CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, e],
                radius: d / 2.0,
                resolution: 32
            }).subtract(CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, e],
                radius: d1 / 2.0,
                resolution: 32
            }));

            var nemaBox = CAG.roundedRectangle({
                center: [0, 0],
                radius: [0.5 * D, 0.5 * D],
                roundradius: 0.5 * (D - a),
                resolution: 16
            }).extrude({offset: [0, 0, -L]});

            return nemaBox.union(shaft)
                .union(bumper)
                .subtract(screwM3.translate([a / 2.0, a / 2.0, 0]))
                .subtract(screwM3.translate([-a / 2.0, a / 2.0, 0]))
                .subtract(screwM3.translate([-a / 2.0, -a / 2.0, 0]))
                .subtract(screwM3.translate([a / 2.0, -a / 2.0, 0]));
        },

        /* nemaDDLL
         *   DD - motor size
         *   LL - motor length
         */
        nema14: function () { return this.createNEMA(35.3, 26.0, 22.0, 2.0, 5.0, 24.0, 26.0, 3, 3.5); },
        nema17: function () { return this.nema1719(); },

        nema1713: function () { return this.createNEMA(42.3, 33.0, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },
        nema1715: function () { return this.createNEMA(42.3, 38.1, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },
        nema1719: function () { return this.createNEMA(42.3, 48.3, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },

        nema2318: function () { return this.createNEMA(56.4, 45.7, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); },
        nema2322: function () { return this.createNEMA(56.4, 55.9, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); },
        nema2331: function () { return this.createNEMA(56.4, 78.7, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); }
    },

    gear: {
        create: function (param) {
            /*
             This code was copied over Inkscape python extension script with small modifications:
             - converted from python to javascript and refactored
             - added more points on the involute curve
             - added warning if undercut is required
             */

            /*
             Copyright (C) 2007 Aaron Spike  (aaron @ ekips.org)
             Copyright (C) 2007 Tavmjong Bah (tavmjong @ free.fr)

             This program is free software; you can redistribute it and/or modify
             it under the terms of the GNU General Public License as published by
             the Free Software Foundation; either version 2 of the License, or
             (at your option) any later version.

             This program is distributed in the hope that it will be useful,
             but WITHOUT ANY WARRANTY; without even the implied warranty of
             MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
             GNU General Public License for more details.

             You should have received a copy of the GNU General Public License
             along with this program; if not, write to the Free Software
             Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
             */

            function getPropertyValue(s, prop) {
                if (!(prop in s)) throw Error(String.format('property "%s" is not defined', prop));
                return s[prop];
            }

            var teeth = getPropertyValue(param, 'teeth');
            var pitch = getPropertyValue(param, 'pitch');
            var angle = getPropertyValue(param, 'angle');
            var thickness = getPropertyValue(param, 'thickness');
            var bore = undefined;
            var resolution = 16;

            if ('bore' in param) bore = param['bore'];
            if ('resolution' in param) resolution = param['resolution'];

            function involute_intersect_angle(Rb, R) {
                return Math.sqrt(R * R - Rb * Rb) / Rb - Math.acos(Rb / R);
            }

            function point_on_circle(radius, angle) {
                return {
                    x: radius * Math.cos(angle),
                    y: radius * Math.sin(angle)
                };
            }

            var angle = angle * Math.PI / 180.0;

            var pi = Math.PI;
            var two_pi = 2.0 * pi;

            // Pitch (circular pitch): Length of the arc from one tooth to the next)
            // Pitch diameter: Diameter of pitch circle.
            var pitch_diameter = teeth * pitch / pi;
            var pitch_radius = pitch_diameter / 2.0;

            // Base Circle
            var base_diameter = pitch_diameter * Math.cos(angle);
            var base_radius = base_diameter / 2.0;

            // Diametrial pitch: Number of teeth per unit length.
            var pitch_diametrial = teeth / pitch_diameter;

            // Addendum: Radial distance from pitch circle to outside circle.
            var addendum = 1.0 / pitch_diametrial;

            // Outer Circle
            var outer_radius = pitch_radius + addendum;
            //var outer_diameter = outer_radius * 2.0;

            // Tooth thickness: Tooth width along pitch circle.
            //var tooth  = ( pi * pitch_diameter ) / ( 2.0 * teeth );

            // Undercut?
            var undercut = 2.0 / Math.pow(Math.sin(angle), 2);
            var needs_undercut = teeth < undercut;

            // Clearance: Radial distance between top of tooth on one gear to bottom of gap on another.
            var clearance = 0.0;

            // Dedendum: Radial distance from pitch circle to root diameter.
            var dedendum = addendum + clearance;

            // Root diameter: Diameter of bottom of tooth spaces.
            var root_radius = pitch_radius - dedendum;

            var half_thick_angle = two_pi / (4.0 * teeth );
            var pitch_to_base_angle = involute_intersect_angle(base_radius, pitch_radius);

            var centers = [];
            for (var x = 0; x < teeth; x++) centers.push(x * two_pi / teeth);

            var points = centers.map(function (c) {
                // Angles
                var pitch1 = c - half_thick_angle;
                var base1 = pitch1 - pitch_to_base_angle;

                var pitch2 = c + half_thick_angle;
                var base2 = pitch2 + pitch_to_base_angle;

                // Points
                var r1, r2, start_radius;
                if (root_radius > base_radius) {
                    // involute curve starts directly from root
                    r1 = [];
                    r2 = [];
                    start_radius = root_radius;
                } else {
                    // insert straight line segment from root to base
                    r1 = point_on_circle(root_radius, base1);
                    r2 = point_on_circle(root_radius, base2);
                    start_radius = base_radius;
                }

                var pp = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]; // defines points distribution on the involute curve
                var point_radius = pp.map(function (p) {
                    return start_radius + (outer_radius - start_radius) * p;
                });
                var p1 = point_radius.map(function (pr) {
                    return point_on_circle(pr, base1 + involute_intersect_angle(base_radius, pr));
                });
                var p2 = point_radius.map(function (pr) {
                    return point_on_circle(pr, base2 - involute_intersect_angle(base_radius, pr));
                });

                return [].concat(r1, p1, p2.reverse(), r2);
            });

            points = [].concat.apply([], points);

            var result = CAG.fromPoints(points);

            if (bore != undefined) result = result.subtract(CAG.circle({
                center: [0, 0],
                radius: 0.5 * bore,
                resolution: resolution
            }));

            return result.extrude({offset: [0, 0, thickness]});
        }
    },

    hole: {
        createCuttingObject: function (p) {
            /*
             Creates printable cylinder without overhanging faces.
             Parameters:
                     style: 'octagon', 'corner', 'flat'
                     depth: depth of the hole
                  diameter: diameter of the hole
                resolution: resolution of the circle
             */
            if (typeof p === 'undefined') p = {};

            var Depth      = 'depth'      in p ? p['depth']      : 100;
            var d          = 'diameter'   in p ? p['diameter']   : 8;
            var CutStyle   = 'style'      in p ? p['style']      : 'flat';
            var Resolution = 'resolution' in p ? p['resolution'] : 64;

            var Points = [];
            var phi = 0;
            var R = 0;
            var n = 0;

            switch (CutStyle) {
                case 'octagon':
                    R = 0.5 * d / Math.cos(Math.PI / 8.0);
                    for (n = 0; n<8; n++) {
                        phi = - 7.0 * Math.PI / 8.0 + n * Math.PI / 4.0;
                        Points.push([R*Math.cos(phi), R*Math.sin(phi)]);
                    }
                    break;
                case 'corner':
                    Resolution = 3 * Math.ceil(Resolution / 4.0);
                    R = 0.5 * d / Math.cos(0.75 * Math.PI / Resolution);
                    for (n = 0; n < Resolution; n++) {
                        phi = - 0.75 * Math.PI + (n + 0.5) * 1.5 * Math.PI / Resolution;
                        Points.push([R*Math.cos(phi), R*Math.sin(phi)]);
                    }
                    Points.push([-R * Math.sqrt(2), 0]);
                    break;
                default:
                    Resolution = 3 * Math.ceil(Resolution / 4.0);
                    R = 0.5 * d / Math.cos(0.75 * Math.PI / Resolution);
                    for (n = 0; n < Resolution; n++) {
                        phi = - 0.75 * Math.PI + (n + 0.5) * 1.5 * Math.PI / Resolution;
                        Points.push([R*Math.cos(phi), R*Math.sin(phi)]);
                    }
                    R = 0.5 * d / Math.cos(Math.PI / 8.0);
                    phi = 7.0 * Math.PI / 8.0;
                    Points.push([R*Math.cos(phi), R*Math.sin(phi)]);
                    phi = -7.0 * Math.PI / 8.0;
                    Points.push([R*Math.cos(phi), R*Math.sin(phi)]);
                    break;
            }
            return CAG.fromPoints(Points).extrude({offset:[0,0,Depth]}).rotateY(90);
        },

        octagon: function(d, h) {
            var p = {};
            p.style = 'octagon';
            if (typeof d === 'undefined')
                throw new Error('input argument "d" is undefined');
            p.diameter = d;
            if (typeof h !== 'undefined') p.depth = h;
            return this.createCuttingObject(p);
        },

        drop: function(d, h) {
            var p = {};
            p.style = 'corner';
            if (typeof d === 'undefined')
                throw new Error('input argument "d" is undefined');
            p.diameter = d;
            if (typeof h !== 'undefined') p.depth = h;
            return this.createCuttingObject(p);
        },

        flat: function(d, h) {
            var p = {};
            p.style = 'flat';
            if (typeof d === 'undefined')
                throw new Error('input argument "d" is undefined');
            p.diameter = d;
            if (typeof h !== 'undefined') p.depth = h;
            return this.createCuttingObject(p);
        }

    }

    /*
     TODO: add servos
     */
};

    /**
     * std.geom namespace is a set of classes that help in the calculation of point coordinates on the plane.
     */

    var Line = function(prm) {
        if (typeof(prm)==='undefined') throw new Error('parameters are undefined');
        if ('p1' in prm && 'p2' in prm) {
            if (typeof(prm['p1']) !== 'object' || length(prm['p1']) != 2) throw new Error('p1 is not 1x2 element array');
            if (typeof(prm['p2']) !== 'object' || length(prm['p2']) != 2) throw new Error('p2 is not 1x2 element array');
            var p1 = prm['p1'];
            var p2 = prm['p2'];
            var tx = p2[0]-p1[0];
            var ty = p2[1]-p1[1];
            var tn = Math.sqrt(tx*tx+ty*ty);
            this.norm = [-ty/tn, tx/tn];
            this.dist = this.norm[0]*p1[0]+this.norm[1]*p1[1];
        } else if ('norm' in prm && 'dist' in prm) {
            if (typeof(prm['norm']) !== 'object' || length(prm['norm']) != 2) throw new Error('norm is not 1x2 element array');
            if (typeof(prm['dist']) !== 'number') throw new Error('dist is not a number');
            this.norm = prm['norm'];
            this.dist = prm['dist'];
        } else throw new Error('wrong parameters');
    };

    Line.prototype.intersect = function(that) {
        if (typeof(that) === 'Line') {
            var det = this.norm[0]*that.norm[1]-that.norm[0]*this.norm[1];
            if (Math.abs(det) > 1e-15)
                return [(this.dist    * that.norm[1] - that.dist    * this.norm[1]) / det,
                        (this.norm[0] * that.dist    - that.norm[0] * this.dist   ) / det];
            else return null; // lines are parallel
        } else if (typeof(that) === 'Segment')
            return this.intersect(new Line({p1: that.p1, p2: that.p2}));
        else throw new Error('unsupported type');
    };

    Line.prototype.distance = function(p) {
        if (typeof(p) !== 'object' || length(p) != 2) throw new Error('p is not 1x2 element array');
        return this.norm[0]*p[0]+this.norm[1]*p[1]-this.dist;
    };

    var Segment = function(p1, p2) {
        if (typeof(p1) !== 'object' || length(p1) != 2) throw new Error('p1 is not 1x2 element array');
        if (typeof(p2) !== 'object' || length(p2) != 2) throw new Error('p2 is not 1x2 element array');
        this.p1 = p1;
        this.p2 = p2;
    };

    Segment.prototype.intersect = function(that) {
        if (typeof(that) === 'Segment') {
            // TODO: implement this feature
        } else if (typeof(that) === 'Line')
            if (that.distance(this.p1)*that.distance(this.p2) <= 0 )
                return that.intersect(new Line({p1: this.p1, p2: this.p2}));
            else return null;
        else throw new Error('unsupported type');
    };

    var geom = {};
    geom.Line = Line;
    geom.Segment = Segment;

    module.geom = geom;

}(this));
