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
export const satisfies = mkSatisfyCheck("decidable");

//: [a] -> Decidable a -> [V]
export function _verifyOperations(exs, { eq }) {
  const n = exs.length;
  let res = [];

  // REFLEXIVITY { ∀ x . x = x }
  res.push(ok(
    exs.every(ex => eq(ex, ex)),
    `eq satisfies reflexivity (${n} examples)`));

  // SYMMETRY { ∀ x y . x = y ---> y = x }
  res.push(ok(
    exs.every(ex1 => exs.every(ex2 => eq(ex1, ex2) ? eq(ex2, ex1) : true)),
    `eq satisfies symmetry (${n * n} examples)`));

  // TRANSITIVITY { ∀ x y z . (x = y, y = z) ---> x = z }
  res.push(ok(
    exs.every(ex1 =>
      exs.every(ex2 =>
        exs.every(ex3 =>
          (eq(ex1, ex2) && eq(ex2, ex3)) ? eq(ex1, ex3) : true
        ))),
    `eq satisfies transitivity (${n * n * n} examples)`));

  return res;
}
