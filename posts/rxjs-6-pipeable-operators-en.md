---
title: "Implementing an Observable with Pipeable Operators in RxJS"
description: "This post explains RxJS' pipeable operators."
date: 2019-07-20
author: "Pascal Chorus"
category: RxJS
lang: en
---

In [Understanding RxJS by Implementing an Observable](/understanding-rx-js-by-implementing-an-observable)
we implemented an observable and the `map()` operator to explain how RxJS works.
The implementation was based on RxJS 5.
Since RxJS 5.5 the preferable way to apply operators is to use the pipeable operators.
And since RxJS 6 there is no other option than using the pipeable ones.

This post explains why the operators' implementation was changed.
We will implement a pipeable `map()` operator to show how it works. 

To get a full understanding of RxJS' evolution from version 5 to 6 you may want
to read [Understanding RxJS by Implementing an Observable](/understanding-rx-js-by-implementing-an-observable) first.

You can check the whole example at [StackBlitz](https://stackblitz.com/edit/rxjs-implementation).

## Why Pipeable Operators?

Before RxJS 5.5 operators were methods of the class `Observable`.
So when you wanted to use an operator, it was added as a method to the
`Observable`'s prototype.
Unfortunately, this method is not tree shakeable since it is a fixed part
of the class. Even if the operator is not used in client code, it is still
kept in the code bundle.
Tools cannot identify that it is not used and that it can be removed.

These problems are resolved by pipeable operators.
A pipeable operator is a global, pure function.
If it is not used, both development environments and build tools, e.g. the
TypeScript compiler can notice that and can suggest the user to remove it.
If the user does not remove it, it can be removed during the build by tree shaking. 


## Implementing an Observable as a Class

We implement the class `Observable` like in the other [blog post](/understanding-rx-js-by-implementing-an-observable).
This is the implementation of the class `Observable`:
 
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

A function is passed to the `Observable`'s constructor.
This function gets the `observer` as a parameter, which is the object that emits the values.
The function is saved as member function `subscribe()`.
To start emitting values, you have to call the method `subscribe()`.

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

The second function is called `pipe()`.
This function is called to call operators on your observable.
It takes a variable number of parameters, where each parameter is an operator function call.
Operators are called one after the other.
The returned observable of an operator is passed to the next operator in the chain.
So the last operator returns the observable that emits values that have passed all
operators.

Here is an example with two `map()` operators:

```javascript
values$.pipe(      // 1, 2, 3
  map(x => 2 * x), // 2, 4, 6
  map(x => x + 1)  // 3, 5, 7
).subscribe(
  val => console.log(val),
  () => console.log('completed')
);
```


## Adding the map() operator to the class

Now we have to implement the `map()` operator to make the above code work.
The `map()` function takes one parameter that contains the function that is applied
to each value in the observable's stream. The function maps each value to another one.
In the example the values are doubled first ( `map(x => 2 * x)` ).
Afterwards, 1 is added ( `map(x => x + 1)` ).

The `map()` function returns another function which is called in the observable's `pipe()` function.
It takes an observable as a parameter and returns a new observable that calls `subscribe()` on the
previous observable. Thus, it returns the mapped value on each `next()` call.  

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
