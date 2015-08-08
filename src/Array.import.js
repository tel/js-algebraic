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

Array.t X is a homogenous array of values X.

 */

// API
///////

export
  {
  // type t : type -> type
  // alias [a] = t a

  // ARRAY (specific)
    parallelForEach //: ∀ a . [t a] -> (([a], Natural) -> ()) -> ()
  , zipWith //: ∀ a b c . ((a, b) -> c) -> (t a, t b) -> t c
  , zip //: ∀ a b . (t a, t b) -> t {fst: a, snd: b}
  , uncons //: ∀ a . t a -> {head: a, tail: t a}?
  , cons //: ∀ a . (a, t a) -> t a
  , snoc //: ∀ a . (t a, a) -> t a

  // DECIDABLE MONOID
  , plus //: ∀ a . (t a, t a) -> t a
  , zero //: ∀ a . () -> t a
  , isZero //: ∀ a . t a -> Boolean
  , plusN //: ∀ a . [t a] -> t a

  // COVARIANT
  , map //: ∀ a b . (a -> b) -> (t a -> t b)

  // FOLDABLE
  , foldMap //: ∀ a x . (Monoid {x}, a -> x) -> (t a -> x)
  , toArray //: ∀ a . t a -> [a]
  , forEach //: ∀ a . (t a, a -> ()) -> ()
  , some //: ∀ a . (a -> Boolean) -> (t a -> Boolean)
  , every //: ∀ a . (a -> Boolean) -> (t a -> Boolean)
  , length //: ∀ a . t a -> Natural
  , empty //: ∀ a . t a -> Boolean
  , reduceLeft //: ∀ a r . ((r, a, Natural) -> r, r) -> (t a -> r)
  , reduceRight //: ∀ a r . ((r, a, Natural) -> r, r) -> (t a -> r)

  // TRAVERSABLE
  /* TODO , traverse //: ∀ a b f . (Applicative {f}, a -> f b) -> (t a -> f (t b)) */

  // APPLY, APPLICATIVE, BIND, MONAD
  , of //: ∀ a . a -> t a
  , smashWith //: ∀ a b c . ((a, b) -> c) -> ((t a, t b) -> t c)
  , smash //: ∀ a b . (t a, t b) -> t {fst: a, snd: b}
  , ap //: ∀ a b c . t (a -> b) -> (t a -> t b)
  , bind //: ∀ a b . (a -> t b) -> (t a -> t b)
  , seq //: ∀ a b . t a -> t b -> t b
  , kseq //: ∀ a b c . (a -> t b, b -> t c) -> (a -> t c)
  , plusN as collapse //: ∀ a . t (t a) -> t a
  , traverseArray //: ∀ a b . ((a, Natural) -> t b) -> ([a] -> t [b])
  , traverseDict //: ∀ a b . ((a, String) -> t b) -> (Dict a -> t (Dict b))

  // FUNCTORS
  , OfDecidable //: Decidable {x}
    // Decidable {t x}
    // contains : t x -> (x -> Boolean)

  /*
  TODO: Lexicographic order functor
   */
  };

// IMPLEMENTATION
//////////////////

import * as Defaults from "./Completions/Defaults";

function parallelForEach(arys, f) {
  const l = arys.reduce((min, ary) => min <= ary.length ? min : ary.length);
  function getI(ix, ary) { return ary[ix]; }
  for (let i = 0; i < l; i++) { f(arys.map(getI.bind(null, i)), i); }
}

function zipWith(f) {
  return (as, bs) => {
    let out = [];
    parallelForEach([as, bs], ([a, b], i) => {
      out[i] = f(a, b);
    });
    return out;
  };
}

function zip(as, bs) {
  return zipWith((fst, snd) => ({fst, snd}))(as, bs);
}

function cons(a, ary) { return [a].concat(ary); }
function snoc(ary, a) { return ary.concat([a]); }

function plus(a, b) { return a.concat(b); }
function zero() { return []; }
function isZero(a) { return a.length === 0; }
function plusN(ls) { return ls.reduce(plus, zero()); }
function map(f) { return a => a.map(f); }

