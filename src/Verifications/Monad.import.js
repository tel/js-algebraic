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

import { eqOk, mkSatisfyCheck } from "./helpers";

//: Mod -> [V]
export const satisfies = mkSatisfyCheck("monad");

//: a -> [a -> t a, a -> t a, a -> t a] -> (Decidable (t a) + Monad t) -> [V]
export function _verifyOperations(exs, [f, g, h], { kseq, of, eq }) {
  let res = [];

  // LEFT ZERO { ∀ t x . kseq(of, f)(x) = f(x) }
  exs.forEach(x => {
    res.push(eqOk(eq, kseq(of, f)(x), f(x), `#kseq has #of as left zero (x = ${x})`));
    res.push(eqOk(eq, kseq(of, g)(x), g(x), `#kseq has #of as left zero (x = ${x})`));
    res.push(eqOk(eq, kseq(of, h)(x), h(x), `#kseq has #of as left zero (x = ${x})`));
  });

  // RIGHT ZERO { ∀ t x . kseq(f, of)(x) = f(x) }
  exs.forEach(x => {
    res.push(eqOk(eq, kseq(f, of)(x), f(x), `#kseq has #of as right zero (x = ${x})`));
    res.push(eqOk(eq, kseq(g, of)(x), g(x), `#kseq has #of as right zero (x = ${x})`));
    res.push(eqOk(eq, kseq(h, of)(x), h(x), `#kseq has #of as right zero (x = ${x})`));
  });

  // ASSOCIATIVITY { ∀ f g h x . kseq(f, kseq(g, h))(x) = kseq(kseq(f, g), h)(x) }
  exs.forEach(x => {
    res.push(eqOk(eq, kseq(f, kseq(g, h))(x), kseq(kseq(f, g), h)(x),
      "#kseq is associative (f, g, h)"));
    res.push(eqOk(eq, kseq(g, kseq(h, f))(x), kseq(kseq(g, h), f)(x),
      "#kseq is associative (g, h, f)"));
    res.push(eqOk(eq, kseq(h, kseq(f, g))(x), kseq(kseq(h, f), g)(x),
      "#kseq is associative (h, f, g)"));
  });

  return res;
}
