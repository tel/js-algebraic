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

import * as VerifyMonoid from "../Verifications/Monoid";

import * as Mod from "../Mod";
import * as Array from "../Array";
import * as Integer from "../Integer";
import { Std as M } from "../Trie";

const { getValuesIn, of, extDict, extArray } = M;

test("trie / examples", t => {
  const map = {
    x: of(1),
    y: of(2),
  };
  const tmap = extDict(map);

  const ary = [ of(1), of(2) ];
  const tary = extArray(ary);

  t.deepEqual(getValuesIn(["x"], tmap), [1], "values in extended map at right path");
  t.deepEqual(getValuesIn(["1"], tary), [2], "values in extended array at right path");

  t.end();
});

function all(t, vs) { vs.forEach(v => t.ok(v.ok, v.msg)); }

const IntTrie = Mod.plus(M, M.OfDecidable(Integer));
const intTries = Array.map(M.ofValues)([
  [],
  ["foo"],
  ["foo", "bar"],
  ["foo", "bar", "baz"],
  ["foo", "bar", "baz", "quux"],
]);

test("trie / of ints / decidable monoid / satisfies", t => {
  all(t, VerifyMonoid.satisfies(IntTrie));
  t.end();
});

test("trie / of ints / decidable monoid / verifies", t => {
  all(t, VerifyMonoid._verifyOperations(intTries, IntTrie));
  all(t, VerifyMonoid.verifyDecisions(IntTrie));
  t.end();
});
