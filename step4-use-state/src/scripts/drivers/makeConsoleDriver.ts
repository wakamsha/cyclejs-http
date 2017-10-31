import {Observable as XObservable} from 'xstream';
import {Observable} from 'rxjs/Observable';

export function makeConsoleDriver() {
    return function ConsoleDriver(sink$: XObservable<any>) {
        Observable.from(sink$)
            .subscribe(
                (item) => console.log(item)
            );
    }
}
