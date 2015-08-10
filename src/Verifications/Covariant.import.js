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
export const satisfies = mkSatisfyCheck("covariant");

//: [t a] -> (a -> b) -> (b -> c)
//-> (Decidable (t c) + Covariant t) -> [V]
export function _verifyOperations(exs, f, g, mod) {
  const { eq, map } = mod;

  const id = x => x;
  const comp = x => g(f(x));

  let res = [];

  // { ∀ x . map(id)(x) = x }
  res.push(ok(exs.every(x => eq(map(id)(x), x)), "#map reflects identity"));

  // { ∀ x . map(g)(map(f)(x)) = map(x => g(f(x)))(x) }
  res.push(ok(exs.every(x => eq(map(g)(map(f)(x)), map(comp)(x))),
    "#map reflects composition"));

  return res;
}
