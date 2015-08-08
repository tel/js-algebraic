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

export function onPairs(xs, f) {
  xs.forEach(a => xs.forEach(b => f(a, b)));
}

export function onTriples(xs, f) {
  xs.forEach(a => xs.forEach(b => xs.forEach(c => f(a, b, c))));
}

export function testEq(test, eq) {
  return (a, b) => test.isTrue(eq(a, b), `${a} neq ${b}`);
}

export function testNeq(test, eq) {
  return (a, b) => test.isFalse(eq(a, b), `${a} eq ${b}`);
}

export function testLeq(test, leq) {
  return (a, b) => test.isTrue(leq(a, b), `${a} not-leq ${b}`);
}

export function testNotLeq(test, leq) {
  return (a, b) => test.isFalse(leq(a, b), `${a} leq ${b}`);
}

export function absorptionTest(test, M) {
  return (a, b) => {
    testEq(test, M.eq)(a, M.join(a, M.meet(a, b)));
    testEq(test, M.eq)(a, M.meet(a, M.join(a, b)));
  };
}

export function distributeTest(test, M) {
  return (a, b, c) => {
    testEq(test, M.eq)(
      M.join(a, M.meet(b, c)),
      M.meet(M.join(a, b), M.join(a, c))
    );
    testEq(test, M.eq)(
      M.meet(a, M.join(b, c)),
      M.join(M.meet(a, b), M.meet(a, c))
    );
  };
}
