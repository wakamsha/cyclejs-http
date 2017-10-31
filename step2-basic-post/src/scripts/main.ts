import {Observable} from 'rxjs';
import run from '@cycle/rxjs-run';
import {VNode, makeDOMDriver, div, button, h3, input, textarea, pre, CycleDOMEvent} from '@cycle/dom';
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
                h3(['POST']),
                div('.form-group', [
                    input('#post-title.form-control', {
                        attrs: {
                            placeholder: 'Title ...'
                        }
                    })
                ]),
                div('.form-group', [
                    textarea('#post-body.form-control', {
                        attrs: {
                            rows: 6
                        }
                    })
                ]),
                button('#post.btn.btn-outline-primary.btn-block', ['POST'])
            ]),
            div('.col-7', [
                div('.card.bg-light', [
                    div('.card-body', [
                        pre([JSON.stringify(pageState.response, null, 2)])
                    ])
                ])
            ])
        ])
    ])
}


function main({DOM, HTTP}: SoAll): SiAll {
    const eventClickPost$ = DOM.select('#post').events('click');
    const eventInputPostTitle$ = DOM.select('#post-title').events('input');
    const eventInputPostBody$ = DOM.select('#post-body').events('input');

    const request$ = Observable.from(eventClickPost$).withLatestFrom(
        eventInputPostTitle$.map((e: CycleDOMEvent) => (e.ownerTarget as HTMLInputElement).value),
        eventInputPostBody$.map((e: CycleDOMEvent) => (e.ownerTarget as HTMLInputElement).value),
        (_, postTitle, postBody) => ({
            url: 'http://jsonplaceholder.typicode.com/posts',
            category: 'api',
            method: 'POST',
            send: {
                id: 1,
                title: postTitle,
                body: postBody
            }
        })
    );

    const response$ = HTTP.select('api').switchMap(x => x);

    const defaultPageState = {
        response: {}
    };
    const pageState$ = response$.map(response => ({response})).startWith(defaultPageState);

    const dom$ = pageState$.map(pageState => render(pageState));

    return {
        DOM: dom$,
        HTTP: request$,
    };
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
});

