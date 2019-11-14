import { EventEmitter } from 'events';

export interface Defer<T = any> {
    promise: Promise<T>;
    resolve: (data: any) => void;
    reject: (error: Error | string) => void;
}

export function makeDefer<T>(): Defer<T> {
    var resolve: Defer<T>['resolve'], reject: Defer<T>['reject'];

    const promise = new Promise<T>(
        (done, error) => ((resolve = done), (reject = error))
    );

    return { resolve, reject, promise };
}

export async function* listen<T>(emitter: EventEmitter, event: string) {
    var queue: Defer<T>[] = [makeDefer<T>()],
        cursor = 0;

    emitter
        .on(event, data => {
            queue[cursor++].resolve(data);

            queue.push(makeDefer<T>());
        })
        .on('error', error => queue[cursor].reject(error));

    while (true) {
        yield queue[0].promise;

        queue.shift(), cursor--;
    }
}
