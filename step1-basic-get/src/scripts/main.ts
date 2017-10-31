import {Observable} from 'rxjs';
import run from '@cycle/rxjs-run';
import {VNode, makeDOMDriver, div, h3, button, pre, p, code} from '@cycle/dom';
import {makeHTTPDriver, RequestInput} from '@cycle/http';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {HTTPSource} from '@cycle/http/rxjs-typings';

type SoAll = {
    DOM: DOMSource;
    HTTP: HTTPSource;
}

type SiAll = {
    DOM: Observable<VNode>;
    HTTP: Observable<RequestInput>;
}

type PageState = {
    response: Object;
}

function render(pageState: PageState): VNode {
    return div('.container-fluid', [
        div('.row', [
            div('.col-5', [
                h3(['GET']),
                button('#get-posts.btn.btn-info.btn-block', ['GET']),
                p([
                    code('http://jsonplaceholder.typicode.com/posts'),
                    ' API を叩きます。'
                ])
            ]),
            div('.col-7', [
                div('.card.bg-light', [
                    div('.card-body', [
                        pre([JSON.stringify(pageState.response, null, 2)])
                    ])
                ])
            ])
        ])
    ]);
}

function main({DOM, HTTP}: SoAll): SiAll {
    const eventClickGet$ = DOM.select('#get-posts').events('click');

    const request$ = Observable.from(eventClickGet$).mapTo({
        url: 'http://jsonplaceholder.typicode.com/posts',
        category: 'api'
    });

    const response$ = HTTP.select('api').switchMap(x => x);

    const defaultPageState = {
        response: {}
    };
    const pageState$ = response$.map(response => ({response})).startWith(defaultPageState);

    const dom$ = pageState$.map(pageState => render(pageState));

    return {
        DOM: dom$,
        HTTP: request$
    };
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
});

