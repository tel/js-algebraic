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

import
  { eq, hash
  , enumerate, sum, product
  , plus, zero, one, mult, plusN, multN, isZero, isOne
  , leq, incomparable
  } from "./Integer";

export
  {
  // type t : type

    sum //: [t] -> t
  , product //: [t] -> t
  , enumerate //: (t, t) -> t

  // DECIDABLE
  , eq //: (t, t) -> Boolean

  // HASHABLE
  , hash //: t -> Integer

  // DECIDABLE SEMIRING
  , plus //: (t, t) -> t
  , zero //: () -> t
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
