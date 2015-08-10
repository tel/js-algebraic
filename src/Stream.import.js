/*

Copyright 2015 Reify Health

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


# Streams

Streams of values are potentially infinite sequences of values generated on
demand.

*/

import * as Array from "./Array";
import * as Natural from "./Natural";

// IMPLEMENTATION
//////////////////

/*

type t a = () -> x a
type x a = null | { head: a, tail: t a }

 */

//: ∀ a . (a, t a) -> t a
function cons(head, tail) { return () => ({head, tail}); }

//: ∀ a r . (r, (a, t a) -> r) -> (t a -> r)
export function scott(z, f) {
  return s => {
    const x = s();
    if (x) { return f(x.head, x.tail); }
    else { return z; }
  };
}

//: ∀ a r . (r, (a, () => r) -> r) -> (t a -> r)
export function church(z, f) {
  const go = scott(z, (v, n) => f(v, () => go(n)));
  return go;
}

//: ∀ a . t a -> (null | { head: a, tail: t a })
export const uncons = scott(null, (head, tail) => ({head, tail}));

//: ∀ a . t a
export function zero() { return () => null; }

//: ∀ a . a -> t a
export function repeat(a) { return cons(a, repeat(a)); }

//: ∀ a . Array a -> t a
export function cycle(as) {
  const l = Array.length(as);
  function go(i) { return cons(as[i], go(i + 1 % l)); }
  return go(0);
}

//: ∀ a . a -> t a
export function singleton(a) { return cons(a, zero()); }

//: ∀ a . Natural -> t a -> t a
export function take(n0, s0) {
  function go(n, s) {
    return () => scott(zero(), (v, next) => cons(v, go(n - 1, next)))(s);
  }
  return go(n0, s0);
}

//: ∀ a . Natural -> t a -> t a
export function drop(n0, s0) {
  return Natural.recur((s, n) => scott(zero(), (v, next) => next))(n0)(s0);
}

//: ∀ a b . (a -> b) -> (t a -> t b)
export function map(f) {
  const go = scott(zero(), (v, n) => cons(f(v), go(n)));
  return go;
}

//: ∀ a . (t a, t a) -> t a
export function interleave(s1, s2) {
  return scott(s2, (head, tail) => cons(head, interleave(s2, tail)));
}

export const fromArray = Array.reduceRight((acc, a) => cons(a, acc), zero());

export function toArrayN(n, s0) {
  let out = [];
  let s = s0;
  for (let i = 0; i <= n; i++) {
    const x = uncons(s);
    if (x) { out[i] = x.head; s = x.tail; }
    else { break; }
  }
  return out;
}
