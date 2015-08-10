
import test from "tape";

import { fromArray, toArrayN, uncons, map, singleton } from "../Stream";

test("stream / singleton", t => {
  const x = uncons(singleton(true));
  t.true(x, "unconses once");
  t.true(x.head, "has a head element");
  t.true(x.tail, "has a tail");
  const y = uncons(x.tail);
  t.false(y, "hasn't anything in the tail");
  t.end();
});

test("stream / map", t => {
  const s = fromArray([1, 2, 3]);
  t.true(s, "builds from an array");
  t.deepEqual([1, 2, 3], toArrayN(3, s), "reconstructed array is equal");

  const s2 = map(x => x + 1)(s);
  t.deepEqual([2, 3, 4], toArrayN(3, s2), "reconstructed array is mapped");
  t.end();
});
