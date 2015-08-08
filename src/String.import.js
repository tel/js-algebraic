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

import { eq } from "./Naive";

export
  {
  // type t : type

  // DECIDABLE
    eq //: (t, t) -> Boolean

  // HASHABLE
  , hash //: t -> Integer

  // DECIDABLE MONOID
  , plus //: (t, t) -> t
  , zero //: () -> t
  , isZero //: t -> Boolean
  , plusN //: [t] -> t

  // LEAST
  , zero as bottom //: () -> t

  // TOTAL ORDER
  , leq //: (t, t) -> Boolean
  , eq as indistinguishable //: (t, t) -> Boolean
  , incomparable //: (t, t) -> Boolean

  /*
  TODO: Lexicographic Total Order
  */
  };

function hash(s) {
  // Source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  let hsh = 0, i, chr, len;
  if (s.length === 0) { return hsh; }
  for (i = 0, len = s.length; i < len; i++) {
    chr = s.charCodeAt(i);
    hsh = ((hsh << 5) - hsh) + chr;
    hsh |= 0; // Convert to 32bit integer
  }
  return hsh;
}

function plus(a, b) { return a + b; }
function plusN(as) { return as.reduce(plus, ""); }
function zero() { return ""; }
function isZero(a) { return a === ""; }
function leq(a, b) { return a <= b; }
function incomparable(a, b) { return false; } // All are comparable when total
