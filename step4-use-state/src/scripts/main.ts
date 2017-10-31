import {Observable} from 'rxjs';
import {assocPath, assoc} from 'ramda';
import {
    div, input, VNode, makeDOMDriver, button, label, pre, hr, CycleDOMEvent, textarea, span, h3,
    ul, li
} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import run from '@cycle/rxjs-run';
import {HTTPSource} from '@cycle/http/rxjs-typings';
import {makeHTTPDriver, RequestInput} from '@cycle/http';
import {
    makePostPostRequest, makePostPostResponse, makePostsGetRequest,
    makePostsGetResponse
} from './infras/api-client';
import {makeConsoleDriver} from './drivers/makeConsoleDriver';

type SoAll = {
    DOM: DOMSource;
    HTTP: HTTPSource;
}

type SiAll = {
    DOM: Observable<VNode>;
    HTTP: Observable<RequestInput>;
    LOG: Observable<any>;
}

type PageState = {
    payload: {
        userId: number;
        title: string;
        body: string;
    };
    postId: number;
}

function render({pageState, postResponse}: {
    pageState: PageState;
    postResponse: Object;
}): VNode {
    return div('.container-fluid', [
        div('.row', [
            div('.col.col-5', [
                div('.form-group', [
                    h3('GET'),
                    label(['取得する Post の id を指定']),
                    div('.input-group', [
                        span('.input-group-addon', ['post id']),
                        input('.event-input-post-id.form-control', {
                            attrs: {
                                type: 'number',
                                max: 100,
                                value: pageState.postId
                            }
                        }),
                        span('.input-group-btn', [
                            button('.event-click-get.btn.btn-info', ['GET']),
                        ])
                    ]),
                    ul('.form-text.text-muted', [
                        li(['未指定もしくは 0 を指定すると全件取得します。']),
                        li(['-1 を指定すると 404 エラーとなります。'])
                    ])
                ]),
                hr(),
                div('.form-group', [
                    h3('POST'),
                    input(`.event-input-post-title.form-control`, {
                        attrs: {
                            placeholder: 'Title ...',
                            value: pageState.payload.title
                        }
                    })
                ]),
                div('.form-group', [
                    textarea('.event-input-post-body.form-control', {
                        attrs: {
                            rows: 6
                        }
                    })
                ]),
                button(`.event-click-post.btn.btn-outline-primary.btn-block`, ['POST']),
            ]),
            div('.col.col-7', [
                div('.card.bg-light', [
                    div('.card-body', [
                        pre([JSON.stringify(postResponse, null, 2)])
                    ])
                ])
            ]),
        ])
    ])
}

function main({DOM, HTTP}: SoAll): SiAll {
    const eventInputPostId$ = DOM.select('.event-input-post-id').events('input');
    const eventClickGet$ = DOM.select('.event-click-get').events('click');
    const eventInputPostTitle$ = DOM.select('.event-input-post-title').events('input');
    const eventInputPostBody$ = DOM.select('.event-input-post-body').events('input');
    const eventClickPost$ = DOM.select('.event-click-post').events('click');

    const getResponse = makePostsGetResponse(HTTP);
    const postResponse = makePostPostResponse(HTTP);

    const defaultPageState: PageState = {
        payload: {
            userId: 1,
            title: '',
            body: ''
        },
        postId: 0
    };
    const pageState$: Observable<PageState> = Observable.merge(
        eventInputPostTitle$.map((e: CycleDOMEvent) => assocPath(['payload', 'title'], (e.ownerTarget as HTMLInputElement).value)),
        eventInputPostBody$.map((e: CycleDOMEvent) => assocPath(['payload', 'body'], (e.ownerTarget as HTMLInputElement).value)),
        eventInputPostId$.map((e: CycleDOMEvent) => assoc('postId', Number((e.ownerTarget as HTMLInputElement).value))),
    ).scan((acc: PageState, action: (acc: PageState) => PageState) => action(acc), defaultPageState).startWith(defaultPageState);

    const dom$ = Observable.combineLatest(
        pageState$,
        Observable.merge(
            getResponse.success$,
            getResponse.error$,
            postResponse.success$,
            postResponse.error$
        ).startWith({}),
        (pageState, postResponse) => render({pageState, postResponse})
    );

    const httpGet$ = eventClickGet$.withLatestFrom(
        pageState$,
        (_, pageState) => makePostsGetRequest(pageState.postId)
    );
    const httpPost$ = eventClickPost$.withLatestFrom(
        pageState$,
        (_, pageState) => makePostPostRequest(pageState.payload)
    );

    const log$ = Observable.merge(
        getResponse.success$,
        getResponse.error$,
        postResponse.success$,
        postResponse.error$
    );

    return {
        DOM: dom$,
        HTTP: Observable.merge(httpGet$, httpPost$),
        LOG: log$
    };
}

run(main, {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    LOG: makeConsoleDriver()
});

