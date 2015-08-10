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

import * as Defaults from "./Completions/Defaults";

// IMPLEMENTATION
//////////////////

/*

type t a = () -> x a
type x a = null | { head: a, tail: t a }

 */

//: ∀ a . (a, t a) -> t a
export function cons(head, tail) { return () => ({head, tail}); }

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

export const ofArray = Array.reduceRight((acc, a) => cons(a, acc), zero());

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

//: ∀ a . (t a, t a) -> t a
export function plus(a, b) {
  const go = scott(b, (v, t) => cons(v, go(t)));
  return go(a);
}

//: ∀ a . [t a] -> t a
export function plusN(ss) { return ss.reduce(plus, zero()); }

//: ∀ a . t a -> Boolean
export const empty = scott(true, () => false);

//: ∀ a . t a -> Boolean
export const isZero = empty;

//: ∀ a . a -> t a
export const of = singleton;

export function bind(k) {
  const go = scott(zero(), (v, t) => plus(k(v), go(t)));
  return go;
}

export const seq = Defaults.seq.bind(bind);

export const kseq = Defaults.kseq.bind(bind);

export const collapse = Defaults.collapse.bind(bind);

export const ap = Defaults.ap.bind_map(bind, map);

export const smashWith = Defaults.smashWith.bind_map(bind, map);

export const smash = Defaults.smash.smashWith(smashWith);

//: (Decidable a, Natural = 1000) -> Decidable (Stream s)
// Decidability up to a certain length.
export function OfDecidable(argMod, n = 1000) {
  function eq(sa0, sb0) {
    let sa = sa0;
    let sb = sb0;
    // Search up to n elements looking for a discrepancy
    for (let i = 0; i <= n; i++) {
      const xa = uncons(sa);
      const xb = uncons(sb);
      if (!xa && !xb) { return true; }
      else if (!xa && xb) { return false; }
      else if (xa && !xb) { return false; }
      else {
        const { head: ha, tail: ta } = xa;
        const { head: hb, tail: tb } = xb;
        if (!argMod.eq(ha, hb)) { return false; }
        sa = ta;
        sb = tb;
      }
    }
  }

  return { eq };
}
