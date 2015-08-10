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

import * as Mod from "../Mod";

// type V = { ok: Boolean, msg: String }

//: (*, String) -> V
export function ok(o, msg) {
  return { ok: !!o, msg };
}

export function eqOk(eq, a, b, msg) {
  if (eq(a, b)) { return { ok: true, msg }; }
  else { return { ok: false, msg: msg + ` (a = ${a}, b = ${b})` }; }
}

//: Module -> [V]
export function mkSatisfyCheck(iface) {
  return m => [
    ok(
      Mod.satisfies[iface](m),
      `module implements all ${iface} interface names`
    ),
  ];
}

//: [[String, String]] -> Module -> [V]
export function mkPointDecisionCheck(points) {
  return m => points.map(
    ([check, name]) => ok(m[check](m[name]()), `Module decides point ${name}`)
  );
}
