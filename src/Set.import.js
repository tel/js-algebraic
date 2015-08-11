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

HashSet.Mk(X).t is a enumerable subset of some element type, X.t.

  signature SET {el, t} {
    type t : type
    type el : type

    foldMap : (Monoid {x}, el -> x) -> (t -> x)
    toArray : t -> [el]
    forEach : (t, el -> ()) -> ()
    of : el -> t
    ofArray : [el] -> t
    contains : t -> (el -> Boolean)
    cons : (el, t) -> t

    DECIDABLE
    (HASHABLE)
    POSET
    LEAST
    JOIN*
    MEET
    DISTRIBUTIVE
    DECIDABLE MONOID
  }

 */

import * as Defaults from "./Completions/Defaults";

import * as Array from "./Array";
import * as String from "./String";

const StringSet = OfHashable(String);

export
  {
  // FUNCTORS
    OfDecidable //: Decidable {el} -> SET {el, t}
  , OfHashable //: Hashable {el} -> SET {el, t}
  // , OfTotalOrder //: Total Order {el} -> SET {el, t}

  // PRE-INSTANTIATED
  , StringSet // OfHashable(String);
  };

function OfDecidable(elModule) {

  /*
  Sets made from elements with only decidable equality are merely arrays of
  the elements.
   */

  const X = Array;
  const XDec = X.OfDecidable(elModule);

  function cons(a, set) {
    if (XDec.contains(set)(a)) { return set; }
    else { return set.concat([a]); }
  }

  function leq(a, b) { return a.every(XDec.contains(b)); }
  function indistinguishable(a, b) { return leq(a, b) && leq(b, a); }
  function incomparable(a, b) { return !(leq(a, b) || leq(b, a)); }

  function bottom() { return []; }

  function join(a, b) {
    let out = [];
    a.forEach(x => XDec.contains(out)(x) ? null : out.push(x));
    b.forEach(x => XDec.contains(out)(x) ? null : out.push(x));
    return out;
  }

  function meet(a, b) {
    if (b.length < a.length) {
      return meet(b, a);
    } else {
      let out = [];
      a.forEach(x => XDec.contains(b)(x) ? out.push(x) : null);
      return out;
    }
  }

  return {
    of: X.of,
    cons,
    ofArray: x => x,
    toArray: x => x,
    contains: XDec.contains,
    foldMap: X.foldMap,
    forEach: X.forEach,
    every: X.every,
    some: X.some,
    length: X.length,
    empty: X.empty,
    eq: indistinguishable,
    leq, indistinguishable, incomparable,
    bottom,
    join,
    joinN: Array.reduceLeft(join, bottom()),
    meet,
    zero: bottom,
    isZero: X.isZero,
    plus: join,
    plusN: Array.reduceLeft(join, bottom()),
  };
}

function OfHashable(elModule) {

  /*
  Sets made from hashable elements are objects going from hash keys to "buckets"
  which are smaller, less efficient sets.
   */

  const Bucket = OfDecidable(elModule);

  function of(a) { return { [elModule.hash(a)]: Bucket.of(a) }; }
  function ofArray(ary) {
    let out = {};
    Array.forEach(ary, a => {
      const h = elModule.hash(a);
      const bucket = out[h];
      if (bucket) {
        out[h] = Bucket.add(a, bucket);
      } else {
        out[h] = Bucket.of(a);
      }
    });
    return out;
  }

  function cons(a, set) {
    if (contains(set)(a)) { /* TODO probably quite slow */
      return set;
    } else {
      let out = {};
      const ha = elModule.hash(a);
      Object.keys(set).forEach(k => {
        if (k === ha) {
          out[k] = Bucket.cons(a, set[k]);
        } else {
          out[k] = set[k];
        }
      });
      return out;
    }
  }

  function toArray(set) {
    let out = [];
    Object.keys(set).forEach(k => {
      set[k].forEach(a => out.push(a));
    });
    return out;
  }

  function contains(set) {
    return a => {
      const bucket = set[elModule.hash(a)];
      return !!bucket && Bucket.contains(bucket)(a);
    };
  }

  function foldMap(mon, inj) {
    return set => Array.foldMap(mon, inj)(toArray(set));
  }

  function forEach(set, f) { Array.forEach(toArray(set), f); }

  const every = Defaults.every.toArray(toArray);
  const some = Defaults.some.toArray(toArray);

  const length = Defaults.length.foldMap(foldMap);
  const empty = Defaults.empty.foldMap(foldMap);


  function eq(a, b) { return leq(a, b) && leq(b, a); }
  function leq(a, b) {
    return Object.keys(a).every(k => b[k] && Bucket.leq(a[k], b[k]));
  }
  function indistinguishable(a, b) { return leq(a, b) && leq(b, a); }
  function incomparable(a, b) { return !(leq(a, b) || leq(b, a)); }
  function bottom() { return {}; }

  function joinN(sets) {
    let out = {};
    Array.forEach(sets, set => {
      Object.keys(set).forEach(k => {
        const bucket = out[k] || Bucket.bottom();
        out[k] = Bucket.join(bucket, set[k]);
      });
    });
    return out;
  }
  function join(a, b) { return joinN([a, b]); }

  function isZero(a) {
    return Object.keys(a).length === 0;
  }

  function meet(a, b) {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (kb.length < ka.length) {
      return meet(b, a);
    } else {
      let out = {};
      Array.forEach(ka, k => {
        if (b[k] && !Bucket.isZero(b[k])) {
          out[k] = Bucket.meet(a[k], b[k]);
        }
      });
      return out;
    }
  }

  return {
    of,
    cons,
    ofArray,
    toArray,
    contains,
    foldMap,
    forEach,
    some,
    every,
    length,
    empty,
    eq,
    leq, indistinguishable, incomparable,
    bottom,
    join,
    joinN,
    meet,
    zero: bottom,
    isZero,
    plus: join,
    plusN: joinN,
  };
}
