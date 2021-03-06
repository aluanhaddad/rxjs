import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { EmptyObservable } from '../observable/EmptyObservable';
import { TeardownLogic } from '../Subscription';

/**
 * Returns an Observable that repeats the stream of items emitted by the source Observable at most count times.
 *
 * <img src="./img/repeat.png" width="100%">
 *
 * @param {number} [count] The number of times the source Observable items are repeated, a count of 0 will yield
 * an empty Observable.
 * @return {Observable} An Observable that repeats the stream of items emitted by the source Observable at most
 * count times.
 * @method repeat
 * @owner Observable
 */
export function repeat<T>(this: Observable<T>, count: number = -1): Observable<T> {
  if (count === 0) {
    return new EmptyObservable();
  } else if (count < 0) {
    return this.lift(new RepeatOperator(-1, this));
  } else {
    return this.lift(new RepeatOperator(count - 1, this));
  }
}

class RepeatOperator<T> implements Operator<T, T> {
  constructor(private count: number,
              private source: Observable<T>) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RepeatSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>,
              private count: number,
              private source: Observable<T>) {
    super(destination);
  }
  complete() {
    if (!this.isStopped) {
      const { source, count } = this;
      if (count === 0) {
        return super.complete();
      } else if (count > -1) {
        this.count = count - 1;
      }
      source.subscribe(this._unsubscribeAndRecycle());
    }
  }
}
