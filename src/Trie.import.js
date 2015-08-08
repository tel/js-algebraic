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

const Std = OfBucket(Array);

export
  {
    OfBucket //: BUCKET {b} -> TRIE {b, t}
  , Std //: OfBucket(Array)
  };

/*
  signature BUCKET {b} {
    type b : type -> type

    DECIDABLE MONOID
    REFLECTS DECIDABILITY
  }

  signature TRIE {b, t} {
    type t : type -> type
    type b : type -> type

    alias seg = String
    alias path = [seg]

    getValues : ∀ a . t a -> b a
    getValuesIn : ∀ a . (path, t a) -> b a
    getChildren : ∀ a . t a -> Dict (t a)

    ofValues : ∀ a . b a -> t a
    ofChildren : ∀ a . Dict (t a) -> t a
    at : ∀ a . (path, a) -> t a

    hasValue : ∀ a . t a -> Boolean
    hasChildren : ∀ a . t a -> Boolean

    grow : ∀ a . (t a, seg) -> t a
    growN : ∀ a . (t a, path) -> t a

    update : ∀ a . (b a -> b a) -> (t a -> t a)
    updateIn : ∀ a . (path, b a -> b a) -> (t a -> t a)

    forEach : ∀ a . (t a, (a, path) -> ()) -> ()

    taggedArray : ∀ a . t a -> [{path: path, values: b a}]
    tagggedDict : ∀ a . t a -> Dict (b a)

    REFLECTS DECIDABILITY
    LEAST, JOIN*, MEET, DISTRIBUTIVE LATTICE
    DECIDABLE MONOID (from Join*)
    COVARIANT
    MONAD
    FOLDABLE
    TRAVERSABLE
  }
 */

function OfBucket(Bucket) {

  const DictMonoid = Dict.OfSemigroup({ plus });

  function getValues(a) { return a.values; }
  function getChildren(a) { return a.children; }

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

  function of(a) { return mk(Bucket.of(a), Dict.zero()); }
  function ofValues(buk) { return mk(buk, Dict.zero()); }
  function ofChildren(cs) { return mk(Bucket.zero(), cs); }

  function at(path, v) { return growN(path, of(v)); }

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

  function update(f) { return updateIn([], f); }

  function grow(t, seg) { return ofChildren({[seg]: t}); }
  function growN(t0, path) { return path.reduceRight(grow, t0); }

  function hasValue(t) { return !Bucket.isZero(getValues(t)); }
  function hasChildren(t) { return !Dict.isZero(getChildren(t)); }

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

  function map(f) {
    function go({ values, children}) {
      return mk(Bucket.map(f)(values), Dict.map(go)(children));
    }
    return go;
  }

  function zero() { return mk(Bucket.zero(), Dict.zero()); }

  function isZero(t) { return !hasValue(t) && !hasChildren(t); }

  function plus(t1, t2) {
    return mk(
      Bucket.plus(getValues(t1), getValues(t2)),
      DictMonoid.plus(getChildren(t1), getChildren(t1))
    );
  }

  function plusN(ts) { return ts.reduce(plus, zero()); }

  function forEach(t0, f) {
    function go(path, t) {
      Bucket.forEach(getValues(t), value => f(value, path));
      Dict.forEach(getChildren(t), (child, seg) => {
        go(path.concat([seg]), child);
      });
    }
    go([], t0);
  }

  function foldMap(monoid, mapper) {
    return t => {
      let acc = monoid.zero();
      forEach(t, ({path, values}) => {
        acc = monoid.plus(acc, mapper(values, path));
      });
      return acc;
    };
  }

  const toArray = foldMap(Array, Bucket.toArray);

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

  function taggedArray(trie) {
    let out = [];
    forEach(trie, (value, path) => out.unshift({value, path}));
    return out;
  }

  function taggedDict(trie) {
    let out = {};
    taggedArray(trie).forEach(({path, values}) => {
      out[path.join(".")] = values;
    });
    return out;
  }

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
  function smashWith(f) {
    return (ta, tb) => bind(a => map(b => f(a, b))(tb))(ta);
  }
  const smash = smashWith((fst, snd) => ({fst, snd}));
  function ap(fs) { return xs => smashWith(f => x => f(x))(fs, xs); }
  function seq(t1, t2) { return bind(() => t2)(t1); }
  function kseq(afb, bfc) { return a => bind(bfc, afb(a)); }
  const collapse = bind(x => x);

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


/* TODO: Implement these properly */
// /**
//  * @sig Object (Seg : Trie X) -> Trie X
//  */
// function ofMap(mp) {
//   return Object.keys(mp).reduce(
//     (tcd, k) => mergeRight(tcd, extend1(k)(mp[k])),
//     zero
//   );
// }
//
// /**
//  * @sig [Trie X] -> Trie X
//  */
// function ofArray(ary) {
//   return ary.reduce(
//     (tcd, v, ix) => mergeRight(tcd, extend1(ix)(v)),
//     zero
//   );
//
