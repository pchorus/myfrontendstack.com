---
title: "RxJS verstehen durch Implementieren eines Observables"
description: "In diesem Blog-Post wird ein Observable implementiert, um die Funktionsweise von RxJS zu erklären."
date: 2017-11-12
author: "Pascal Chorus"
category: RxJS
lang: de
---

## Einleitung

RxJS ist eine aktuelle Technologie, die sich wachsender Beliebtheit erfreut.
Angular setzt auf den Einsatz von RxJS für diverse Aufgaben.

Dieser Blog-Post möchte den Einstieg und das Grundkonzept von RxJS und Obervables
anhand einer Beispielimplementierung verdeutlichen.

## Was wir implementieren

Für unsere Implementierung des Observables habe ich ein sehr simples Beispiel gewählt.
Wir werden ein Observable erstellen, dass die numerischen Werte 1, 2 und 3 ausgibt
und anschließend "completed", sprich, es wird abgeschlossen und es werden keine weiteren
Werte ausgelöst.

Beim Aufruf des Observables (was in RxJS dem Aufruf von `Observable.subscribe()` entspricht)
muss ein Observer zur Verfügung gestellt werden.
Der Observer ist ein Objekt, der dem Observable Callback-Funktionen zur Verfügung stellt.
Das Observable kann diese Methoden aufrufen, sobald ein entsprechendes Ereignis eintritt. 
Der Observer muss die beiden Callback-Methoden `next()` und `complete()` zur Verfügung stellen.
`next()` wird für jeden neu ausgelösten Wert aufgerufen.
`complete()` wird aufgerufen, sobald das Observable abgeschlossen ist.
Diese Funktion wird nur ein einziges Mal aufgerufen.
Anschließend werden keine weiteren Werte ausgelöst.

Um das Beispiel einfach zu halten, verzichte ich auf eine Fehlerbehandlung.
Sollte diese hinzugefügt werden, so müsste eine weitere Callback-Funktion `error()`
zur Verfügung gestellt werden, die aufgerufen wird, falls ein Fehler auftritt.

Nachdem das Observable erstellt ist und funktioniert, werden wir den wohl bekanntesten
und am häufigsten genutzten Operator implementieren: `map()`.

`map()` verhält sich genauso wie die Funktion `Array.map()`.
`map()` bekommt eine Funktion übergeben, welche die Umformung eines Wertes in einen anderen Wert
beschreibt. In unserem Beispiel wird eine Funktion implementiert, welche die Eingabewerte
verdoppelt.

Zum Schluss werden wir ein asynchrones Observable erstellen, welches jede Sekunde
einen numerischen Wert auslöst. Dieses Beispiel enthält zwei neue Aspekte: zum einen ist
die Funktion asynchron. Zum Anderen wird dieses Observable von alleine nicht aufhören,
Werte auszulösen. Wir müssen einen Mechanismus zur Verfügung stellen, um das Auslösen
der Werte zu stoppen.

## Implementierung eines Observables als Funktion

Zunächst implementieren wir das Observable als Funktion.
Ein Observable ist eine simple Funktion, die als Parameter einen Observer erhält.
Ein Observer ist ein Objekt, das informiert wird, sobald neue Werte ausgelöst wurden
oder falls das Observable abgeschlossen wird.
Er observiert somit den Datenstrom des Observables.
Der Observer wird über neue Werte informiert, indem er eine Callback-Funktion zur Verfügung
stellt, die für jeden ausgelösten Wert aufgerufen wird. Diese Funktion heißt `next()`.
Die Funktion `complete()` wird aufgerufen, sobald das Observable ablgeschlossen ist
und keine weiteren Werte auslöst.

Die Implementierung sieht wie folgt aus:
```javascript
const observable = observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
};
```

Die Funktion erhält als Parameter den Observer. Auf dem Observer wird dreimal die Funktion
`next()` mit den jeweiligen Werten 1, 2 und 3 aufgerufen.
Zum Schluss wird `complete()` aufgerufen, um den Observer darüber zu informieren, dass keine
weiteren Werte ausgelöst werden.

Das Observable wird wie folgt genutzt:

```javascript
observable({
  next: val => console.log(val),
  complete: () => console.log('completed')
});
```

Die Funktion `observable()` wird aufgerufen und als Parameter wird das Observer-Objekt
mit den Funktionen `next()` und `complete()` übergeben. Zu Testzwecken geben die beiden
Funktionen den Wert bzw. den String "completed" auf der Konsole aus.

Die zu erwartende Ausgabe sieht wie folgt aus:
```
1
2
3
"completed"
```

## Implementierung des map-Operators

Im ersten Abschnitt wurde ein Observable definiert und aufgerufen.
Dadurch werden die einzelnen Werte ausgelöst und können verarbeitet werden.
RxJS stellt darüber hinaus Operatoren zur Verfügung, mit deren Hilfe der Datenstrom
mit den ausgelösten Werten manipuliert werden kann.

Der wohl bekannteste und am häufigsten verwendete Operator heißt `map()`.
Dieser funktioniert genauso wie die `Array.map()`-Funktion.
Man übergibt ihr eine Callback-Funktion, die für jeden Wert des Datenstroms aufgerufen wird.
Der aktuelle Wert wird als Parameter an die Funktion übergeben.
Der Wert kann innerhalb der Funktion manipuliert werden und der neue Wert wird von der
Funktion zurückgegeben.

Ein Operator ist eine Funktion, die als Parameter ein Observable bekommt und als
Rückgabewert ein neues Observable zurückgibt.
Dadurch ist es möglich, mehrere Operatoren miteinander zu verknüpfen.
Da ein Observable - wie oben beschrieben - eine Funktion ist, die einen Observer als Parameter
erhält, ist ein Operator eine Funktion, die eine Funktion mit Observer als Parameter
zurückgibt:

