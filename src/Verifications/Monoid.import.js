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

import { ok, mkSatisfyCheck, mkPointDecisionCheck } from "./helpers";
import * as VSemigroup from "./Semigroup";

//: Mod -> [V]
export const satisfies = mkSatisfyCheck("monoid");

//: [a] -> (Decidable a + Monoid a) -> [V]
export function _verifyOperations(exs, mod) {
  const { eq, plus, zero } = mod;
  const n = exs.length;
  let res = [];

  // SEMIGROUP LAWS
  res = res.concat(VSemigroup._verifyOperations(exs, mod));

  // LEFT ZERO { ∀ x . 0 + x = x }
  res.push(ok(exs.every(x => eq(plus(zero(), x), x)),
    `#zero is #plus's left zero (${n} examples)`));

  // RIGHT ZERO { ∀ x . x + 0 = x }
  res.push(ok(exs.every(x => eq(plus(x, zero()), x)),
    `#zero is #plus's right zero (${n} examples)`));

  return res;
}

//: Module -> [V]
export const verifyDecisions = mkPointDecisionCheck([
  ["isZero", "zero"],
]);
