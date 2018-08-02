console.clear();

var { Observable, Subject, BehaviorSubject } = Rx;

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
    const rand = Math.floor(Math.random() * array.length);
    return array[rand];
}

let initialEvents: Event[] = [];

type IncidenceType = string;

//Incidence types
const TRAFFIC_ACCIDENT = "Traffic Accident";
const METEO_INCIDENCE = "Meteo Incidence";
const CLOSE_ROAD = "Close Road";
const DAMAGE = "Damage";
const UNKNOWN = "Unknown";

const incidenceTypes = [TRAFFIC_ACCIDENT, METEO_INCIDENCE, CLOSE_ROAD, DAMAGE, UNKNOWN];

const getIncidenceType = () => randomValue(incidenceTypes);

//Severity types
const LOW = "Low";
const NORMAL = "Normal";
const HIGH = "High";
const VERY_HIGH = "Very High"

const severities = [LOW, NORMAL, HIGH, VERY_HIGH];

type Severity = string;

const getSeverity = () => randomValue(severities);

class Incidence {
    constructor(public type: IncidenceType){}

    static generateIncidence: Incidence = () => new Incidence(getIncidenceType());
}

class Event {
    constructor(public type: IncidenceType, public severity: Severity){}
}

interface IEventOperation extends Function {
    (events: Event[]): Event[];
}

let incidences: Subject<Incidence> = new Subject<Incidence>();

let events: Observable<Event[]>;

let updates: Subject<any> = new Subject<any>();

//let newEvents: Subject<Event> = new Subject<Event>();

/**

 [incidences] ----> [newEvents] ----> [updates] ----> [events]

 */

const incidenceToEvent : IEventOperation = (incidence: Incidence) => (events: Event[]) => events.concat(new Event(incidence.type, getSeverity()));

incidences
.do(incidence => console.log('=> incidence: ' + incidence.type))
.map( incidenceToEvent )
.subscribe(updates);


events = updates
// watch the updates and accumulate operations on the messages
.scan((events: Event[], operation: IEventOperation) => operation(events),
    initialEvents)
// make sure we can share the most recent list of messages across anyone
// who's interested in subscribing and cache the last known list of
// messages
.publishReplay(1)
.refCount();


/*
 incidences
 .subscribe( (incidence: Incidence) => {
 console.log('=> incidence: ' + incidence.type);
 });

 */

events
//.do(events => console.log(`#Events: ${events.length}`))
.map(events => events[events.length -1])
.subscribe( (event: Event) => {
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
const addIncidence = (incidence: Incidence) => incidences.next(incidence);

Observable.interval(1000)
          .take(3)
          .map(x => Incidence.generateIncidence())
          .subscribe(incidences);


