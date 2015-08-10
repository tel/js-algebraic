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

# ARRAY

Array.t X is a homogenous array of values X.

  type t : type -> type
  alias [a] = t a

 */


import * as Defaults from "./Completions/Defaults";

//: ∀ a . [t a] -> (([a], Natural) -> ()) -> ()
export function parallelForEach(arys, f) {
  const l = arys.reduce((min, ary) => min <= ary.length ? min : ary.length);
  function getI(ix, ary) { return ary[ix]; }
  for (let i = 0; i < l; i++) { f(arys.map(getI.bind(null, i)), i); }
}

//: ∀ a b c . ((a, b) -> c) -> (t a, t b) -> t c
export function zipWith(f) {
  return (as, bs) => {
    let out = [];
    parallelForEach([as, bs], ([a, b], i) => {
      out[i] = f(a, b);
    });
    return out;
  };
}

//: ∀ a b . (t a, t b) -> t {fst: a, snd: b}
export function zip(as, bs) {
  return zipWith((fst, snd) => ({fst, snd}))(as, bs);
}

//: ∀ a . t a -> {head: a, tail: t a}?
export function uncons(a) {
  if (isZero(a)) {
    return null;
  } else {
    const head = a[0];
    const tail = a.slice(1, a.length);
    return { head, tail };
  }
}

//: ∀ a . (a, t a) -> t a
export function cons(a, ary) { return [a].concat(ary); }

//: ∀ a . (t a, a) -> t a
export function snoc(ary, a) { return ary.concat([a]); }

//: ∀ a . (t a, t a) -> t a
export function plus(a, b) { return a.concat(b); }

//: ∀ a . t a
export function zero() { return []; }

//: ∀ a . t a -> Boolean
export function isZero(a) { return a.length === 0; }

//: ∀ a . [t a] -> t a
export function plusN(ls) { return ls.reduce(plus, zero()); }

//: ∀ a b . (a -> b) -> (t a -> t b)
export function map(f) { return a => a.map(f); }

//: ∀ a x . (Monoid {x}, a -> x) -> (t a -> x)
export function foldMap(monoid, f) {
  return as => as.reduce((m, a) => monoid.plus(m, f(a)), monoid.zero());
}

//: ∀ a . t a -> [a]
export function toArray(a) { return a; }

//: ∀ a . (t a, a -> *) -> ()
export function forEach(a, f) { return a.forEach(f); }

//: ∀ a r . ((r, a, Natural) -> r, r) -> (t a -> r)
export function reduceLeft(f, z) { return a => a.reduce(f, z); }

//: ∀ a r . ((r, a, Natural) -> r, r) -> (t a -> r)
export function reduceRight(f, z) { return a => a.reduceRight(f, z); }

//: ∀ a . (a -> Boolean) -> (t a -> Boolean)
export function some(p) { return a => a.some(p); }

//: ∀ a . (a -> Boolean) -> (t a -> Boolean)
export function every(p) { return a => a.every(p); }

//: ∀ a . t a -> Natural
export function length(a) { return a.length; }

//: ∀ a . t a -> Boolean
export function empty(a) { return a.length === 0; }

/* TODO
function traverse(applicative, inj) {
  return applicative.traverseArray(inj);
}
*/

//: ∀ a . a -> t a
export function of(a) { return [a]; }

//: ∀ a b c . ((a, b) -> c) -> ((t a, t b) -> t c)
export function smashWith(f) {
  return (as, bs) => {
    let out = [];
    as.forEach(a => bs.forEach(b => out.push(f(a, b))));
    return out;
  };
}

//: ∀ a b . (t a, t b) -> t {fst: a, snd: b}
export const smash = Defaults.smash.smashWith(smashWith);

//: ∀ a b c . t (a -> b) -> (t a -> t b)
export const ap = Defaults.ap.smashWith(smashWith);

//: ∀ a b . (a -> t b) -> (t a -> t b)
export function bind(k) {
  return as => {
    let out = [];
    as.forEach(a => out = out.concat(k(a)));
    return out;
  };
}

//: ∀ a . t (t a) -> t a
export const collapse = plusN;

//: ∀ a b . ((a, Natural) -> t b) -> ([a] -> t [b])
export function traverseArray(f) {
  return ary => {
    ary.reduce(
      (tb, a, ix) => smashWith((bs, b) => bs.concat([b]))(tb, f(a, ix)),
      of([])
    );
  };
}

//: ∀ a b . ((a, String) -> t b) -> (Dict a -> t (Dict b))
export function traverseDict(f) {
  return dict => {
    Object.keys(dict).reduce(
      (tb, a, k) => smashWith((bs, b) => bs[k] = b)(tb, f(a, k)),
      of({})
    );
  };
}

//: ∀ a b . t a -> t b -> t b
export const seq = Defaults.seq.bind(bind);

//: ∀ a b c . (a -> t b, b -> t c) -> (a -> t c)
export const kseq = Defaults.kseq.bind(bind);

//: Decidable x -> { contains, Decidable (t x) }
export function OfDecidable(argModule) {
  // Mod.checkSatisfies(argModule, Mod.satisfies.decidable);

  function eq(as, bs) {
    if (as === bs) { return true; }
    else if (as.length !== bs.length ) { return false; }
    else {
      let ok = true;
      parallelForEach([as, bs], ([a, b]) => {
        if (!argModule.eq(a, b)) { ok = false; }
      });
      return ok;
    }
  }

  function contains(t) { return e => t.some(x => argModule.eq(e, x)); }

  return { eq, contains };
}
