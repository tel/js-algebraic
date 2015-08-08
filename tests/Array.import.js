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

import { describe } from "./helpers";
import { String, Array } from "algebraic";

const { eq } = Array.OfDecidable(String);
const
  { zero, plus, plusN, isZero
  , map, of, smash, smashWith, bind, foldMap
  } = Array;

describe("Algebraic - Array", () => {
  context("Decidable {Array String}", () => {

    it("should equate equal arrays", test => {
      test.isTrue(eq([], []));
      test.isTrue(eq(["foo", "bar"], ["foo", "bar"]));
    });
    it("should distinguish unequal arrays", test => {
      test.isFalse(eq([], ["foo"]));
      test.isFalse(eq(["foo"], []));
      test.isFalse(eq(["foo", "bar"], ["foo"]));
      test.isFalse(eq(["foo"], ["foo", "bar"]));
      test.isFalse(eq(["foo", "bar"], ["bar", "foo"]));
    });
  });
  context("Decidable Monoid {Array String}", () => {
    it("should identify zero", test => test.isTrue(isZero(zero())));
    it("should distinguish zero", test => test.isFalse(isZero(["foo", "bar"])));
    it("should have zero as a zero", test => {
      test.isTrue(eq(plus(zero(), ["foo"]), ["foo"]));
      test.isTrue(eq(plus(zero(), []), []));
      test.isTrue(eq(plus(["foo"], zero()), ["foo"]));
      test.isTrue(eq(plus([], zero()), []));
    });
    it("should have an associative plus", test => {
      const ex1 = ["foo", "bar"];
      const ex2 = ["baz", "quux"];
      const ex3 = ["example", "example"];
      const result = ["foo", "bar", "baz", "quux", "example", "example"];
      test.isTrue(eq(plus(ex1, plus(ex2, ex3)), plus(plus(ex1, ex2), ex3)));
      test.isTrue(eq(result, plus(plus(ex1, ex2), ex3)));
      test.isTrue(eq(plus(ex1, plus(ex2, ex3)), result));
    });
    it("should have a functioning plusN", test => {
      const ex1 = ["foo", "bar"];
      const ex2 = ["baz", "quux"];
      const ex3 = ["example", "example"];
      const result = ["foo", "bar", "baz", "quux", "example", "example"];
      test.isTrue(eq(plusN([ex1, ex2, ex3]), result));
    });
  });
  context("Functor {Array}", () => {
    it("should work", test => {
      test.isTrue(eq(map(x => "foo")(["a", "b", "c"]), ["foo", "foo", "foo"]));
    });
    it("should reflect equality", test => {
      test.isTrue(eq(map(x => x)([]), []));
      test.isTrue(eq(map(x => x)(["foo", "bar"]), ["foo", "bar"]));
    });
  });
  context("Foldable {Array}", () => {
    it("should work", test => {
      const len = foldMap({ plus: (a, b) => a + b, zero: () => 0 }, x => 1);
      test.equal(len(["foo", "bar", "baz"]), 3);
    });
  });
  context("Traversable {Array}", () => {
    /* TODO: Need a non-trivial, trusted Applicative interface */
  });
  context("Applicative {Array}", () => {
    it("of is unit", test => test.isTrue(eq(of("foo"), ["foo"])));
    it("smashing with zero produces nothing", test => {
      test.isTrue(eq(zero(), smash(zero(), ["foo", "bar"])));
      test.isTrue(eq(zero(), smash(["foo", "bar"], zero())));
    });
    it("smashing produces all combinations", test => {
      const combos = smashWith((a, b) => a + b);
      const ex1 = ["foo", "bar"];
      const ex2 = ["baz", "quux"];
      const exp = ["foobaz", "fooquux", "barbaz", "barquux"];
      const res = combos(ex1, ex2);
      test.isTrue(eq(exp, res), `combos(${ex1}, ${ex2}) = ${res} != ${exp}`);
    });
  });
  context("Monad {Array}", () => {
    it("has bind(of) as an id", test => {
      const id = bind(of);
      test.isTrue(eq(id([]), []), `${id([])} != []`);
      test.isTrue(eq(id(["foo", "bar"]), ["foo", "bar"]),
        `${id(["foo", "bar"])} != ["foo", "bar"]`
      );
    });
  });
});
