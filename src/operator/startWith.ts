import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { ArrayObservable } from '../observable/ArrayObservable';
import { ScalarObservable } from '../observable/ScalarObservable';
import { EmptyObservable } from '../observable/EmptyObservable';
import { concatStatic } from './concat';
import { isScheduler } from '../util/isScheduler';

/* tslint:disable:max-line-length */
export function startWith<T>(this: Observable<T>, v1: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, v5: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, v1: T, v2: T, v3: T, v4: T, v5: T, v6: T, scheduler?: IScheduler): Observable<T>;
export function startWith<T>(this: Observable<T>, ...array: Array<T | IScheduler>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits the items you specify as arguments before it begins to emit
 * items emitted by the source Observable.
 *
 * <img src="./img/startWith.png" width="100%">
 *
 * @param {...T} values - Items you want the modified Observable to emit first.
 * @param {Scheduler} [scheduler] - A {@link IScheduler} to use for scheduling
 * the emissions of the `next` notifications.
 * @return {Observable} An Observable that emits the items in the specified Iterable and then emits the items
 * emitted by the source Observable.
 * @method startWith
 * @owner Observable
 */
export function startWith<T>(this: Observable<T>, ...array: Array<T | IScheduler>): Observable<T> {
  let scheduler = <IScheduler>array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
  } else {
    scheduler = null;
  }

  const len = array.length;
  if (len === 1) {
    return concatStatic(new ScalarObservable<T>(<T>array[0], scheduler), <Observable<T>>this);
  } else if (len > 1) {
    return concatStatic(new ArrayObservable<T>(<T[]>array, scheduler), <Observable<T>>this);
  } else {
    return concatStatic(new EmptyObservable(scheduler), <Observable<T>>this);
  }
}
