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

/**
 * @sig (Obj (k1: a), Obj (k2: a)) -> Obj ((Union k1 k2): a)
 */
export function extendObject(mod, o) {
  Object.keys(o).forEach(k => mod[k] = o[k]);
}

/**
 * Compute a dictionary as a union of a set of dictionaries.
 */
export function dictUnion(mods) {
  let out = {};
  mods.forEach(m => {
    Object.keys(m).forEach(k => {
      out[k] = m[k];
    });
  });
  return out;
}

export function existsOrElse(name, t) {
  if (!t) { throw new Error(`Expected ${name}, not ${t}`); }
}

export function mapDict(d, f) {
  let out = {};
  Object.keys(d).forEach(k => { out[k] = f(d[k]); });
  return out;
}
