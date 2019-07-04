---
title: "Kein unsubscribe() dank Angulars AsyncPipe"
description: "Dieser Blog-Post erklärt, wie man Angulars AsyncPipe benutzt, um explizite Aufrufe von unsubscribe() zu vermeiden."
date: 2019-05-31
author: "Pascal Chorus"
category: Angular
lang: de
---

## Observables in Komponenten

Verwendet man in einer Angular-Komponente einen Service, um Daten zu laden,
so wird man häufig den Wert in Form eines Observables erhalten.
Um den eigentlichen Wert nun abzurufen, muss man auf das Observable `subscribe()` aufrufen.
Auf jedes `subscribe()` muss auch ein `unsubscribe()` folgen, was schnell vergessen werden kann.

Dieser Blog-Post zeigt, wie man in Angular-Komponenten
Observables verwenden kann, ohne `subscribe()` aufzurufen.


## Beispiel

Als Ausgangspunkt haben wir eine Komponente, welche alle Filme der Star Wars-Serie auflistet.
Die Komponente ruft dazu aus dem `DataService` die Funktion `loadFilms()` auf, welche ein
Observable zurückliefert.
Der DataService ist wie folgt implementiert:
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
Zum Laden der Filme wird die Star Wars-API swapi.com genutzt.
Der Endpunkt zum Laden der Filme liefert in der Property `results` ein Array aller Filme.

In der App-Komponente wird diese Funktion des Service aufgerufen.
Durch Aufruf von `subscribe()` wird der Request angestoßen und
das Ergebnis in der Property `films` gespeichert.

Die App-Komponente ist folgendermaßen implementiert:
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


## Subscriptions auf Observables

Das obige Beispiel zeigt die übliche Verwendung von Observables.
Man erzeugt ein Observable, in diesem Beispiel mit dem Aufruf von `http.get()`.
Anschließend ruft man auf dem Observable `subscribe()` auf, um den Datenstream zu starten
und die erzeugten Werte zu erhalten.
Jeder Datenstream, der gestartet wurde, muss allerdings auch wieder beendet werden.
Das kann auf drei unterschiedliche Arten passieren:

1. Der Stream completed, dass heißt, das Observable erzeugt eine bestimmte Anzahl von Werten
und beendet sich anschließend.

2. Der Stream wirft eine Exception, die nicht abgefangen wird.

3. Auf der Subscription des Observables wird `unsubscribe()` aufgerufen. Dies ist
immer dann notwendig, wenn der Stream nicht completed und somit unendlich lange Werte
erzeugt.


## Angulars HttpClient

Im obigen Beispiel wird der Datenstream zum Laden der Filme durch Aufruf von `get()`
auf Angulars `HttpClient` aufgerufen. Dieser Aufruf erzeugt einen HTTP-Request.
Die Funktion gibt ein Observable zurück, welches als Wert das Ergebnis des Requests
erzeugt. Anschließend completed es.
Daher muss nicht `unsubscribe()` aufgerufen werden. Die Implementierung im Beispiel
ist somit korrekt.

Allerdings muss man bei Implementierung der `AppComponent` die Implementierung der Methode
`DataService.loadFilms()` kennen, um zu wissen, dass kein `unsubscribe()` nötig ist.
Zusätzlich könnte es sein, dass die Implementierung von `DataService.loadFilms()` geändert wird.
Da sich die Liste der Filme nur selten ändert, könnte das Ergebnis des HTTP-Requests
gecached werden, etwa so:
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

Die Komponente funktioniert weiterhin. Allerdings wird der Stream `DataService.films$`
nie beendet. Es ist ein Leck entstanden.
Um diesen Fehler zu korrigieren, muss in der `AppComponent` die Subscription
gespeichert und später `unsubscribe()` aufgerufen werden.
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

Dies ist zum einen fehleranfällig, da beim Refactoring des Service alle Stellen,
an denen `loadFilms()` aufgerufen wird, angepasst werden müssen.
Zum Anderen ist es etwas lästig, die Subscription in einer Property zu speichern
und beim zerstören der Komponente `unsubscribe()` aufzurufen.


## Die AsyncPipe

Um die Verwendung von Observables innerhalb von Komponenten zu vereinfachen gibt es
in Angular die AsyncPipe.

Die AsyncPipe kann direkt im Template auf Observables angewendet werden.
Sie ruft automatisch `subscribe()` auf und liefert den letzten erzeugten Wert des
Observables zurück.
Wird die Komponente zerstört, wird die Subscription automatisch durch Aufruf von
`unsubscribe()` aufgeräumt.
Wird der Variablen ein neues Observable zugewiesen, so wird ebenfalls `unsubscribe()`
auf das bisherige Observable aufgerufen und auf das neue Observable wird `subscribe()`
aufgerufen.  

Somit müssen keinerlei Subscriptions manuell verwaltet werden:
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

## Fazit

Die AsyncPipe kann dabei helfen, den Code innerhalb einer Komponente robuster und
weniger fehleranfällig bei Änderungen der Datenservices zu implementieren.
Der Code wird schlanker und `unscubscribe()` kann nicht vergessen werden.

Natürlich gibt es Fälle, in denen ein explizites `subscribe()` passender ist,
zum Beipiel, falls mehrere Seiteneffekte ausgeführt werden müssen oder die
Werte des Observables an mehreren Stellen verwendet werden.

Grundsätzlich folge ich der Faustregel:

Bevorzuge die AsyncPipe gegenüber eines expliziten `subscribe()`, es sei denn,
Du kannst begründen, warum Du sie nicht verwenden möchtest.


Ein vollständiges Beispiel findet Ihr auf [StackBlitz](https://stackblitz.com/github/pchorus/async-pipe-example).
