console.clear();
var Observable = Rx.Observable, BehaviorSubject = Rx.BehaviorSubject;
var printDevice = function (d) { return "name: " + d.name + ", is active? " + d.active; };
var applyFilter = function (devices, filter) { return devices.filter(function (device) { return device[filter.field] === filter.value; }); };
var devices = Observable.of([
    { name: 'Device 1', active: true },
    { name: 'Device 2', active: false },
    { name: 'Device 3', active: true },
    { name: 'Device 4', active: false },
]);
var filter = { field: 'active', value: true };
var filters = new BehaviorSubject(filter);
Observable.combineLatest(devices, filters)
    .map(function (_a) {
    var devices = _a[0], filter = _a[1];
    return applyFilter(devices, filter);
})
    .subscribe(function (devices) { return devices.forEach(function (device) { return console.log(printDevice(device)); }); });
