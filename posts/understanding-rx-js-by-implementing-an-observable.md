---
title: "Understanding RxJS by Implementing an Observable"
description: "In this blog post an observable is implemented to explain the basic implementation of RxJS."
date: 2017-11-12
author: "Pascal Chorus"
category: RxJS
lang: en
---

## Introduction

RxJS is currently one of the most interesting JavaScript APIs.
Its popularity is still growing. One reason for that is that it plays well
with different frameworks. Angular integrates the use of RxJS for several tasks.

This blog post tries to give you an overview of the basic concept for creating observables
and using operators by doing an own implementation of it.

## What we want to build

For the implementation of the observable, I chose a very simple example.
We will build an observable that emits the numerical values 1, 2 and 3.
Afterwards, it completes so it does not emit any more values.

When calling the observable (which corresponds to calling `Observable.subscribe()` in RxJS)
one has to provide an observer.
An observer is an object that provides callback functions to the observable, namely
`next()` and `complete()`.
The observable can call these functions when a specific event takes place.
`next()` is called for every value that should be emitted.
`complete()` is called when the observable completed, i.e. no more value will be emitted.
This function is called only once.

There is another function that should be provided usually: `error()`.
As the name already says, this function is called when an error occurs.
To keep the example as simple as possible, I omit this function but keep in mind
to provide it for your production code.

After implementing the observable, we will implement the best known and probably most
often used operator: `map()`. 

`map()` behaves exactly like the function `Array.map()`.
`map()` takes a function as a parameter that describes the transformation for each value.
Our example `map()` function will double each value.

Finally, we will implement an asynchronous observable that emits a numerical value
every 500 milliseconds. This example introduces two new aspects:  
* This function is asynchronous.  
* This observable does not stop emitting values by itself.
We have to provide a mechanism to enable client code to stop the observable
from emitting values.

## Implementing an observable as a function

First of all, we implement the observable as a function.
An observable is a simple plain function that takes an observer as a parameter.
An observer is an object that is informed by the observable as soon as a new value is
emitted and when the observable completes.
So it observes the observable's data stream.
The observable informs the observer about a new value by simply calling the observer's
`next()` function.
If the observable completes, it calls the observer's `complete()` function.

The implementation looks like this:
```javascript
const observable = observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
};
```

So the observable function takes the observer as a parameter.
It calls the observer's `next()` function 3 times with values 1, 2 and 3 respectively.
Finally, it calls `complete()` to indicate that there are no more values to come.

Here is how you would use this observable:

```javascript
observable({
  next: val => console.log(val),
  complete: () => console.log('completed')
});
```

The function `observable()` is called and its parameter is the observer object
containing the two callback functions `next()` and `complete()`.
For testing purposes, these two functions just log the values or "complete" respectively.

This should lead to the following console output:
```
1
2
3
"completed"
```

## Adding the map operator

The first section explained how to define and use an observable.
Now we will talk about how we can manipulate the generated values by using operators.

As mentioned above we will implement one of the most important operators called `map()`.
It behaves exactly like the native JavaScript function `Array.map()`.
`map()` takes a function as a parameter that describes the transformation for each value.
The current value is passed to this function.
The function returns the mapped value.

In general, an operator is a function that takes an observable as argument and returns
a new observable.
Thanks to this architecture it is easily possible to chain operators.

Since an observable is a function that takes an observer as parameter an operator
is a function that returns a function that takes an observer as a parameter.

So the implementation of `map()` looks like this:

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

The operator can be used as follows:

```javascript
map(observable, x => 2 * x);
```

This leads to the following output:

```
2
4
6
"completed"
```

What is happening here?

When calling `map()` the `observable()` function is called.
An observer containing the functions `next()` and `complete()` is passed in
as a parameter.

The `next()` function delegates the call to the observer, but it does not
pass the original value, but the return value of the function passed to `map()`.

As described above it is easily possible to combine multiple operators.
The following example combines two `map()` functions.
As expected the inner map operator is applied before the outer one.
The first one doubles the values. The second one squares the doubled values.

```javascript
map(map(observable, x => 2 * x), x => x * x);
```

This leads to the following output:

```
4
16
36
"completed"
```

## Implementing an observable as a class

To this point we have implemented two fundamental things:
* Observable creation
* Operator usage

However, the above implementation has an essential drawback: poor readability.
Implementing observables and operators as functions leads to composing
them by nesting those function calls.

Allowing operators to be chained would be much better.
To afford that we implement the observable as a class.

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }
}
```

In the first implementation, the observable was a function.
When implementing the observable as a class this function is passed
as a parameter to the constructor and it is saved as member function named `subscribe()`.
To make the observable start emitting values `subscribe()` has to be called.

```javascript
const values$ = new Observable(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete(1);
});

values$.subscribe({
  next: val => console.log(val),
  complete: () => console.log('completed')
});
```

This implementation is nearly identical to the real implementation in RxJS.
The only difference is that we pass the observer object to the observable's constructor.
In the RxJS implementation the observer's functions `next()`, `error()` and `complete()`
are passed directly to the observable's constructor, like that:

```javascript
const values$ = new Observable((next, error, complete) => {
  next(1);
  next(2);
  next(3);
  complete(1);
});

values$.subscribe(
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
});
```

Now we reproduced RxJS' original implementation.

## Adding the map operator to the class

Next step: add the `map()` operator to the Observable class.

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

The implementation is identical to the "just function" implementation above.

```javascript
const values$ = new Observable((next, error, complete) => {
  next(1);
  next(2);
  next(3);
  complete(1);
});

values$
.map(x => 2 * x)
.subscribe({
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
});
```

Now, chaining operators is possible which leads to a much easier readability:

```javascript
// ...

values$
.map(x => 2 * x)
.map(x => x * x)
.subscribe({
  val => console.log(val),
  err => console.log(err),
  () => console.log('completed')
});
```

Again, this matches the implementation of `map()` in RxJS.

## Adding an asynchronous observable

After implementing the observable and its operator `map()` we will implement another
function that creates an observable that emits successive numerical values asynchronously
in a defined interval.
The interval is defined in milliseconds.
The implementation is realized using the native JavaScript function `setInterval()`.
Since the observable will emit values forever we need to implement a mechanism
to stop emitting values.
To do so the `subscribe()` method returns an object containing the method `unsubscribe()`.
Calling it stops the observable emitting values.
  
And this is the code:

```javascript
class Observable {
  constructor(observableFn) {
    this.subscribe = observableFn;
  }

  // ...

  // Interval as an example for an async observable.
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

Creating an interval observable and using it looks like that:

```javascript
const subscription =
  Observable.interval(500)
    .subscribe(val => console.log(val));

// ... To stop emission of values, call
subscription.unsubscribe();

```

You can find more examples on observables in my [GitHub repository](https://github.com/pchorus/rxjs-examples).
