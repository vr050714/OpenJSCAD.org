/* 
 * library of standard objects like NEMA motors, washers, nuts, bolts, etc
 */

var std = {

    nema17: function() {
		// creates NEMA 17 motor
		var s1 = 42.2;  // body width
		var s2 = 34.0;  // body side length
		var s3 = 48.0;  // body height
		var s4 = 5.0;   // shaft diameter
		var s5 = 20.0;  // shaft length
		var s6 = 2.0;   // bumper height
		var s7 = 22.0;  // bumper outer diameter
		var s8 = 7.0;   // bumper inner diameter
		var s9 = 3.0;   // M3 hole
		var s10 = 5.0;  // M3 hole depth
		var s11 = 31.0; // distance between M3 holes
	
		var shaft = CSG.cylinder({
			start: [0, 0, 0],
			end: [0, 0, s5],
			radius: s4/2.0,
			resolution: 16
		});
	
		var screwM3 = CSG.cylinder({
			start: [0, 0, 0],
			end: [0, 0, -s10],
			radius: s9/2.0,
			resolution: 16
		});
	
		var bumper = CSG.cylinder({
			start: [0, 0, 0],
			end: [0, 0, s6],
			radius: s7/2.0,
			resolution: 32
		}).subtract(CSG.cylinder({
			start: [0, 0, 0],
			end: [0, 0, s6],
			radius: s8/2.0,
			resolution: 32
		}));
	
		var nemaOutline = [
			[ s1/2.0, s2/2.0], [ s2/2.0, s1/2.0],
			[-s2/2.0, s1/2.0], [-s1/2.0, s2/2.0],
			[-s1/2.0,-s2/2.0], [-s2/2.0,-s1/2.0],
			[ s2/2.0,-s1/2.0], [ s1/2.0,-s2/2.0]];
		
		var nemaBox = CAG.fromPoints(nemaOutline)
                         .extrude({offset: [0,0,-s3]});
         
		return nemaBox.union(shaft)
					  .union(bumper)
					  .subtract(screwM3.translate([ s11/2.0, s11/2.0, 0]))
					  .subtract(screwM3.translate([-s11/2.0, s11/2.0, 0]))
					  .subtract(screwM3.translate([-s11/2.0,-s11/2.0, 0]))
					  .subtract(screwM3.translate([ s11/2.0,-s11/2.0, 0]));
    },
    
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
    }

    /* TODO:
     *   - add bolts
     *   - add gears
     *   - add NEMA motors of different sizes
     *   - add servos
     */
};
