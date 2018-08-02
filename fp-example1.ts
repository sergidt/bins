console.clear();

enum DeviceType {
    Camera, DMS
}

enum CameraType {
    Movable, Fixed
}

class Device {
    constructor(public name: string, public deviceType: DeviceType) {}
}

class Camera extends Device {
    constructor(public name: string, public cameraType: CameraType) {
        super(name, DeviceType.Camera);
    }
    isFixed(): boolean {
        return this.cameraType === CameraType.Fixed;
    }
}

let devices: Array<Device> = [
    new Device("DMS1", DeviceType.DMS),
    new Camera("Camera1", CameraType.Movable),
    new Device("DMS2", DeviceType.DMS),
    new Camera("Camera2", CameraType.Fixed),
    new Camera("Camera3", CameraType.Movable),
    new Camera("Camera4", CameraType.Fixed),
    new Camera("Camera4", CameraType.Fixed)
];

/**
 * function that counts the movable cameras from our devices list.
 */
function totalMovableCameras(devices: Device[]): number {
    let totalCameras = 0;
    devices.forEach((e) => {
        if (e.deviceType === DeviceType.Camera && !(<Camera>e).isFixed()) totalCameras++;
    });
    return totalCameras;
}

//console.log(`Total movable cameras: ${totalMovableCameras(devices)}`);

/**
    We can define a new type named Predicate, that receives a device and return a boolean value:
 */
type Predicate = (d: Device) => boolean;

function totalMovableCameras2(devices: Device[], conditions: Predicate[]): number {
    let totalCameras = 0;
    devices.forEach((d) => {
        if (conditions.every(c => c(d))) totalCameras++;
    });
    return totalCameras;
}

//console.log(`Total movable cameras -> ${totalMovableCameras2(devices, [(d) => d.deviceType === DeviceType.Camera, (d) => !<Camera>d.isFixed()])}`);

/**
 * rename the function because with predicates is a more general function:
 */
function getDevicesCountByConditions(devices: Device[], conditions: Predicate[]): number {
    let count= 0;
    devices.forEach((d) => {
        if (conditions.every(c => c(d)))   count++;
    });
    return count;
}

/**
 * We can say that a list of conditions is a composition of conditions, applying each one of them.
 * Then, we can create a combinator, and use it into our function:
 */

function and(predicates: Predicate[]): Predicate{
    return (e) => predicates.every(p => p(e));
}

function getDevicesCountByConditions(devices: Device[], conditions: Predicate[]): number {
    let count= 0;
    devices.forEach((d) => {
        if (and(conditions)(d))   count++;
    });
    return count;
}

console.log(`Total movable cameras -> ${getDevicesCountByConditions(devices, [(d) => d.deviceType === DeviceType.Camera, (d) => !<Camera>d.isFixed()])}`);

/**
 * We can think as a pipeline: get first desired data and then count:
 */
function getDevicesCountByConditions(devices: Device[], conditions: Predicate[]): number {
    const filteredDevices = devices.filter(and(conditions));
    return filteredDevices.length;
}

/**
 * Goal: Make it more complicated (or not), we want get the movable cameras average of whole cameras total. Is easy:
 */
function movableCamerasAverage(devices: Device[]){
    const totalCameras = getDevicesCountByConditions(devices, [(d) => d.deviceType === DeviceType.Camera]);
    const movableCamerasCount = getDevicesCountByConditions(devices, [(d) => d.deviceType === DeviceType.Camera, (d) => !<Camera>d.isFixed()]);
    return movableCamerasCount / totalCameras;
}
//console.log(`Movable cameras average: ${movableCamerasAverage(devices)}`);


/**
  We can simplify that code extracting Generic Functions. We can create a function to filter devices and use into our getDevicesCountByConditions function:
  Set the conditions into constants
*/
const movableCamerasConditions = [(d) => d.deviceType === DeviceType.Camera, (d) => !<Camera>d.isFixed()];
const totalCamerasConditions = [(d) => d.deviceType === DeviceType.Camera];

/**
 * Uses currying to filter the devices applying conditions.
 */
function filterDevices(conditions: Predicate[]): Device[] {
    return (devices) => devices.filter(and(conditions));
}

function getDevicesCountByConditions(devices: Device[], conditions: Predicate[]): number {
    return filterDevices(conditions)(devices).length;
}

//console.log(getDevicesCountByConditions(devices, movableCamerasConditions));

/**
 * Now we can change the movableCamerasAverage function:
 */
function movableCamerasAverage2(devices: Device[]){
    const totalCameras = getDevicesCountByConditions(devices, totalCamerasConditions);
    const movableCamerasCount = getDevicesCountByConditions(devices, movableCamerasConditions);
    return movableCamerasCount / totalCameras;
}

/**
 * Can be improved applying transformations as pipeline:
 */
function movableCamerasAverage3(devices: Device[]){
    const totalCameras = filterDevices(totalCamerasConditions)(devices);
    const movableCameras = filterDevices(movableCamerasConditions)(totalCameras);
    return movableCameras.length / totalCameras.length;
}


console.log(`Movable cameras average: ${movableCamerasAverage3(devices)}`);