function foldMap(monoid, f) {
  return as => as.reduce((m, a) => monoid.plus(m, f(a)), monoid.zero());
}
function toArray(a) { return a; }
function forEach(a, f) { return a.forEach(f); }
function reduceLeft(f, z) { return a => a.reduce(f, z); }
function reduceRight(f, z) { return a => a.reduceRight(f, z); }
function some(p) { return a => a.some(p); }
function every(p) { return a => a.every(p); }
function length(a) { return a.length; }
function empty(a) { return a.length === 0; }

function uncons(a) {
  if (isZero(a)) {
    return null;
  } else {
    const head = a[0];
    const tail = a.slice(1, a.length);
    return { head, tail };
  }
}

/* TODO
function traverse(applicative, inj) {
  return applicative.traverseArray(inj);
}
*/

function of(a) { return [a]; }

function smashWith(f) {
  return (as, bs) => {
    let out = [];
    as.forEach(a => bs.forEach(b => out.push(f(a, b))));
    return out;
  };
}

function smash(a, b) { return Defaults.smash.smashWith(smashWith)(a, b); }
function ap(fs) { return Defaults.ap.smashWith(smashWith)(fs); }

function bind(k) {
  return as => {
    let out = [];
    as.forEach(a => out = out.concat(k(a)));
    return out;
  };
}

//: ∀ a b . ((a, Natural) -> t b) -> ([a] -> t [b])
function traverseArray(f) {
  return ary => {
    ary.reduce(
      (tb, a, ix) => smashWith((bs, b) => bs.concat([b]))(tb, f(a, ix)),
      of([])
    );
  };
}
//: ∀ a b . ((a, String) -> t b) -> (Dict a -> t (Dict b))
function traverseDict(f) {
  return dict => {
    Object.keys(dict).reduce(
      (tb, a, k) => smashWith((bs, b) => bs[k] = b)(tb, f(a, k)),
      of({})
    );
  };
}

function seq(l1, l2) { return Defaults.seq.bind(bind)(l1, l2); }
function kseq(afb, bfc) { return Defaults.kseq.bind(bind)(afb, bfc); }

function OfDecidable(argModule) {
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

// EXTRAS
//////////

/**
 * @sig Hashable x -> (Join*, Meet, Least, Distributive) [x]
 */
function SetLike(argModule) { // eslint-disable-line

  function contains(as, it) { return as.some(a => argModule.eq(a, it)); }

  function bottom() { return []; }

  function join(a, b) {
    let m = {};
    a.forEach(v => {
      const h = argModule.hash(v);
      let bucket = m[h];
      if (!bucket) { m[h] = []; bucket = []; }
      m[h].unshift(v);
    });
    b.forEach(v => {
      const h = argModule.hash(v);
      let bucket = m[h];
      if (!bucket) { m[h] = []; bucket = []; }
      if (!contains(bucket, v)) { m[h].unshift(v); }
    });

    let out = [];
    Object.keys(m).forEach(k => out = out.concat(m[k]));
    return out;
  }

  function joinN(ss) {
    return ss.reduce(join, bottom());
  }

  function meet(as, bs) {
    const la = as.length;
    const lb = bs.length;
    let src, tgt;
    if (la <= lb) { src = as; tgt = bs; }
    else { src = bs; tgt = as; }

    let out = [];
    src.forEach(v => {
      if (contains(tgt, v)) { out.unshift(v); }
    });
    return out;
  }

  /** subset */
  function leq(as, bs) {
    return as.every(v => contains(bs, v));
  }

  function eq(as, bs) {
    return leq(as, bs) && leq(bs, as);
  }

  const JoinMonoid = {
    zero: bottom, plus: join,
  };

  const MeetSemigroup = {
    plus: meet,
  };

  return {
    eq,
    join, joinN, bottom,
    meet,
    leq,
    JoinMonoid,
    MeetSemigroup,
  };
}
