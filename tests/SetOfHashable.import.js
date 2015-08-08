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

import { describe } from "{reify:test-helpers}/index";
import { String, Set } from "algebraic";
import {
  onPairs, onTriples,
  absorptionTest, distributeTest,
  testEq, testLeq, testNotLeq
} from "./helpers";

const StringSet = Set.OfHashable(String);
const { eq, bottom, join, joinN, meet, leq, ofArray } = StringSet;

describe("Algebraic - Set.OfHashable {String}", () => {
  context("Decidable", () => {
    it("should have weaker equality than naive", test => {
      const eqExs = [
        ["foo", "bar", "baz"],
        ["foo", "baz", "bar"],
        ["bar", "foo", "baz"],
        ["bar", "baz", "foo"],
        ["baz", "foo", "bar"],
        ["baz", "bar", "foo"],
      ];
      onPairs(eqExs.map(ofArray), testEq(test, eq));
    });
  });
  context("Setlike (Join*, Meet, Least, Distributive) {Set.OfDecidable(String)}", () => {

    it("join should have bottom as zero", test => {
      const ex = ofArray(["foo", "bar", "baz"]);
      testEq(test, eq)(ex, join(bottom(), ex));
      testEq(test, eq)(ex, join(ex, bottom()));
    });

    it("should have joinN([]) as bottom", test => {
      testEq(test, eq)(joinN([]), bottom());
    });

    it("join should be idempotent", test => {
      const ex = ofArray(["foo", "bar", "baz"]);
      testEq(test, eq)(ex, join(ex, ex));
    });

    it("joinN should have bottom as zero", test => {
      const ex1 = ofArray(["bar", "baz"]);
      const ex2 = ofArray(["foo", "baz"]);
      const ex3 = ofArray(["foo", "bar"]);
      const res = joinN([ex1, ex2, ex3]);
      test.isTrue(eq(res, joinN([bottom(), ex1, ex2, ex3])));
      test.isTrue(eq(res, joinN([ex1, bottom(), ex2, ex3])));
      test.isTrue(eq(res, joinN([ex1, ex2, bottom(), ex3])));
      test.isTrue(eq(res, joinN([ex1, ex2, ex3, bottom()])));
    });

    it("meet should be idempotent", test => {
      const ex = ofArray(["foo", "bar", "baz"]);
      test.isTrue(eq(ex, meet(ex, ex)), `${meet(ex, ex)} == ${ex}`);
    });

    it("should have join and meet satisfy absorption", test => {
      const exs = [[], ["foo"], ["foo", "bar"], ["bar", "baz", "quux"]];
      onPairs(exs.map(ofArray), absorptionTest(test, StringSet));
    });

    it("should have join and meet satisfy distribution", test => {
      const exs = [[], ["foo"], ["foo", "bar"], ["bar", "baz", "quux"]];
      onTriples(exs.map(ofArray), distributeTest(test, StringSet));
    });

    it("leq tests", test => {
      const ex0 = ofArray([]);
      const ex1 = ofArray(["foo"]);
      const ex2 = ofArray(["foo", "bar"]);
      testLeq(test, leq)(ex0, ex2);
      testLeq(test, leq)(ex0, ex1);
      testLeq(test, leq)(ex1, ex1);
      testLeq(test, leq)(ex1, ex2);
      testLeq(test, leq)(ex2, ex2);
      testNotLeq(test, leq)(ex2, ex0);
      testNotLeq(test, leq)(ex2, ex1);
    });
  });
});
