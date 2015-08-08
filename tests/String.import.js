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
import { onPairs, testEq, testNeq } from "./helpers";
import { strings as examples } from "./examples";

import { String } from "algebraic";
const { eq, hash } = String;

describe("Algebraic - String", () => {
  context("Decidable {String}", () => {
    it("should equate equal things", test => {
      examples.forEach(ex => testEq(test, eq)(ex, ex));
    });
    it("should distinguish unequal things", test => {
      onPairs(examples, (ex1, ex2) => {
        if (ex1 !== ex2) { testNeq(test, eq)(ex1, ex2); }
      });
    });
  });
  context("Hashable {String}", () => {
    it("should be implied by equality", test => {
      onPairs(examples, (ex1, ex2) => {
        const h1 = hash(ex1);
        const h2 = hash(ex2);
        if (ex1 === ex2) {
          test.isTrue(h1 === h2, `Strings ${ex1} and ${ex2} have different hashes`);
        }
      });
    });
    it("hash inequality should imply value inequality", test => {
      onPairs(examples, (ex1, ex2) => {
        const h1 = hash(ex1);
        const h2 = hash(ex2);
        if (h1 !== h2) {
          test.isTrue(!eq(ex1, ex2), `Strings ${ex1} and ${ex2} have different hashes`);
        }
      });
    });
  });
});
