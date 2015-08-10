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


# Modules

Modules are first class dictionaries of functions over a given type.

 */

export
  {
      plus
    , plusN
    , zero
  };

import * as String from "./String";
import * as Array from "./Array";
import * as Set from "./Set";
import * as Dict from "./Dict";

function zero() { return {}; }

/** Right biased */
function plus(m1, m2) {
  let out = {};
  Object.keys(m1).forEach(k => { out[k] = m1[k]; });
  Object.keys(m2).forEach(k => { out[k] = m2[k]; });
  return out;
}

function plusN(ms) {
  return ms.reduce(plus, zero());
}

//: [String] -> t -> Boolean
export function has(names) {
  return m => Array.every(n => m[n])(names);
}

export const ops = (() => {
  const S = Set.OfDecidable(String);

  const decidable = ["eq"];
  const magma = ["plus"];
  const monoid = S.plus(magma, ["zero", "plusN"]);

  const covariant = ["map"];
  const apply = S.plus(covariant, ["ap", "smash", "smashWith"]);
  const applicative = S.plus(apply, ["of"]);

  const bind = S.plus(covariant, ["bind", "seq", "kseq", "collapse"]);

  const monad = S.plus(bind, applicative);

  return {
    decidable,
    magma, semigroup: magma, monoid,
    covariant, apply, applicative, bind, monad,
  };
})();

//: Dict (Mod -> Boolean)
export const satisfies = Dict.map(has)(ops);

//: Mod -> String -> () {Exception}
export function checkSatisfies(m, test) {
  if (!test(m)) {
    throw new Error(`Module ${m} does not satisfy all interfaces`);
  }
}
