import {Observable} from 'rxjs';
import run from '@cycle/rxjs-run';
import {VNode, makeDOMDriver, div, h3, button, pre, label, span, input, CycleDOMEvent, ul, li} from '@cycle/dom';
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
                label(['取得する Post の id を指定']),
                div('.input-group', [
                    span('.input-group-addon', ['post id']),
                    input('#post-id.form-control', {
                        attrs: {
                            type: 'number',
                            max: 100,
                            value: 0
                        }
                    }),
                    span('.input-group-btn', [
                        button('#get-posts.btn.btn-info', ['GET']),
                    ])
                ]),
                ul('.form-text.text-muted', [
                    li(['未指定もしくは 0 を指定すると全件取得します。']),
                    li(['-1 を指定すると 404 エラーとなります。'])
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
    ])
}

function main({DOM, HTTP}: SoAll): SiAll {
    const eventClickGet$ = DOM.select('#get-posts').events('click');
    const eventInputPostId$ = DOM.select('#post-id').events('click');

    const request$ = Observable.from(eventClickGet$).withLatestFrom(
        eventInputPostId$.map((e: CycleDOMEvent) => Number((e.ownerTarget as HTMLInputElement).value)),
        (_, postId) => ({
            url: `http://jsonplaceholder.typicode.com/posts/${postId || ''}`,
            category: 'api',
            method: 'GET'
        })
    );

    const response$ = HTTP.select('api').switchMap(x => x.catch(e => Observable.of(e)));
    const [success$, error$] = response$.map(response => ({
        status: response.status || 400,
        body: response.body || (response.response ? response.response.body : {})
    })).partition(x => 200 <= x.status && x.status < 300);

    const defaultPageState = {
        response: {}
    };
    const pageState$ = Observable.merge(
        success$,
        error$
    ).map(response => ({response})).startWith(defaultPageState);

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

