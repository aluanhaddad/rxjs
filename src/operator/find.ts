import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';

/* tslint:disable:max-line-length */
export function find<T, S extends T>(this: Observable<T>, predicate: (value: T, index: number) => value is S): Observable<S>;
export function find<T, S extends T, This>(this: Observable<T>, predicate: (this: This, value: T, index: number) => value is S, thisArg: This): Observable<S>;
export function find<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T>;
export function find<T, This>(this: Observable<T>, predicate: (this: This, value: T, index: number) => boolean, thisArg: This): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Emits only the first value emitted by the source Observable that meets some
 * condition.
 *
 * <span class="informal">Finds the first value that passes some test and emits
 * that.</span>
 *
 * <img src="./img/find.png" width="100%">
 *
 * `find` searches for the first item in the source Observable that matches the
 * specified condition embodied by the `predicate`, and returns the first
 * occurrence in the source. Unlike {@link first}, the `predicate` is required
 * in `find`, and does not emit an error if a valid value is not found.
 *
 * @example <caption>Find and emit the first click that happens on a DIV element</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.find(ev => ev.target.tagName === 'DIV');
 * result.subscribe(x => console.log(x));
 *
 * @see {@link filter}
 * @see {@link first}
 * @see {@link findIndex}
 * @see {@link take}
 *
 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
 * A function called with each item to test for condition matching.
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {Observable<T>} An Observable of the first item that matches the
 * condition.
 * @method find
 * @owner Observable
 */
export function find<T, This>(this: Observable<T>, predicate: (this: This, value: T, index: number, source: Observable<T>) => boolean,
                              thisArg?: This): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return <any>this.lift<any>(new FindValueOperator(predicate, this, false, thisArg));
}

export class FindValueOperator<T> implements Operator<T, T> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
  }

  call(observer: Subscriber<T>, source: any): any {
    return source.subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class FindValueSubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private source: Observable<T>,
              private yieldIndex: boolean,
              private thisArg?: any) {
    super(destination);
  }

  private notifyComplete(value: any): void {
    const destination = this.destination;

    destination.next(value);
    destination.complete();
    this.unsubscribe();
  }

  protected _next(value: T): void {
    const { predicate, thisArg } = this;
    const index = this.index++;
    try {
      const result = predicate.call(thisArg || this, value, index, this.source);
      if (result) {
        this.notifyComplete(this.yieldIndex ? index : value);
      }
    } catch (err) {
      this.destination.error(err);
      this.unsubscribe();
    }
  }

  protected _complete(): void {
    if (this.yieldIndex) {
      this.notifyComplete(-1);
    } else {
      this.destination.complete();
    }
  }
}
