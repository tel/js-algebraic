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

/* eslint-disable no-shadow, camelcase */

import * as Natural from "../Natural";
import * as Array from "../Array";

// COVARIANT

export const map = {
  ap_of: (ap, of) => f => x => ap(of(f))(x),
  bind_of: (bind, of) => f => x => bind(v => of(f(v)))(x),
};

// APPLY

export const ap = {
  smashWith: smashWith => ff => fx => smashWith((f, x) => f(x))(ff)(fx),
  smash_map: (smash, map) => ff => fx => map(({fst, snd}) => fst(snd))(smash(ff, fx)),
  bind_map: (bind, map) => ff => fx => bind(f => map(x => f(x))(fx))(ff),
  bind_of: (bind, of) => ff => fx => bind(f => bind(x => of(f(x)))(fx))(ff),
};

export const smashWith = {
  ap_map: (ap, map) => f => (fa, fb) => ap(map(a => b => f(a, b))(fa))(fb),
  smash_map: (smash, map) => f => (fa, fb) => map(({fst, snd}) => f(fst, snd))(smash(fa, fb)),
  bind_map: (bind, map) => f => (fa, fb) => bind(a => map(b => f(a, b))(fb))(fa),
  bind_of: (bind, of) => f => (fa, fb) => bind(a => bind(b => of(f(a, b)))(fb))(fa),
};

export const smash = {
  smashWith: smashWith => smashWith((fst, snd) => ({fst, snd})),
  ap_map: (ap, map) => (fa, fb) => ap(map(fst => snd => ({fst, snd}))(fa))(fb),
};

// MONAD

export const bind = {
  kseq_of: (kseq, of) => k => kseq(of, k),
  collapse_map: (collapse, map) => k => x => collapse(map(k)(x)),
};

export const kseq = {
  bind: bind => (amb, bmc) => a => bind(bmc)(amb(a)),
  collapse_map: (collapse, map) => (amb, bmc) => a => collapse(map(bmc)(amb(a))),
};

export const seq = {
  bind: bind => (m1, m2) => bind(() => m2)(m1),
  kseq: kseq => (m1, m2) => kseq(() => m1, () => m2),
};

export const collapse = {
  bind: bind => bind(x => x),
};

// FOLDABLE

export const foldMap = {
  forEach: forEach =>
    ({ plus, zero }, inj) => x => {
      let res = zero();
      forEach(x, v => { res = plus(res, inj(v)); });
      return res;
    },
  toArray: toArray =>
    (monoid, inj) => x => Array.foldMap(monoid, inj)(toArray(x)),
  reduce: reduce =>
    ({ plus, zero }, inj) => reduce((m, v) => plus(m, inj(v)), zero()),
};

export const toArray = {
  forEach: forEach =>
    x => {
      let ary = [];
      forEach(x, v => ary.push(v) );
      return ary;
    },
  reduce: reduce =>
    x => {
      let ary = [];
      reduce((ignore, v) => ary.push(v), null)(x);
      return ary;
    },
  foldMap: foldMap => foldMap(Array, x => [x]),
};

export const reduce = {
  forEach: forEach => (r, z) => x => {
    let acc = z();
    forEach(x, a => acc = r(acc, a));
    return acc;
  },
  toArray: toArray => (r, z) => x => Array.reduce(r, z)(toArray(x)),
  foldMap: foldMap => (r, z) => foldMap({ // particularly slow (!)
    zero: () => x => x,
    plus: (f, g) => x => f(g(x)),
  }, a => x => r(x, a))(z()),
};

export const forEach = {
  reduce: reduce => (x, k) => reduce((acc, v) => k(v), null)(x),
  toArray: toArray => (x, k) => Array.forEach(toArray(x), k),
};

export const every = {
  toArray: toArray => p => x => Array.every(p)(toArray(x)),
};

export const some = {
  toArray: toArray => p => x => Array.some(p)(toArray(x)),
};

export const length = {
  foldMap: foldMap => foldMap(Natural, () => 1),
};

export const empty = {
  foldMap: foldMap => foldMap({
    plus: (a, b) => a && b,
    zero: () => true,
  }, () => false),
};
