console.clear();
var Observable = Rx.Observable, Subject = Rx.Subject, BehaviorSubject = Rx.BehaviorSubject;
/**
 The Operation Stream Pattern
 ======================================================================================

 Here’s the idea:
 • We’ll maintain state in messages which will hold an Array of the most current Messages
 • We use an updates stream which is a stream of functions to apply to messages
 You can think of it this way: any function that is put on the updates stream
 will change the list of the current messages. A function that is put on the updates
 stream should accept a list of Messages and then return a list of Messages.

 */
function randomValue(array) {
    var rand = Math.floor(Math.random() * array.length);
    return array[rand];
}
var initialEvents = [];
//Incidence types
var TRAFFIC_ACCIDENT = "Traffic Accident";
var METEO_INCIDENCE = "Meteo Incidence";
var CLOSE_ROAD = "Close Road";
var DAMAGE = "Damage";
var UNKNOWN = "Unknown";
var incidenceTypes = [TRAFFIC_ACCIDENT, METEO_INCIDENCE, CLOSE_ROAD, DAMAGE, UNKNOWN];
var getIncidenceType = function () { return randomValue(incidenceTypes); };
//Severity types
var LOW = "Low";
var NORMAL = "Normal";
var HIGH = "High";
var VERY_HIGH = "Very High";
var severities = [LOW, NORMAL, HIGH, VERY_HIGH];
var getSeverity = function () { return randomValue(severities); };
var Incidence = (function () {
    function Incidence(type) {
        this.type = type;
    }
    return Incidence;
}());
Incidence.generateIncidence = function () { return new Incidence(getIncidenceType()); };
var Event = (function () {
    function Event(type, severity) {
        this.type = type;
        this.severity = severity;
    }
    return Event;
}());
var incidences = new Subject();
var events;
var updates = new Subject();
//let newEvents: Subject<Event> = new Subject<Event>();
/**

 [incidences] ----> [newEvents] ----> [updates] ----> [events]

 */
var incidenceToEvent = function (incidence) { return function (events) { return events.concat(new Event(incidence.type, getSeverity())); }; };
incidences
    .do(function (incidence) { return console.log('=> incidence: ' + incidence.type); })
    .map(incidenceToEvent)
    .subscribe(updates);
events = updates
    .scan(function (events, operation) { return operation(events); }, initialEvents)
    .publishReplay(1)
    .refCount();
/*
 incidences
 .subscribe( (incidence: Incidence) => {
 console.log('=> incidence: ' + incidence.type);
 });

 */
events
    .map(function (events) { return events[events.length - 1]; })
    .subscribe(function (event) {
    console.log('=> event: ' + event.type + ', severity: ' + event.severity);
});
/**
 This is a little bit better, but it’s not “the reactive way”.
 In part, because this action of creating a message isn’t composable with other streams.


 A reactive way of creating a new event would be to have a stream that accepts Events
 to add to the list. Again, this can be a bit new if you’re not used to thinking this way.
 Here’s how you’d implement it:
 First we make an “action stream” called create:

 It would be great if we had a way to easily connect this stream with any TrafficEvent
 that comes from newEvents$. It turns out, it’s really easy:
 */
// an imperative function call to this action stream
var addIncidence = function (incidence) { return incidences.next(incidence); };
Observable.interval(1000)
    .take(3)
    .map(function (x) { return Incidence.generateIncidence(); })
    .subscribe(incidences);
