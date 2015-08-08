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

import { eq, leq, indistinguishable, incomparable } from "./Naive";

export
  {
  // type t : type

  // DECIDABLE
   eq //: (t, t) -> Boolean

  // HASHABLE
  , hash //: t -> Integer

  // TOTAL ORDER
  , leq
  , indistinguishable
  , incomparable

  // BOUNDED
  , bottom
  , top

  // DISTRIBUTIVE LATTICE*
  , join
  , meet
  , joinN
  , meetN

  // DECIDABLE RING
  , bottom as zero
  , top as one
  , isZero
  , isOne
  , negate
  , join as plus
  , meet as times
  , minus
  };

function hash(b) { return b ? 1 : 0; }

function bottom() { return false; }
function top() { return true; }

function join(a, b) { return a || b; }
function meet(a, b) { return a && b; }
function joinN(ts) { return ts.some(x => x); }
function meetN(ts) { return ts.every(x => x); }

function isZero(a) { return a === false; }
function isOne(a) { return a === true; }
function negate(a) { return !a; }
function minus(a, b) { return (a || !b); }
