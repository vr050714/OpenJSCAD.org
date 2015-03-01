
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
    }

};
