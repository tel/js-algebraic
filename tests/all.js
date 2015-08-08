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

/* global System */

function ignorer() { }
function thrower(e) { throw e; }

function runTests(mod) {
  System.import("{local-test:reify:algebraic}/tests/" + mod)
    .then(ignorer, thrower);
}

runTests("String");
runTests("Array");
runTests("SetOfDecidable");
runTests("SetOfHashable");
