import {Response} from '@cycle/http';
import {HTTPSource} from '@cycle/http/rxjs-typings';
import {RequestOptions} from '@cycle/http';
import {PostRequest} from './api-model';
import {Observable} from 'rxjs/Observable';

type ClientResponse = {
    response?: Response;
} & Response;

const baseUrl = 'http://jsonplaceholder.typicode.com';

const defaultError = {
    code: 400,
    message: 'エラーが発生しました'
};

function buildRequestOption({category, method, path, send}: {
    category: string;
    method: 'GET' | 'POST',
    path: string;
    send?: any;
}) {
    const requestOptions: RequestOptions = {
        category,
        method,
        url: `${baseUrl}${path}`,
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json',
            'X-Device-type': 'web'
        },
        type: 'json'
    };
    if (send) {
        requestOptions['send'] = send;
    }
    return requestOptions;
}

export function makePostsGetRequest(postId: number) {
    return buildRequestOption({
        category: 'postsGet',
        method: 'GET',
        path: `/posts/${postId || ''}`
    });
}

export function makePostsGetResponse(HTTP: HTTPSource) {
    const response$: Observable<ClientResponse> = HTTP.select('postsGet').switchMap(x => x.catch((e: any) => Observable.of(e)));
    // return response$;
    const [success$, error$] = response$.map(response => ({
        status: response.status || defaultError.code,
        body: response.body || (response.response ? response.response.body : defaultError)
    })).partition(x => 200 <= x.status && x.status < 300);

    return {
        success$,
        error$
    };
}

export function makePostPostRequest(request: PostRequest) {
    return buildRequestOption({
        category: 'postPost',
        method: 'POST',
        path: '/posts',
        send: request
    });
}

export function makePostPostResponse(HTTP: HTTPSource) {
    const response$: Observable<ClientResponse> = Observable.from(HTTP.select('postPost')).switchMap(x => x.catch((e: any) => Observable.of(e)));
    // return response$;
    const [success$, error$] = response$.map(response => ({
        status: response.status || 400,
        body: response.body || (response.response ? response.response.body : defaultError)
    })).partition(x => 200 <= x.status && x.status < 300);

    return {
        success$,
        error$
    };
}
