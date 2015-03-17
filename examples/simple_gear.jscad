function main() {
    var gear_prop = {
        teeth: 10,
        pitch: 4.5,
        angle: 25,
        thickness: 10,
        bore: 5
    };
    return std.gear.create(gear_prop);
}

