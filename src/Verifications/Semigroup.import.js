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

import { eqOk, ok, mkSatisfyCheck } from "./helpers";

//: Mod -> [V]
export const satisfies = mkSatisfyCheck("semigroup");

//: [a] -> (Decidable a + Semigroup a) -> [V]
export function _verifyOperations(exs, { eq, plus }) {
  const n = exs.length;
  let res = [];

  // ASSOCIATIVITY { ∀ x y z . x + (y + z) = (x + y) + z }
  exs.forEach(x => exs.forEach(y => exs.forEach(z =>
    res.push(eqOk(eq, plus(x, plus(y, z)), plus(plus(x, y), z),
      `plus satisfies assocativity (${n * n * n} examples)`)))));

  return res;
}
