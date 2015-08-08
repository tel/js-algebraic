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

import { eq, leq } from "./Naive";
import * as String from "./String";

export
  {
  // type t : type

    plusN as sum //: [t] -> t
  , multN as product //: [t] -> t

  // DECIDABLE
  , eq //: (t, t) -> Boolean

  // HASHABLE
  , hash //: t -> Integer

  // DECIDABLE RING
  , plus //: (t, t) -> t
  , zero //: () -> t
  , negate //: t -> t
  , minus //: (t, t) -> t
  , mult //: (t, t) -> t
  , one //: () -> t
  , isZero //: t -> Boolean
  , isOne //: t -> Boolean
  , plusN //: [t] -> t
  , multN //: [t] -> t

  // TOTAL ORDER
  , leq //: (t, t) -> Boolean
  , eq as indistinguishable //: (t, t) -> Boolean
  , incomparable //: (t, t) -> Boolean
  };

function hash(i) { return String.hash(String(i)); }

function plus(a, b) { return a + b; }
function plusN(as) { return as.reduce(plus, 0); }
function mult(a, b) { return a * b; }
function multN(as) { return as.reduce(mult, 1); }
function zero() { return 0; }
function isZero(a) { return a === 0; }
function one() { return 1; }
function isOne(a) { return a === 1; }
function negate(a) { return -a; }
function minus(a, b) { return a - b; }
function incomparable(a, b) { return false; } // All are comparable when total