```javascript
function map(observable, mapFn) {
  return observer => {
    observable({
      next: val => observer.next(mapFn(val)),
      complete: () => observer.complete()
    });
  };
}
```

Der Operator kann wie folgt benutzt werden:

```javascript
map(observable, x => 2 * x);
```

Dies führt zu folgender Ausgabe:

```
2
4
6
"completed"
```

Was passiert bei diesem Aufruf?

Beim Aufruf von `map()` wird die `observable()`-Funktion aufgerufen.
Als Parameter erhält diese einen Observer mit den Funktionen `next()` und `complete()`.
Die `next()`-Funktion leitet den Aufruf an den Observer weiter. Allerdings nicht mit dem
Originalwert, sondern mit dem Ergebnis der `map()`-Funktion.

Durch diese Implementierung ist es möglich, mehrere Operatoren zu verknüpfen,
wie in folgendem Beispiel dargestellt:

```javascript
map(map(observable, x => 2 * x), x => x * x);
```

Dies führt zu folgender Ausgabe:

```
4
16
36
"completed"
```

Die Map-Operatoren werden von innen nach außen ausgeführt.
Daher werden die Werte zunächst mit zwei multipliziert und anschließend quadriert.

## Implementierung eines Observables als Klasse

Bis hierhin haben wir bereits zwei grundlegende Dinge implementiert:
* Das Erzeugen von Observables
* Die Anwendung von Operatoren

Allerdings hat die obige Implementierung einen entscheidenden Nachteil: schlechte Lesbarkeit.
Da Observables und Operatoren als Funktionen implementiert sind, führt die Kombination
von Operatoren zu geschachtelten Funktionsaufrufen.
Das ist schlecht lesbar.
Besser wäre es, wenn das Erzeugen eines Observables und das Anwenden von Operatoren
verkettet werden könnten.
Um das zu ermöglichen, implementieren wir nun das Observable als Klasse.

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }
}
```

In der ersten Implementierung ist das Observable lediglich eine Funktion.
In der Klassenimplementierung des Observables wird diese Funktion als Parameter
im Konstruktor übergeben und als Memberfunktion `subscribe()`gespeichert.
Um nun das Auslösen der Werte anzustoßen, muss `subscribe()` aufgerufen werden.

```javascript
const values$ = new Observable(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});

values$.subscribe({
  next: val => console.log(val),
  complete: () => console.log('completed')
});
```

Diese Implementierung ist fast identisch zur tatsächlichen Implementierung von RxJS mit
dem einzigen Unterschied, das hier ein Objekt mit den Funktionen `next()` und `complete()`
übergeben wird.
In RxJS werden diese Funktionen als einzelne Parameter übergeben.
Zudem muss die Fehlerfunktion als zweiter Parameter übergeben werden:

```javascript
const values$ = new Observable((next, error, complete) => {
  next(1);
  next(2);
  next(3);
  complete();
});

values$.subscribe(
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
);
```

Und somit haben wir die Implementierung von RxJS abgebildet.

## Hinzufügen des map-Operators in der Klasse

Als nächstes möchten wir den `map()`-Operator zu unserer Klasse hinzufügen.

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }

  map(mapFn) {
    return new Observable((next, error, complete) => {
      return this.subscribe(
        val => next(mapFn(val)),
        err => error(err),
        () => complete()
      );
    });
  }
}
```

Die Implementierung ist identisch zu der obigen, als `map()` als alleinstehende Funktion
implementiert wurde (mit dem Unterschied, dass wir nun nicht ein observer-Objekt mit
den Funktionen `next()`, `error()` und `complete()` übergeben,
sondern die Funktionen direkt übergeben).

```javascript
const values$ = new Observable((next, error, complete) => {
  next(1);
  next(2);
  next(3);
  complete();
});

values$
.map(x => 2 * x)
.subscribe(
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
);
```

Das Verketten von Operatoren ist nun deutlich lesbarer:

```javascript
// ...

values$
.map(x => 2 * x)
.map(x => x * x)
.subscribe(
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
);
```

Und auch hier haben wir die Implementierung von RxJS abgebildet.

## Hinzufügen eines asynchronen Observables

Nachdem wir nun Observables erstellt und den Operator `map()` implementiert haben,
werden wir als nächstes einen weiteren Operator implementieren: `interval()`.

Wie der Name schon sagt, erzeugt dieser aufeinanderfolgende numerische Werte
in einem gegebenen Intervall. Das Intervall wird in Millisekunden angegeben.
Die Implementierung wird mit der nativen JavaScript-Funktion `setInterval()` realisiert.
Da das Interval endlos Werte auslöst, muss eine Möglichkeit geschaffen werden,
dieses zu stoppen.
Um das zu realisieren, gibt die subscribe-Methode ein Objekt zurück,
welches eine Methode `unsubscribe()` zur Verfügung stellt.
Diese kann aufgerufen werden, um das Auslösen von Werten zu stoppen.

Hier die Implementierung:

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }

  // ...

  static interval(intervalMs) {
    return new Observable((next, error, complete) => {
      let count = 1;
      const interval = setInterval(() => {
        next(count++);
      }, intervalMs);
      // Return subscription object containing method to unsubscribe.
      return {
        unsubscribe: () => clearInterval(interval)
      }
    });
  }
}
```

Folgendermaßen kann ein Observable mit der statischen Methode `interval()` erzeugt und
benutzt werden:

```javascript
const subscription =
  Observable.interval(1000)
    .subscribe(val => console.log(val));

// ... To stop emission of values, call
subscription.unsubscribe();

```

Weitere Beispiel zu Observables findet Ihr in meinem [GitHub-Repository](https://github.com/pchorus/rxjs-examples).
