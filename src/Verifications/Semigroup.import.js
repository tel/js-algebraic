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

import { ok, mkSatisfyCheck } from "./helpers";

//: Mod -> [V]
export const satisfies = mkSatisfyCheck("semigroup");

//: [a] -> (Decidable a + Semigroup a) -> [V]
export function _verifyOperations(exs, { eq, plus }) {
  const n = exs.length;
  let res = [];

  // ASSOCIATIVITY { ∀ x y z . x + (y + z) = (x + y) + z }
  res.push(ok(
    exs.every(ex1 =>
      exs.every(ex2 =>
        exs.every(ex3 =>
          eq(plus(ex1, plus(ex2, ex3)), plus(plus(ex1, ex2), ex3))
        ))),
    `plus satisfies assocativity (${n * n * n} examples)`));

  return res;
}
