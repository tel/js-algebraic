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

import * as Array from "./Array";

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

//: Dict (Mod -> Boolean)
export const satisfies = {
  magma: has(["plus"]),
  semigroup: has(["plus"]),
  monoid: has(["plus", "zero", "plusN"]),
};

//: Mod -> String -> () {Exception}
export function checkSatisfies(m, interfaceName) {
  const test = satisfies(interfaceName);
  if (!test) { throw new Error(`No known interface named ${interfaceName}.`); }
  else {
    if (!test(m)) {
      throw new Error(
        `Module ${m} does not satisfy interface ${interfaceName}`
      );
    }
  }
}

//: Dict (Mod -> [String + Stringg])
export const verifies = { };
