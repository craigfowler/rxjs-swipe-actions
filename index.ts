import { fromEvent, merge, interval } from 'rxjs'; 
import { map, mergeMap, takeLast, concatMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

const swipes = getSwipes(window.document.documentElement);

swipes.subscribe(x => {
  console.log(`Start: ${x.start.x}x${x.start.y}, End: ${x.end.x}x${x.end.y}, Time: ${x.time}`);
});


function getSwipes(ele : HTMLElement) {
  const events = getEvents(ele);

  const timerGranularityMs = 20;
  const timer = interval(timerGranularityMs);

  return events.start
    .pipe(concatMap(s => timer
            .pipe(map(t =>({start: s, time: t * timerGranularityMs})),
                  withLatestFrom(events.move),
                  takeUntil(events.end),
                  takeLast(1),
                  map(e => ({start: e[0].start, end: e[1], time: e[0].time})))));
}

function getEvents(ele : HTMLElement) {
  const touchstart = fromEvent(ele, 'touchstart')
    .pipe(map((ev : TouchEvent) => ({ x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY})));
  const touchmove = fromEvent(window, 'touchmove')
    .pipe(map((ev : TouchEvent) => ({ x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY})));
  const touchend = fromEvent(window, 'touchend')
    .pipe(map((ev : TouchEvent) => ({ x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY})));

  const mousedown = fromEvent(ele, 'mousedown')
    .pipe(map((ev : MouseEvent) => ({ x: ev.clientX, y: ev.clientY})));
  const mousemove = fromEvent(window, 'mousemove')
    .pipe(map((ev : MouseEvent) => ({ x: ev.clientX, y: ev.clientY})));
  const mouseup = fromEvent(window, 'mouseup')
    .pipe(map((ev : MouseEvent) => ({ x: ev.clientX, y: ev.clientY})));

  return {
    start: merge(touchstart, mousedown),
    move: merge(touchmove, mousemove),
    end: merge(touchend, mouseup)
  };
}