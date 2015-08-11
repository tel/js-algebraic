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

 */

/*

# Interface

Trie X is a trie containing X along various paths. A trie may be empty or may
store any number of values at a "path" a sequence of `Segment`s. Segments are
abstract so long as they are acceptable Javascript object keys.

 */

import * as Array from "./Array";
import * as Dict from "./Dict";

export const Std = OfBucket(Array);

//: BUCKET b -> TRIE {b, t}
export function OfBucket(Bucket) {

  // type t : type -> type
  // type b : type -> type

  // alias seg = String
  // alias path = [seg]

  const DictMonoid = Dict.OfSemigroup({ plus });

  //: ∀ a . t a -> b a
  function getValues(a) { return a.values; }

  //: ∀ a . t a -> Dict (t a)
  function getChildren(a) { return a.children; }

  //: ∀ a . (path, t a) -> b a
  function getValuesIn(path, trie) {
    let ptr = trie;
    for (let i in path) { // use a for-loop so we can [break]
      if (ptr) { ptr = Dict.get(path[i], getChildren(ptr)); }
      else { break; }
    }
    return ptr ? getValues(ptr) : Bucket.zero();
  }

  //: (b a, Dict (t a)) -> t a
  function mk(values, children) { return { values, children }; }

  //: t a -> { values: b a, children: t a }
  function open(trie) { return trie; }

  //: ∀ a . a -> t a
  function of(a) { return mk(Bucket.of(a), Dict.zero()); }

  //: ∀ a . b a -> t a
  function ofValues(buk) { return mk(buk, Dict.zero()); }

  //: ∀ a . Dict (t a) -> t a
  function ofChildren(cs) { return mk(Bucket.zero(), cs); }

  //: ∀ a . (path, a) -> t a
  function at(path, v) { return growN(path, of(v)); }

  //: ∀ a . t a -> Boolean
  function isZero(t) { return !hasValue(t) && ! hasChildren(t); }

  //: ∀ a . (path, b a -> b a) -> (t a -> t a)
  function updateIn(path0, f) {
    function go(path) {
      return t => {
        if (t) {
          const top = Array.uncons(path);
          if (top) {
            const { head, tail } = top;
            mk(
              getValues(t),
              Dict.update(head, go(tail))(getChildren(t))
            );
          } else {
            return mk(f(getValues(t)), getChildren(t));
          }
        } else {
          return null;
        }
      };
    }
    return go(path0);
  }

  //: ∀ a . (b a -> b a) -> (t a -> t a)
  function update(f) { return updateIn([], f); }

  //: ∀ a . (t a, seg) -> t a
  function grow(t, seg) { return ofChildren({[seg]: t}); }

  //: ∀ a . (t a, path) -> t a
  function growN(t0, path) { return path.reduceRight(grow, t0); }

  //: ∀ a . t a -> Boolean
  function hasValue(t) { return !Bucket.isZero(getValues(t)); }

  //: ∀ a . t a -> Boolean
  function hasChildren(t) { return !Dict.isZero(getChildren(t)); }

  //: ∀ a . Decidable a -> Decidable {t a}
  function OfDecidable(elDecidable) {
    const { eq: bukEq } = Bucket.OfDecidable(elDecidable);
    const { eq: childrenEq } = Dict.OfDecidable({ eq });

    function eq(a, b) {
      return (
           bukEq(getValues(a), getValues(b))
        && childrenEq(getChildren(a), getChildren(b))
      );
    }

    return { eq };
  }

  //: ∀ a b . (a -> b) -> (t a -> t b)
  function map(f) {
    function go({ values, children}) {
      return mk(Bucket.map(f)(values), Dict.map(go)(children));
    }
    return go;
  }

  //: ∀ a . t a
  function zero() { return mk(Bucket.zero(), Dict.zero()); }

  //: ∀ a . t a -> Boolean
  function isZero(t) { return !hasValue(t) && !hasChildren(t); }

  //: ∀ a . (t a, t a) -> t a
  function plus(t1, t2) {
    return mk(
      Bucket.plus(getValues(t1), getValues(t2)),
      DictMonoid.plus(getChildren(t1), getChildren(t2))
    );
  }

  //: ∀ a . [t a] -> t a
  function plusN(ts) { return ts.reduce(plus, zero()); }

  //: ∀ a . (t a, (a, path) -> ()) -> ()
  function forEach(t0, f) {
    function go(path, t) {
      Bucket.forEach(getValues(t), value => f(value, path));
      Dict.forEach(getChildren(t), (child, seg) => {
        go(path.concat([seg]), child);
      });
    }
    go([], t0);
  }

  //: ∀ a r . (Monoid r, a -> r) -> (t a -> r)
  function foldMap(monoid, mapper) {
    return t => {
      let acc = monoid.zero();
      forEach(t, ({path, values}) => {
        acc = monoid.plus(acc, mapper(values, path));
      });
      return acc;
    };
  }

  //: ∀ a . t a -> [a]
  const toArray = foldMap(Array, Bucket.toArray);

  //: ∀ a r . ((r, a) -> r, r) -> (t a -> r)
  function reduce(f, r0) {
    return trie => {
      let out = r0;
      forEach(trie, es => {
        Bucket.forEach(es, e => {
          out = f(out, e);
        });
      });
      return out;
    };
  }

  //: ∀ a . t a -> [{value: a, path: path}]
  function taggedArray(trie) {
    let out = [];
    forEach(trie, (value, path) => out.unshift({value, path}));
    return out;
  }

  //: ∀ a . t a -> Dict (b a)
  function taggedDict(trie) {
    let out = {};
    taggedArray(trie).forEach(({path, values}) => {
      out[path.join(".")] = values;
    });
    return out;
  }

  //: ∀ a b . (a -> t b) -> (t a -> t b)
  function bind(k) {
    function go(t) {
      // descriptive variable names are a good thing, right? -tel
      const { values, children } = open(t);
      const bouquet = Bucket.map(k)(values);
      const rose = ofChildren(Dict.map(go)(children));
      const arrangement = Bucket.cons(rose, bouquet);
      return Bucket.joinN(arrangement);
    }
    return go;
  }

  /* TODO these cannot be fast enough can they? -tel */
  //: ∀ a . ((a, b) -> c) -> ((t a, t b) -> t c)
  function smashWith(f) {
    return (ta, tb) => bind(a => map(b => f(a, b))(tb))(ta);
  }

  //: ∀ a b . (t a, t b) -> t { fst: a, snd: b }
  const smash = smashWith((fst, snd) => ({fst, snd}));

  //: ∀ a b . t (a -> b) -> (t a -> t b)
  function ap(fs) { return xs => smashWith(f => x => f(x))(fs, xs); }

  //: ∀ a b . (t a, t b) -> t b
  function seq(t1, t2) { return bind(() => t2)(t1); }

  //: ∀ a b c . (a -> t b, b -> t c) -> (a -> t c)
  function kseq(afb, bfc) { return a => bind(bfc, afb(a)); }

  //: ∀ a . t (t a) -> t a
  const collapse = bind(x => x);

  //: ∀ a . [t a] -> t a
  // A bit like #plus, but all paths get extended by the array index
  const extArray = Array.reduceLeft((tcd, v, ix) => plus(tcd, grow(v, ix)), zero());

  //: ∀ a . Dict (t a) -> t a
  const extDict = Dict.reduce((tcd, v, k) => plus(tcd, grow(v, k)), zero());

  return {
    getValues,
    getValuesIn,
    getChildren,
    ofValues,
    ofChildren,
    hasValue,
    hasChildren,
    updateIn,
    update,
    at,

    extArray,
    extDict,

    grow,
    growN,

    taggedArray,
    taggedDict,

    OfDecidable,

    bottom: zero,
    join: plus,
    joinN: plusN,
    /* TODO meet, */

    plus,
    plusN,
    zero,
    isZero,

    map,

    ap,
    smash,
    smashWith,
    of,
    bind,
    seq,
    kseq,
    collapse,

    foldMap,
    forEach,
    toArray,
    reduce,

    /* TODO traverse, */
  };

}
