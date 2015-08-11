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
import * as Array from "../Array";
import * as Stream from "../Stream";

import { uncons, singleton } from "../Stream";

test("stream / singleton", t => {
  const x = uncons(singleton(true));
  t.true(x, "unconses once");
  t.true(x.head, "has a head element");
  t.true(x.tail, "has a tail");
  const y = uncons(x.tail);
  t.false(y, "hasn't anything in the tail");
  t.end();
});

function all(t, vs) { vs.forEach(v => t.ok(v.ok, v.msg)); }

const StringStream = Mod.plus(Stream, Stream.OfDecidable(String));
const stringStreams = Array.map(Stream.ofArray)([
  [],
  ["foo"],
  ["foo", "bar"],
  ["foo", "bar", "baz"],
  ["foo", "bar", "baz", "quux"],
]);

test("stream / of strings / decidable monoid / satisfies", t => {
  all(t, VerifyMonoid.satisfies(StringStream));
  t.end();
});

test("stream / of strings / decidable monoid / verifies", t => {
  all(t, VerifyMonoid._verifyOperations(stringStreams, StringStream));
  all(t, VerifyMonoid.verifyDecisions(StringStream));
  t.end();
});

const IntStream = Mod.plus(Stream, Stream.OfDecidable(Integer));
const intStreams = Array.map(Stream.ofArray)([
  [],
  [1],
  [1, 2],
  [1, 2, 3],
  [1, 2, 3, 4],
]);

test("stream / of ints / decidable / satisfies", t => {
  all(t, VerifyDecidable.satisfies(IntStream));
  t.end();
});

test("stream / of ints / decidable / verifies", t => {
  all(t, VerifyDecidable._verifyOperations(intStreams, IntStream));
  t.end();
});

test("stream / of ints / decidable monoid / satisfies", t => {
  all(t, VerifyMonoid.satisfies(IntStream));
  t.end();
});

test("stream / of ints / decidable monoid / verifies", t => {
  all(t, VerifyMonoid._verifyOperations(intStreams, IntStream));
  all(t, VerifyMonoid.verifyDecisions(IntStream));
  t.end();
});

test("stream / covariant / satisfies", t => {
  all(t, VerifyCovariant.satisfies(IntStream));
  t.end();
});

test("stream / covariant / verifies (of ints)", t => {
  all(t, VerifyCovariant._verifyOperations(
    intStreams, x => x + 2, x => x * 2, IntStream
  ));
  all(t, VerifyCovariant._verifyOperations(
    intStreams, x => 2, x => x * 2, IntStream
  ));
  all(t, VerifyCovariant._verifyOperations(
    intStreams, x => x * 2, x => x * 2, IntStream
  ));
  t.end();
});

// test("stream / foldable / examples", t => {
//   t.skip("Foldable not yet implemented");
//   // t.equal(Stream.foldMap(Natural, x => 1)([0, 1, 2, 3, 4, 5, 6, 7, 9, 10]), 10);
//   // t.equal(Stream.foldMap({zero: () => null, plus: () => null}, x => null)([]), null);
//   t.end();
// });

test("stream / monad / satisfies", t => {
  all(t, VerifyMonad.satisfies(IntStream));
  t.end();
});

test("stream / monad / verifies (of ints)", t => {
  const ints = [1];
  all(t, VerifyMonad._verifyOperations(
    ints,
    [
      x => Stream.ofArray([x, x]),
      x => Stream.ofArray([x * 2]),
      x => Stream.ofArray([x + 1, x - 1]),
    ],
    IntStream
  ));
  t.end();
});
