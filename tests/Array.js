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

import test from "tape";

import * as VerifyDecidable from "../Verifications/Decidable";
import * as VerifyMonoid from "../Verifications/Monoid";
import * as VerifyCovariant from "../Verifications/Covariant";
import * as VerifyMonad from "../Verifications/Monad";

import * as Mod from "../Mod";
import * as String from "../String";
import * as Integer from "../Integer";
import * as Natural from "../Natural";
import * as Array from "../Array";

function all(t, vs) { vs.forEach(v => t.ok(v.ok, v.msg)); }

const StringArray = Mod.plus(Array, Array.OfDecidable(String));
const stringArrays = [
  [],
  ["foo"],
  ["foo", "bar"],
  ["foo", "bar", "baz"],
  ["foo", "bar", "baz", "quux"],
];

test("array / of strings / decidable / satisfies", t => {
  all(t, VerifyDecidable.satisfies(StringArray));
  t.end();
});

test("array / of strings / decidable / verifies", t => {
  all(t, VerifyDecidable._verifyOperations(stringArrays, StringArray));
  t.end();
});

test("array / of strings / decidable / examples", t => {
  const eq = StringArray.eq;
  t.ok(eq([], []), "empty equals empty");
  t.notOk(eq([], ["foo"]), "empty does not equal not empty");
  t.end();
});

test("array / of strings / decidable monoid / satisfies", t => {
  all(t, VerifyMonoid.satisfies(StringArray));
  t.end();
});

test("array / of strings / decidable monoid / verifies", t => {
  all(t, VerifyMonoid._verifyOperations(stringArrays, StringArray));
  all(t, VerifyMonoid.verifyDecisions(StringArray));
  t.end();
});


const IntArray = Mod.plus(Array, Array.OfDecidable(Integer));
const intArrays = [
  [],
  [1],
  [1, 2],
  [1, 2, 3],
  [1, 2, 3, 4],
];

test("array / of ints / decidable / satisfies", t => {
  all(t, VerifyDecidable.satisfies(IntArray));
  t.end();
});

test("array / of ints / decidable / verifies", t => {
  all(t, VerifyDecidable._verifyOperations(intArrays, IntArray));
  t.end();
});

test("array / of ints / decidable monoid / satisfies", t => {
  all(t, VerifyMonoid.satisfies(IntArray));
  t.end();
});

test("array / of ints / decidable monoid / verifies", t => {
  all(t, VerifyMonoid._verifyOperations(intArrays, IntArray));
  all(t, VerifyMonoid.verifyDecisions(IntArray));
  t.end();
});

test("array / covariant / satisfies", t => {
  all(t, VerifyCovariant.satisfies(IntArray));
  t.end();
});

test("array / covariant / verifies (of ints)", t => {
  all(t, VerifyCovariant._verifyOperations(
    intArrays, x => x + 2, x => x * 2, IntArray
  ));
  all(t, VerifyCovariant._verifyOperations(
    intArrays, x => 2, x => x * 2, IntArray
  ));
  all(t, VerifyCovariant._verifyOperations(
    intArrays, x => x * 2, x => x * 2, IntArray
  ));
  t.end();
});

test("array / foldable / examples", t => {
  t.equal(Array.foldMap(Natural, x => 1)([0, 1, 2, 3, 4, 5, 6, 7, 9, 10]), 10);
  t.equal(Array.foldMap({zero: () => null, plus: () => null}, x => null)([]), null);
  intArrays.forEach(ary => t.equal(Array.toArray(ary), ary));
  t.end();
});

test("array / monad / satisfies", t => {
  all(t, VerifyMonad.satisfies(IntArray));
  t.end();
});

test("array / monad / verifies (of ints)", t => {
  const ints = [1, 2, 3, 4, 5];
  all(t, VerifyMonad._verifyOperations(
    ints, [x => [x, x], x => [x * 2], x => [x + 1, x - 1]], IntArray
  ));
  t.end();
});
