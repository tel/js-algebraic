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

Dict.t X is a homogenous dictionary of values X at string keys.

 */

import * as String from "./String";
import * as Set from "./Set";

// API
///////

const KeySet = Set.OfHashable(String);

export
  {
  // type t : type -> type
  // alias k = String

  // MODULES
    KeySet // SET {k}

  // DICT (specific)
  , keys //: ∀ a . t a -> KeySet
  , singleton //: ∀ a . (k, a) -> t a
  , get //: ∀ a . k -> t a -> a?
  , update //: ∀ a . (k, a? -> a?) -> (t a -> t a)

  // COVARIANT
  , map //: ∀ a b . (a -> b) -> (t a -> t b)

  // FOLDABLE
  , foldMap //: ∀ a x . (Monoid {x}, (a, k) -> x) -> (t a -> x)
  , toArray //: ∀ a . t a -> [a]
  , forEach //: ∀ a . (t a, (a -> ()) -> ()
  , reduce //: ∀ a r . ((r, a, Natural) -> r, r) -> (t a -> r)

  // TRAVERSABLE
  /* TODO: , traverse //: ∀ a b f . (Applicative {f}, a -> f b) -> (t a -> f (t b)) */

  // FUNCTORS
  , OfDecidable //: Decidable {x}
    // Decidable {t x}

  , OfSemigroup //: Semigroup {x}
    // Decidable Monoid {t x}
  };

function singleton(k, v) { return {[k]: v}; }
function get(k, d) { return d[k]; }

function update(target, f) {
  return dict => {
    let out = {};
    let updated = false;
    forEach(dict, (v, k) => {
      if (k === target) {
        const newValue = f(v);
        if (newValue) {
          out[k] = newValue;
        }
      } else {
        out[k] = dict[k];
      }
    });

    if (!updated) {
      const newValue = f(null);
      if (newValue) {
        out[target] = newValue;
      }
    }

    return out;
  };
}

function forEach(d, f) {
  Object.keys(d).forEach(k => {
    f(d[k], k);
  });
}

function foldMap(monoid, f) {
  return d => {
    let out = monoid.zero();
    forEach(d, a => out = monoid.plus(out, f(a)));
    return out;
  };
}

function toArray(d) {
  let out = [];
  forEach(d, a => out.push(a));
  return out;
}

function reduce(plus, zero) {
  return foldMap({plus, zero: () => zero}, x => x);
}

function map(f) {
  return d => {
    let out = {};
    forEach(d, (v, k) => {
      out[k] = f(v, k);
    });
    return out;
  };
}

function keys(d) {
  return KeySet.ofArray(Object.keys(d));
}

function OfDecidable({ eq: argEq }) {
  function eq(a, b) {
    const allKeys = KeySet.union(keys(a), keys(b));
    return KeySet.every(k => {
      const va = get(k, a);
      const vb = get(k, b);
      return (!va && !vb) || (va && vb && argEq(va, vb));
    })(allKeys);
  }

  return { eq };
}

function OfSemigroup({ plus: argPlus }) {
  function zero() { return {}; }
  function isZero(d) { return KeySet.isZero(keys(d)); }

  function plus(d1, d2) {
    const allKeys = KeySet.plus(keys(d1), keys(d2));
    let out = {};
    KeySet.forEach(allKeys, k => {
      const v1 = get(k, d1);
      const v2 = get(k, d2);
      if (v1 && v2) { out[k] = argPlus(v1, v2); }
      else { out[k] = v1 || v2; }
    });
    return out;
  }

  function pairMap(f) {
    return d => {
      let out = {};
      forEach(d, (value0, key0) => {
        const { value, key } = f(value0, key0);
        const prior = out[key];
        out[key] = prior ? argPlus(prior, value) : value;
      });
      return out;
    };
  }

  function plusN(ds) { return ds.reduce(plus, zero()); }

  return {
    pairMap, // : ∀ a b
             // . ((a, k) -> { value: b, key: k })
             //-> (t a -> t b)
    zero,
    isZero,
    plus,
    plusN,
  };
}
