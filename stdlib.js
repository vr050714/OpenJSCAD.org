/* 
 * library of standard objects like NEMA motors, washers, nuts, bolts, etc
 */

var std = {

    washer: {
            
	    create: function(Din, Dout, h) {
            return CAG.circle({center: [0,0], radius: 0.5*Dout, resolution: 32})
                      .subtract(CAG.circle({center: [0,0], radius: 0.5*Din, resolution: 32}))
                      .extrude({offset: [0,0,h]});
	    },
        
        /* ISO 7089 */
        M2:   function() { return this.create( 2.2,  5, 0.3); },
        M2p5: function() { return this.create( 2.7,  6, 0.5); },
        M2p6: function() { return this.create( 2.8,  7, 0.5); },
        M3:   function() { return this.create( 3.2,  7, 0.5); },
        M3p5: function() { return this.create( 3.7,  8, 0.5); },
        M4:   function() { return this.create( 4.3,  9, 0.8); },
        M5:   function() { return this.create( 5.3, 10, 1.0); },
        M6:   function() { return this.create( 6.4, 12, 1.6); },
        M7:   function() { return this.create( 7.4, 14, 1.6); },
        M8:   function() { return this.create( 8.4, 16, 1.6); },
        M10:  function() { return this.create(10.5, 20, 2.0); },
        M12:  function() { return this.create(13.0, 24, 2.5); },
        M14:  function() { return this.create(15.0, 28, 2.5); }
    },
    
    nut: {

        create: function(Din, S, h) {
            var a = 1 / Math.sqrt(3);
            var x0 = 0.5 * S;
            var y0 = a * x0;
            var s0 = a * S;
            var hole = CAG.circle({centre: [0,0,0], radius: 0.5*Din, resolution: 32});
            var pts = [[x0, y0], [0, s0], [-x0, y0], [-x0, -y0], [0, -s0], [x0, -y0]];
            return CAG.fromPoints(pts)
                      .subtract(hole)
                      .extrude({offset: [0,0,h]});
        },
        
        /* ISO 4032 */
        M2:   function() { return this.create( 2.0,  4.0,  1.6); },
        M2p5: function() { return this.create( 2.5,  5.0,  2.0); },
        M3:   function() { return this.create( 3.0,  5.5,  2.4); },
        M3p5: function() { return this.create( 3.5,  6.0,  2.8); },
        M4:   function() { return this.create( 4.0,  7.0,  3.2); },
        M5:   function() { return this.create( 5.0,  8.0,  4.7); },
        M6:   function() { return this.create( 6.0, 10.0,  5.2); },
        M8:   function() { return this.create( 8.0, 13.0,  6.8); },
        M10:  function() { return this.create(10.0, 16.0,  8.4); },
        M12:  function() { return this.create(12.0, 18.0, 10.8); },
        M14:  function() { return this.create(14.0, 21.0, 12.8); }
    },

    bolt: {

        create: function() {
            return null;
        }
        
        // TODO: add bolts
    },
    
    stepper: {

        createNEMA: function(D, L, d, e, b, c, a, f, g) {
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
                radius: b/2.0,
                resolution: 16
            });
        
            var screwM3 = CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, -g],
                radius: f/2.0,
                resolution: 16
            });
        
            var bumper = CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, e],
                radius: d/2.0,
                resolution: 32
            }).subtract(CSG.cylinder({
                start: [0, 0, 0],
                end: [0, 0, e],
                radius: d1/2.0,
                resolution: 32
            }));
                    
            var nemaBox = CAG.roundedRectangle({
                              center: [0,0],
                              radius: [0.5*D, 0.5*D],
                              roundradius: 0.5*(D-a),
                              resolution: 16
                          }).extrude({offset: [0,0,-L]});
             
            return nemaBox.union(shaft)
                          .union(bumper)
                          .subtract(screwM3.translate([ a/2.0, a/2.0, 0]))
                          .subtract(screwM3.translate([-a/2.0, a/2.0, 0]))
                          .subtract(screwM3.translate([-a/2.0,-a/2.0, 0]))
                          .subtract(screwM3.translate([ a/2.0,-a/2.0, 0]));
        },
        
        /* nemaDDLL
         *   DD - motor size
         *   LL - motor length
         */
        nema14: function() { return this.createNEMA(35.3, 26.0, 22.0, 2.0, 5.0, 24.0, 26.0, 3, 3.5); },
        nema17: function() { return this.nema1719(); },
        
        nema1713: function() { return this.createNEMA(42.3, 33.0, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },
        nema1715: function() { return this.createNEMA(42.3, 38.1, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },
        nema1719: function() { return this.createNEMA(42.3, 48.3, 22.0, 2.0, 5.0, 24.0, 31.0, 3, 4.5); },
        
        nema2318: function() { return this.createNEMA(56.4, 45.7, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); },
        nema2322: function() { return this.createNEMA(56.4, 55.9, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); },
        nema2331: function() { return this.createNEMA(56.4, 78.7, 38.1, 1.6, 6.4, 20.6, 47.1, 5, 5.0); }
    }
    
    /* TODO:
     *   - add gears
     *   - add servos
     */
};
