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

/*

Foldable (t : type -> type) : sig
---------------------------------

AT LEAST ONE OF:
toArray : ∀ a . t a -> [a]
foldMap : ∀ a r . (Monoid r, a -> r) -> (t a -> r)
forEach : ∀ a . (a -> *) -> (t a -> ())
reduce : ∀ a r . ((r, a) -> r, r) -> (t a -> r)

PROVIDES:
every : ∀ a . (a -> Boolean) -> (t a -> Boolean)
some : ∀ a . (a -> Boolean) -> (t a -> Boolean)
length : ∀ a . t a -> Natural
empty : ∀ a . t a -> Boolean

 */

import * as Default from "./Defaults";

function hasOneOf(m, names) {
  if (!names.some(n => m[n])) {
    throw new Error(`Cannot complete Foldable without one of ${names}!`);
  }
}

function defineFrom(src, target) {
  return (name, defs) => {
    if (!target[name]) {
      defs.some(({ needs, mk }) => {
        if (needs.every(n => src[n] || target[n])) {
          target[name] = src[name] || mk.apply(null, needs.map(n => src[n] || target[n]));
          return true;
        } else {
          throw new Error(`Cannot complete Foldable(${name}) without all of ${needs}!`);
        }
      });
    }
  };
}

export function complete(mod) {
  hasOneOf(mod, ["toArray", "foldMap", "forEach", "reduce"]);

  let out = {};
  const define = defineFrom(mod, out);

  define("foldMap", [
    { needs: ["forEach"], mk: Default.foldMap.forEach },
    { needs: ["toArray"], mk: Default.foldMap.toArray },
    { needs: ["reduce"], mk: Default.foldMap.reduce },
  ]);

  define("toArray", [
    { needs: ["forEach"], mk: Default.toArray.forEach },
    { needs: ["reduce"], mk: Default.toArray.reduce },
    { needs: ["foldMap"], mk: Default.toArray.foldMap },
  ]);

  define("forEach", [
    { needs: ["reduce"], mk: Default.forEach.reduce },
    { needs: ["toArray"], mk: Default.forEach.toArray },
  ]);

  define("reduce", [
    { needs: ["forEach"], mk: Default.reduce.forEach },
    { needs: ["toArray"], mk: Default.reduce.toArray },
    { needs: ["foldMap"], mk: Default.reduce.foldMap },
  ]);

  define("every", [ { needs: ["toArray"], mk: Default.every.toArray } ]);
  define("some", [ { needs: ["toArray"], mk: Default.some.toArray } ]);
  define("length", [ { needs: ["foldMap"], mk: Default.length.foldMap } ]);
  define("empty", [ { needs: ["foldMap"], mk: Default.empty.foldMap } ]);

  return out;
}
