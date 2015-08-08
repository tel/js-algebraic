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

A value of Either E A is either a value of type E or of type A.

 */

// DEFAULTS
////////////

import * as Defaults from "./Completions/Defaults";

const ap = Defaults.ap.bind_map(bind, map);
const smashWith = Defaults.smashWith.bind_map(bind, map);
const smash = Defaults.smash.smashWith(smashWith);
const seq = Defaults.seq.bind(bind);
const kseq = Defaults.kseq.bind(bind);
const collapse = Defaults.collapse.bind(bind);

const toArray = Defaults.toArray.foldMap(foldMap);
const reduce = Defaults.reduce.forEach(forEach);
const length = Defaults.length.foldMap(foldMap);
const empty = Defaults.empty.foldMap(foldMap);

// API
///////

export
  {
  // type t : type -> type -> type
  // alias e + a = t e a
  // alias alg e a r = { Left: e -> r, Right: a -> r }

    matcher //: ∀ a e r . alg e a r -> (e + a -> r)
  , match //: ∀ a e r . (e + a, alg e a r) -> r
  , Left //: ∀ a e . e -> e + a
  , Right //: ∀ a e . a -> e + a
  , cata //: ∀ a e r . (e -> r, a -> r) -> (e + a -> r)
  , bimap //: ∀ a e a' e' . (e -> e', a -> a') -> (e + a -> e' + a')

  // MONAD
  , Right as of //: ∀ e a . a -> e + a
  , bind //: ∀ e a b . (a -> e + b) -> (e + a -> e + b)
  , ap //: ∀ e a b . e + (a -> b) -> (e + a -> e + b)
  , smashWith //: ∀ e a b c . ((a, b) -> c) -> (e + a, e + b) -> e + c
  , smash //: ∀ e a b . (e + a, e + b) -> e + { fst: a, snd: b }
  , seq //: ∀ e a b . (e + a, e + b) -> e + b
  , kseq //: ∀ e a b c . (a -> e + b, b -> e + c) -> (a -> e + c)
  , collapse //: ∀ e a . e + (e + a) -> e + a

  // FOLDABLE
  , foldMap
  , forEach
  , toArray
  , reduce
  , length
  , empty

  // REFLECTS DECIDABILITY
  , OfDecidable //: (Decidable e, Decidable a) -> Decidable (e + a)

  // FUNCTORS
  , Collect //: Monoid e
    // type t a = e + a
    // APPLICATIVE t

  };

// IMPLEMENTATION
//////////////////

function matcher({ Left: l, Right: r }) {
  return ({ variant, params }) => {
    switch (variant) {
      case "Left":
        return l(params.value);
      case "Right":
        return r(params.value);
    }
  };
}

function match(v, alg) { return matcher(alg)(v); }

function Left(value) {
  return { variant: "Left", params: { value } };
}

function Right(value) {
  return { variant: "Right", params: { value } };
}

function cata(f, g) { return matcher({ Left: f, Right: g }); }
function bimap(f, g) {
  return matcher({ Left: e => Left(f(e)), Right: a => Right(f(a)) });
}

function map(f) {
  return s => matcher({ Left: () => s, Right: a => Right(f(a)) })(s);
}

function bind(k) { return s => cata(() => s, k)(s); }
function foldMap({ zero }, inj) { return cata(() => zero(), inj); }
function forEach(v, f) { cata(() => {}, f)(v); }

function OfDecidable(lDec, rDec) {
  const lEq = lDec.eq;
  const rEq = rDec.eq;

  function eq(a, b) {
    return match(a, {
      Left: la => match(b, {
        Left: lb => lEq(la, lb),
        Right: () => false,
      }),
      Right: ra => match(b, {
        Left: () => false,
        Right: rb => rEq(ra, rb),
      }),
    });
  }

  return { eq };
}

/**
 * Collect is a specialization of the either type where the left argument has
 * been specialized to a monoidal type. Collect(M) is Applicative but not
 * Monad and adds the monoidal values together when smashing. Essentially, if
 * the left side of the Either is taken to be failure, Collect encapsulates the
 * collection of as many error messages as can be found.
 *
 * @method Collect
 * @param  {Monoid e} Monoid - A Monoid for the left side of the Either
 * @type {Applicative (e +)}
 */
function Collect({ plus: ePlus }) {
  /* eslint-disable no-shadow */

  function smashWith(f) {
    return (fa, fb) => {
      return match(fa, {
        Left: ea => match(fb, {
          Left: eb => ePlus(ea, eb),
          Right: b => Left(ea),
        }),
        Right: a => match(fb, {
          Left: eb => Left(eb),
          Right: b => Right(f(a, b)),
        }),
      });
    };
  }

  return {
    of: Right,
    smashWith,
    smash: Defaults.smash.smashWith(smashWith),
    ap: Defaults.ap.smashWith(smashWith),
  };
}
