---
title: "Using Angular's AsyncPipe to avoid unsubscribe()"
description: "This post describes how to use the AsyncPipe and avoid explicit calls of unsubscribe()"
date: 2019-06-18
author: "Pascal Chorus"
category: Angular
lang: en
---

## Observables in components

When you implement an Angular component, you usually implement an associated service
to load data.
Most of the time, the service method that loads the data returns an observable.
To get the observable's value, you need to call `subscribe()` on the observable.
And everytime you call `subscribe()` you need to call `unsubscribe()` later on.
This may be forgotten easily and is not handy as well.

This blog post shows how to use observables in angular components without
calling `subscribe()`.


## Component example

As an example, we implement a component that lists all films of the Star Wars series.
To load all films, the component calls the `DataService`'s method `loadFilms()`.
This method returns an observable.

This is the implementation of the `DataService`:
```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  loadFilms() {
    return this.http.get<SwapiResults<StarWarsFilm>>('https://swapi.co/api/films/').pipe(
      map(data => data.results)
    );
  }
}
```
The films are loaded from the Star Wars-API on swapi.com.
The endpoint for loading all films returns an array of all films in the `results` property.

The app component calls this service function.
Afterwards, it calls `subscribe()` on the returned observable to fire the HTTP request.
The resulting list is assigned to the `films` property.


This is the implementation of the `AppComponent`:
```typescript
@Component({
  selector: 'app-root',
  template: `
    <h1>Async Pipe Example</h1>
    
    <h2>Star Wars Films</h2>
    <ul>
      <li *ngFor="let film of films">{{ film.title }}</li>
    </ul>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  films: StarWarsFilm[];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService
      .loadFilms()
      .subscribe(films => this.films = films);
  }
}
```


## Observables' subscriptions

The example above shows how an observable is usually used.
The observable is created, e.g. by calling `http.get()`.
Then the observable's `subscribe()` method is called to start the data stream
and to receive the emitted values.
Every data stream that was started must be stopped.
That can be done in one of the three following ways:

1. The stream completes, i.e. the observable emits a certain number of values
and stops.

2. The stream throws an exception that is not caught.

3. `unsubscribe()` is called on the observable's subscription. This needs to be done
when the observable does not complete and thus the stream would
keep emitting values endlessly. 


## Angular's HttpClient
In the example above, the data stream is started by calling `get()` on Angular's
`HttpClient`. This function creates an HTTP request and returns an observable.
The observable emits a single value which is the request's response and completes
immediately. Therefore, you do not need to call `unsubscribe()`.

The implementation in the example is correct, but you have to know the implementation
of `DataService.loadFilms()` when implementing the `AppComponent` to be sure
that no `unsubscribe()` is needed.
Furthermore, the implementation of `DataService.loadFilms()` may change in the
future, e.g. the request's result could be cached since the list of films
does not change often.

Caching could be implemented as follows:
```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private films$ = this.http.get<SwapiResults<StarWarsFilm>>('https://swapi.co/api/films/').pipe(
    map(data => data.results),
    shareReplay()
  );

  constructor(private http: HttpClient) {}

  loadFilms() {
    return this.films$;
  }
}
```

Everything keeps working fine, but the data stream `DataService.films$` is never stopped.
We just created a leak.

To fix that, the observable's subscription must be saved and `unsubscribe()`
must be called:
```typescript
...

export class AppComponent implements OnInit, OnDestroy {
  films: StarWarsFilm[];
  private subscription: Subscription;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.subscription = this.dataService.loadFilms().subscribe(films => this.films = films);
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

First, this is error-prone since every call of `loadFilms()` must be refactored
when the implementation of the service method changes.
Second, it is kind of inconvenient to save the subscription in a property
and call `unsubscribe()` to it as soon as the component is destroyed.


## The AsyncPipe

To make observables easier to use within components the AsyncPipe exists.
It can be used directly within your component's HTML template.
The AsyncPipe calls `subscribe()` automatically and returns the emitted values.
When the component is destroyed, it automatically calls `unsubscribe()`.
Even if a new observable is assigned to the variable used with the async pipe,
`unsubscribe()` is called on the current observable and `subscribe()` is called
on the new one.

Thus, no subscriptions have to be handled manually:
```typescript
@Component({
  selector: 'app-root',
  template: `
    <h1>Async Pipe Example</h1>
    
    <h2>Star Wars Films</h2>
    <ul>
      <li *ngFor="let film of films$ | async">{{ film.title }}</li>
    </ul>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  films$: Observable<StarWarsFilm[]>;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.films$ = this.dataService.loadFilms();
  }
}
```

## Conclusion

The AsyncPipe can help to make the code within components more robust and less
error-prone.
The code is easier and you cannot forget to call `unsubscribe()`.

Of course, there are cases where using `subscribe()` fits better, e.g. when
multiple side effects should be executed or when the observable's values
are used in several parts of the code.

I follow this rule of thumb:

Prefer the AsyncPipe over explicit `subscribe()` calls unless you have good
reasons against it.

You find the complete example on [Stackblitz](https://stackblitz.com/github/pchorus/async-pipe-example).
