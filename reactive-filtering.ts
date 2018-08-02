console.clear();

var { Observable, BehaviorSubject } = Rx;


interface Device {
    name: string;
    active: boolean;
}

interface Filter {
    field: string;
    value: any;
}

const printDevice = (d: Device) => `name: ${d.name}, is active? ${d.active}`;

interface IFilterOperation<T extends Device> extends Function {
    (devices: T[], filter: Filter): T[];
}

const applyFilter: IFilterOperation = (devices: Device[], filter: Filter) => devices.filter(device => device[filter.field] === filter.value);

const devices = Observable.of([
    <Device>{name: 'Device 1', active: true},
    <Device>{name: 'Device 2', active: false},
    <Device>{name: 'Device 3', active: true},
    <Device>{name: 'Device 4', active: false},
]);

const filter = {field: 'active', value: true};

const filters = new BehaviorSubject(filter);

Observable.combineLatest(devices, filters)
          .map(([devices, filter]) => applyFilter(devices, filter))
          .subscribe(devices => devices.forEach(device => console.log(printDevice(device))));



