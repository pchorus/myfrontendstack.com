---
title: "Implementieren eines Observables mit pipeable Operators in RxJS"
description: "In diesem Blog-Post wird ein Observable implementiert, um die Funktionsweise von RxJS' pipeable Operators zu erklären."
date: 2019-07-04
author: "Pascal Chorus"
category: RxJS
lang: de
---

Im Post [RxJS verstehen durch Implementieren eines Observables](/rx-js-verstehen-durch-implementieren-eines-observables)
haben wir ein Observable und den `map()`-Operator implementiert, um zu zeigen,
wie RxJS funktioniert.
Die Implementierung des Beispiels hat sich an RxJS 5 orientiert.
Seit RxJS 5.5 gibt es zusätzlich die sogenannten pipeable Operators, welche
seit Version 6 die einzige Implementierung der Operatoren ist.

Dieser Blog-Post erklärt, warum diese Änderung in RxJS vorgenommen wurde und
implementiert zum besseren Verständnis den `map()`-Operator als pipeable Operator.

Um die Entwicklung von RxJS von Version 5 zu 6 nachzuvollziehen, ist es hilfreich,
zunächst den Post [RxJS verstehen durch Implementieren eines Observables](/rx-js-verstehen-durch-implementieren-eines-observables) zu lesen.

Das vollständige Beispiel findet Ihr bei [StackBlitz](https://stackblitz.com/edit/rxjs-implementation).


## Warum Pipeable Operators?

Bis RxJS 5.5 waren Operatoren in RxJS Funktionen der Klasse Observable.
Wenn man einen Operator nutzen wollte, musste man diesen einbinden.
Der Prototyp der Klasse Observable wurde dann um diese Operator-Funktion erweitert.
Der Nachteil dabei ist, dass diese Funktion nicht tree shakeable ist,
da sie nach dem Hinzufügen fester Bestandteil der Klasse ist.
Selbst wenn der Operator nicht mehr genutzt wurde, war er weiterhin im Code
vorhanden. Es war nicht möglich, durch Tools zu erkennen, dass der Operator
überflüssig ist und aus der Code-Basis entfernt werden kann.
Auch konnte der Code nicht durch Tree Shaking entfernt werden. 

Pipeable Operators lösen diese Probleme. Ein pipeable Operator ist eine globale,
pure Funktion. Wird sie nicht verwendet, so können Entwicklungsumgebungen und
Build-Tools, wie zum Beispiel der TypeScript-Compiler, das feststellen und den Entwickler darauf hinweisen.
Und wird der Code nicht entfernt, so kann er während des Builds über Tree Shaking automatisch
entfernt werden.


## Implementierung eines Observables als Klasse

Als Beispiel implementieren wir wie in dem anderen [Blog-Post](/rx-js-verstehen-durch-implementieren-eines-observables)
die Klasse Observable.
Die Implementierung der Klasse `Observable` sieht folgendermaßen aus:

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }

  pipe(...operators) {
    return operators.reduce(
      (lastObservable, currentOperator) =>
        currentOperator(lastObservable), this
    );
  }
}
```

Beim Erzeugen eines Observables wird eine Funktion übergeben.
Diese Funktion erhält als Parameter den `observer`, das Objekt, welches die Werte erzeugt.
Diese Funktion wird als Parameter im Konstruktor übergeben und als Memberfunktion `subscribe()` gespeichert.
Um nun das Auslösen der Werte anzustoßen, muss `subscribe()` aufgerufen werden.

```javascript
const values$ = new Observable((next, complete) => {
  next(1);
  next(2);
  next(3);
  complete();
});

values$.subscribe(
  val => console.log(val), // Output: 1, 2, 3
  () => console.log('completed')
);
```

Die zweite Funktion ist die `pipe()`-Funktion.
Diese Funktion ruft man auf, um Operatoren anzuwenden.
Sie nimmt eine variable Anzahl von Parametern auf, wobei jeder Parameter ein
Operator-Funktionsaufruf ist. Die Operatoren werden der Reihe nach aufgerufen.
Das zurückgegebene Observable des vorherigen Operators wird an den nächsten Operator
übergeben. Das zuletzt zurückgegebene Observable erzeugt also die Werte, welche
alle Operatoren durchlaufen haben.

Hier ein Beispielaufruf mit zwei `map()`-Operatoren:

```javascript
values$.pipe(      // 1, 2, 3
  map(x => 2 * x), // 2, 4, 6
  map(x => x + 1)  // 3, 5, 7
).subscribe(
  val => console.log(val),
  () => console.log('completed')
);
```


## Hinzufügen des map()-Operators in der Klasse

Damit der obige Code funktioniert, wird im Folgenden der `map()`-Operator implementiert.
Die Funktion `map()` bekommt als Parameter die Funktion, die für jeden Wert aufgerufen wird
und jeden einzelnen Wert auf einen anderen abbildet. Im Beispiel werden die Werte zunächst
verdoppelt ( `map(x => 2 * x)` ) und anschließend wird zu jedem Wert 1 addiert ( `map(x => x + 1)` ).

Zurückgegeben wird wiederum eine Funktion, welche im `pipe()` der Observable-Klasse aufgerufen wird.
Diese erhält als Parameter ein Observable. Sie gibt ein neu erzeugtes Observable zurück,
welches auf das ursprüngliche Observable `subscribe()` aufruft und somit über `next()`
für jeden Wert den gemappten Wert zurückliefert.

```javascript
const map = mapFunc =>
  observable =>
    new Observable((next, complete) =>
      observable.subscribe(
        val => next(mapFunc(val)),
        () => complete()
      )
    );
```
