
# Algebra: Algebraic module specifications

A specification of algebraic module interfaces.

## Truly modular functional programming in Javascript

*Algebraic* is a set of Javascript objects which are known as *algebraic modules*
or *modules* when it's clear that I'm not referring to CommonJS, AMD, or ES6
import/export modules. A module contains a set of related behaviors operating
over a set of *types* which the module pertains to.

For instance, there is a module `Array` which contains operations over the
standard JS array type.

```javascript
> var A = require("algebraic");
> A.Array.of(1)
[ 1 ]
> A.Array.plus(A.Array.of(1), A.Array.of(2))
[ 1, 2 ]
```

Seasoned OO-ers might find this awkward and backward—we should be doing
something like `[1].concat([2])`. *Algebraic* intentionally eschews this design
with its modular design.

## Principles

### Behavior before state

A driving principle of *Algebraic*'s design is *behavior before state*. What
this means is that libraries and programs should be first designed against a
specification of behavior and oblivious to the state required to pull the
behavior off. The advantage of this adage is increased modularity driven by a
clearer line between interface and implementation.

Unfortunately, standard OO practice conflates behavior and state
heavily---indeed some take the definition of an object to *be* the conflation of
behavior and state.

In most cases module objects themselves are completely state free. Indeed, in
any case where they are not the observation of that state ought to be severely
restricted and the intended behavior favored. Instead all of the *state* of
*Algebraic* arises from the arguments passed to and received from module
behaviors.

### "Seamless" immutability by default

Immutability vastly reduces the state space of a program improving the ability
for the author to correctly reason about it's behavior. It's also assumed in
most descriptions of algebraic structures. For these reasons, *Algebraic*
eschews behaviors which mutate values opting instead to return new copies as
often as possible. This also provides standard sharing tricks like pre-emptive
`O(1)` equality checks (which *Algebraic* uses by default) useful for
comparison-driven programs like React-style UIs.

**Note**: *Algebraic*-style immutability is *dangerous* when mixed with mutable
JS code. *Algebraic* does not attempt to freeze or seal values and also
maximizes sharing, so mutation of an object involved in *Algebraic* behaviors
can have long range effects.

## Inspirations

*Algebraic* takes its design inspiration heavily from two other languages and
their associated communities: ML and Haskell. Modular design of programs is
*extraordinarily well done* in ML languages like OCaml and SML where the static
type system helps ensure that your interfaces are well-defined and properly
used. Algebraic specifications of operations is *extraordinarily well done* in
Haskell where laziness, purity, and the Haskell "typeclass" mechanism drove the
use of algebraic laws over immutable values out of both necessity and splendor.

## Motivation

* *Why not OO?* Other FP-in-JS libraries (Fantasy Land, Ramda, Sanctuary, etc)
  provide FP-like functionality by attaching methods to objects so that a value
  `x` is, e.g., a *Monoid* when `x.plus` is a partially-applied monoid operation.
  `algebraic` eschews this by placing *all* functionality in an object external
  to `x` called a *module*.
* *Immutable by default.* (Obvious cache invalidation)
* *Names, operations, and laws from algebra.* Programming is an exercise in
  naming things. Algebra provides a large set of useful, consistent names along
  with well-defined expectations for what they mean.

## Modules

### Special
* [X] `Naive`: **Decidable**

### Simply kinded
* [X] `String`: **Decidable**, **Hashable**, **Decidable Monoid**,
  **Least**, **Total Order**
* [X] `Boolean`
* [X] `Number`
* [X] `Integer`
* [X] `Natural`

### Higher kinded
* [X] `Array`: **Decidable Monoid**, **Covariant**, **Foldable**,
  **Traversable**, **Monad**, **Reflects Decidability**
* [X] `Set.OfDecidable`
* [X] `Set.OfHashable`
* [ ] `Set.OfTotalOrder`
* [X] `Dict`
* [X] `Trie`

### References

* [fantasyland/fantasy-land](https://github.com/fantasyland/fantasy-land)
* [tel/ocaml-cats](https://github.com/tel/ocaml-cats)

## Specifications

### Identification

* **Decidable** {`X`}
  * *definitions*
    * `X : Type`
    * `eq : (X, X) -> Bool`
  * *notation*
    * When unambiguous, `x = y` is written to mean `eq(x, y)`.
  * *laws*
    * reflexivity: for all `(a : X)` `a = a`
    * symmetry: for all `(a b : X)` `a = b` implies `b = a`.
    * transitivity: for all `(a b c : X)` `a = b` and `b = c` implies `a = c`.

* **Hashable** {`X`}
  * *definitions*
    * *include* **Decidable** {`X`}
    * *definitions*
      * `hash : X -> Int`
  * *laws*
    * identity compatibility: for all `(a b : X)` if `a = b` then `hash(a) = hash(b)`.

### Order Theory

* **Preorder** {`X`}
  * *definitions*
    * `X : Type`
    * `leq : (X, X) -> Bool`
    * `indistinguishable : (X, X) -> Bool`
      * `λ(a, b) . leq(a, b) && leq(b, a)`
    * `incomparable : (X, X) -> Bool`
      * `λ(a, b) . not(leq(a, b) || leq(b, a))`
  * *notation*
    * Where unambiguous, `x <= y` is written to mean `leq(x, y)`
  * *laws*
    * reflexivity: for all `(a : X)` `a <= a`
    * transitivity: for all `(a b c : X)` `a <= b` and `b <= c` implies `a <= c`

* **Partial Order** {`X`} or **Poset** {`X`}
  * *include* **Preorder** {`X`}
  * *implies unique* **Decidable** {`X = X`}
    * *define* `eq(a, b) = indistinguishable(a, b)`
  * *laws*
    * antisymmetry: `indistinguishable` is an equivalence relation

* **Weak Order** {`X`}
  * *include* **Poset** {`X`}
  * *laws*
    * `incomparable` is transitive

* **Total Order** {`X`}
  * *include* **Poset** {`X`}
  * *implies unique* **Weak Order** {`X = X`}
    * proof: totality implies that `incomparable` is the empty relation
  * *laws*
    * totality: for all `(a b : X)` either `a <= b` or `b <= a`

### Boundings

* **Least** {`X`}
  * *definitions*
    * `X : Type`
    * `bottom : () -> X`

* **Greatest** {`X`}
  * *definitions*
    * `X : Type`
    * `top : () -> X`

* **Bounded** {`X`}
  * *include* **Least** {`X`} and **Greatest** {`X`}

### Lattice Theory

* **Join** {`X`} / **Meet** {`X`}
  * *include* **Decidable** {`X`}
  * *definitions* (one of, called `op`)
    * `join : (X, X) -> X`
    * `meet : (X, X) -> X`
  * *notation*
    * Where unambiguous, `join` is written `|`
    * Where unambiguous, `meet` is written `&`
  * *laws*
    * associativity of `op`
    * commutativity of `op`
    * idempotence of `op`: for all `(a : X)` `op(a, a) = a`
  * *implies unique*
    * **Semigroup** {`X`} with
      * define `plus(a, b) = op(a, b)`
    * **Poset** {`X`} with
      * define `leq(a, b) = eq(a | b, b)` or
      * define `leq(a, b) = eq(a, a & b)` or

* **Join<sup>★</sup>** {`X`} / **Meet<sup>★</sup>** {`X`}
  * *include* **Join** {`X`} / **Meet** {`X`} as `op`
  * *definitions*
    * `joinN : [X] -> X` or
    * `meetN : [X] -> X`
  * *laws*
    * `op` is a **Monoid** morphism from arrays to `X`
    * operation compatibility: for all `(a b : X)` `op(a, b) = opN([a, b])`
  * *implies unique* **Least** {`X`} / **Greatest** {`X`}
    * define `bottom() = joinN([])` or
    * define `top() = meetN([])`
  * *implies unique* **Monoid** {`X`}
    * define `zero() = opN([]])`  

* **Lattice**
  * *include* **Decidable** {`X`}
  * *definitions*
    * `join : (X, X) -> X` and
    * `meet : (X, X) -> X`
  * *notation*
    * Where unambiguous, `join` is written `|`
    * Where unambiguous, `meet` is written `&`
  * *laws*
    * `join` *implies unique* **Join** {`X`}
    * `meet` *implies unique* **Meet** {`X`}
    * absorption: for all `(a b : X)` if `q = a | (a & b)` and `p = a & (a | b)` then `eq(q, p)` and `q = a` and `p = a`
    * **Poset** {`X`} via **Join** {`X`} is compatible with **Poset** {`X`} via **Meet** {`X`}
  * *implies unique* **Poset** {`X`}
    * defined via either **Join** {`X`} or **Meet** {`X`}
  * *projects*
    * **Semigroup** {`X`} via **Join** {`X`}
    * **Semigroup** {`X`} via **Meet** {`X`}

* **Lattice<sup>★</sup>**
  * *include* **Decidable** {`X`}
  * *definitions*
    * `join : (X, X) -> X` and
    * `meet : (X, X) -> X`
    * `joinN : (X, X) -> X` and
    * `meetN : (X, X) -> X`
  * *notation*
    * Where unambiguous, `join` is written `|`
    * Where unambiguous, `meet` is written `&`
  * *implies* **Bounded** {`X`}
    * via implication of **Least** {`X`} and **Greatest** {`X`} from **Join<sup>★</sup>** {`X`} and **Meet<sup>★</sup>** {`X`} respectively
  * *laws*
    * `joinN` *implies unique* **Join<sup>★</sup>** {`X`}
    * `meetN` *implies unique* **Meet<sup>★</sup>** {`X`}
    * absorption: for all `(a b : X)` if `q = a | (a & b)` and `p = a & (a | b)` then `eq(q, p)` and `q = a` and `p = a`
    * **Poset** {`X`} via **Join** {`X`} is compatible with **Poset** {`X`} via **Meet** {`X`}
  * *projects*
    * **Monoid** {`X`} via **Join<sup>★</sup>** {`X`}
    * **Monoid** {`X`} via **Meet<sup>★</sup>** {`X`}  

* **Distributive** {`X`}
  * *include* **Lattice** {`X`}
  * *laws*
    * distributivity
      * for all `(a b c : X)` let `p = a & (b | c))` and `q = (a & b) | (a & c)` then `eq(p, q)` *or*
      * *dually*, for all `(a b c : X)` let `p = a | (b & c)` and `q = (a | b) & (a | c)` then `p = q`

### First-order Algebraic Theories

* **Magma** {`X`}
  * *definitions*
    * `X : Type`
    * `plus : (X, X) -> X`
  * *notation*
    * Where unambiguous, `plus(x, y)` is written `x + y`

* **Semigroup** {`X`}
  * *include* **Magma** {`X`} and **Decidable** {`X = X`}
  * *laws*
    * associativity of `plus`: for all `(a b c : X)` `eq(plus(a, plus(b, c)), plus(plus(a, b), c))`

* **Monoid** {`X`}
  * *include* **Semigroup** {`X`}
  * *definitions*
    * `zero : () -> X`
    * `plusN : [X] -> X`
      * `λ(xs) . xs.reduce(plus, zero())`
  * *notation*
    * Where unambiguous, `zero()` is written `0`
  * *laws*
    * `zero` is a zero: for all `(a : X)` `a + 0 = a` and `0 + a = a`

* **Decidable Monoid** {`X`}
  * *include* **Monoid** {`X`}
  * *definitions*
    * `isZero : X -> Bool`
  * *laws*
    * `zero` `isZero`: `isZero(zero())`

* **Group** {`X`}
  * *include* **Monoid** {`X`}
  * *definitions*
    * `negate : X -> X`
    * `minus : (X, X) -> X`
      * `λ(a, b) . plus(a, negate(b))`
  * *notation*
    * Where unambiguous, `negate(x)` is written `-x`
    * Where unambiguous, `minus(x, y)` is written `x - y`
  * *laws*
    * `negate` undoes `plus`: for all `(a : X)` `x - x = 0` and `-x + x = 0`

The following 3 are very close to one another such that **Ring** {`X`} subsumes both **Semiring** {`X`} and **Rng** {`X`} but those two are incomparable.

* **Semiring** {`X`}
  * *include* **Decidable** {`X`}
  * *definitions*
    * `zero : () -> X`
    * `one : () -> X`
    * `plus : (X, X) -> X`
    * `times : (X, X) -> X`
  * *projects*
    * `zero` and `plus` form the zero-plus **Monoid** {`X`}
    * `one` and `times` form the one-times **Monoid** {`X`}
  * *notation*
    * Where unambiguous, `zero()` is written `0`
    * Where unambiguous, `one()` is written `1`
    * Where unambiguous, `plus(x, y)` is written `x + y`
    * Where unambiguous, `times(x, y)` is written `x * y`
  * *laws*
    * the zero-plus **Monoid** {`X`} is commutative
    * `times`-`plus` distributivity: for all `(a b c : X)`
      * *left distributivity*: `a * (b + c) = (a * b) + (a * c)`
      * *right distributivity*: `(a + b) * c = (a * c) + (b * c)`
    * `zero` annihilation: for all `(a : X)` `0 * a = 0` and `a * 0 = 0`

* **Rng**
  * *include* **Decidable** {`X`}
  * *definitions*
    * `zero : () -> X`
    * `negate : X -> X`
    * `plus : (X, X) -> X`
    * `times : (X, X) -> X`
    * `minus : (X, X) -> X`
      * `λ(a, b) . plus(a, negate(b))`
  * *notation*
    * Where unambiguous, `zero()` is written `0`
    * Where unambiguous, `plus(x, y)` is written `x + y`
    * Where unambiguous, `times(x, y)` is written `x * y`
    * Where unambiguous, `negate(x)` is written `-x`
    * Where unambiguous, `minus(x, y)` is written as `x - y`
  * *projects*
    * `zero`, `plus`, and `negate` form the zero-plus **Group** {`X`}
    * `times` forms the times **Semigroup** {`X`}
  * *laws*
    * the zero-plus **Group** {`X`} is commutative
    * `times`-`plus` distributivity: for all `(a b c : X)`
      * *left distributivity*: `a * (b + c) = (a * b) + (a * c)`
      * *right distributivity*: `(a + b) * c = (a * c) + (b * c)`

* **Ring**
  * *include* (all compatible)
    * **Decidable** {`X`}
    * **Semiring** {`X`}
    * **Rng** {`X`}
  * *definitions*
    * `zero : () -> X`
    * `one : () -> X`
    * `negate : X -> X`
    * `plus : (X, X) -> X`
    * `times : (X, X) -> X`
    * `minus : (X, X) -> X`
      * `λ(a, b) . plus(a, negate(b))`
  * *notation*
    * Where unambiguous, `zero()` is written `0`
    * Where unambiguous, `one()` is written `1`
    * Where unambiguous, `plus(x, y)` is written `x + y`
    * Where unambiguous, `times(x, y)` is written `x * y`
    * Where unambiguous, `negate(x)` is written `-x`
    * Where unambiguous, `minus(x, y)` is written as `x - y`
  * *projects*
    * `zero`, `plus`, and `negate` form the zero-plus **Group** {`X`}
    * `one`-`times` form the one-times **Monoid** {`X`}
  * *laws*
    * the zero-plus **Group** {`X`} is commutative
    * `times`-`plus` distributivity: for all `(a b c : X)`
      * *left distributivity*: `a * (b + c) = (a * b) + (a * c)`
      * *right distributivity*: `(a + b) * c = (a * c) + (b * c)`

### Higher-order Algebraic Theories

Three notational shorthands are used in this section: `id = x => x`, `f . g = x => f(g(x))`, and `. = f => g => x => f(g(x))`.

* **Parametric** {`F`}
  * *definitions*
    * `F : Type -> Type`

* **Reflects decidability** {`F`}
  * *include* **Parametric** {`F`}
  * *implications*
    * **Decidable** {`X`} implies **Decidable** {`F X`}

* **Covariant** {`F`}
  * *include* **Parametric** {`F`}
  * *definitions*
    * `map : ∀ a b . (a -> b) -> (F a -> F b)`
  * *notation*
    * Where unambiguous `map(f)` is written `[f]`
  * *laws* (category morphism)
    * for all `(X : Type)`, **Decidable** {`F X`}, `(fa : F X)`, `fa = [id](fa)`
    * for all `(X Y Z : Type)`, **Decidable** {`F X`}, `(fx : F X)`, `(g : X -> Y)`, `(f : Y -> Z)` `[f]([g](fx)) = [f . g](fx)`

* **Contravariant** {`F`}
  * *include* **Parametric** {`F`}
  * *definitions*
    * `comap : ∀ a b . (b -> a) -> (F a -> F b)`
  * *laws* (category morphism)

* **Apply** {`F`}
  * *include* **Covariant** {`F`}
  * *notation*
    * When unambiguous, `f * x` is written to mean `ap(f, x)`.
  * *definitions*
    * `ap : ∀ a b . F (a -> b) -> (F a -> F b)`
    * `smash : ∀ a b . (F a, F b) -> F {fst: a, snd: b}`
      * `smashWith((fst, snd) => {fst, snd})`
    * `smashWith : ∀ a b c . ((a, b) -> c) -> (F a, F b) -> F c`
      * `λ(f) . λ(fa, fb) . map(x => f(x.fst, x.snd))(smash(fa, fb))`
  * *laws*
    * composition reassociates: for all `(X Y Z : Type)`, **Decidable** {`F Z`}, `(f : F (Y -> Z))`, `(g : F (X -> Y))`, `(a : F x)`, we let `([.](f) * g) * a = f * (g * a)`.
  * *notes*
    * can be used to `traverse` non-empty structures

* **Applicative** {`F`}
  * *include* **Apply** {`F`}
  * *defintions*
    * `of : ∀ a . a -> F a`
    * traversals of "container-like" structures
      * `traverseArray : ((a_i, i) -> F b_i) -> ([a_i] -> F [b_i])`
      * `traverseDict : ((a_i, k_i) -> F b_i) -> (Obj_i (k_i : a_i) -> F (Obj_i (k_i : b_i)))`
  * *notation*
    * Where unambiguous, `of(x)` is written `{x}`
  * *laws*
    * identity reflection: `{id} * v = v`
    * application reflection: `{f} * {x} = {f(x)}`
    * interchange: `u * {y} = {f => f(y)} * u`

* **Bind** {`F`}
  * *include* **Apply** {`F`}
  * *definitions*
    * `bind : ∀ a b . (a -> F b) -> (F a -> F b)`
    * `seq :  ∀ a b . (F a, F b) -> F b`
      * `λ(fa, fb) . bind(_ => fb)(fa)`
    * `kseq : ∀ a b . (a -> F b, b -> F c) -> (a F c)`
      * `λ(afb, bfc) . λa . bind(bfc, afb(a))`
    * `collapse : ∀ a . F (F a) -> F a`
      * `bind(id)`
  * *notation*
    * Where unambiguous `bind(k, m)` is written `m >>= k`
    * Where unambiguous `seq(m1, m2)` is written `m1 >> m2`
    * Where unambiguous `kseq(f1, f2)` is written `f1 >=> f2`
  * *projects*
    * **Apply** {`F`} via
      * define `ap(mf, mx) = mf >>= (f => [f](mx))`
  * *laws*
    * associativity: `f >=> (g >=> h) = (f >=> g) >=> h`

* **Monad** {`F`}
  * *include* (compatibly)
    * **Bind** {`F`}
    * **Applicative** {`F`}
  * *laws*
    * left identity: `of >=> f = f`
    * right identity: `f >=> of = f`

* **Foldable** {`F`}
  * *include* **Covariant** {`F`}
  * *definitions*
    * `foldMap : ∀ a x . (Monoid {x}, a -> x) -> (F a -> x)`
    * `toArray : ∀ x . F x -> [x]`
      * defined using the universal **Monoid** `{[X]}` available for all `X`
    * `forEach : ∀ x . (F x, x -> ()) -> ()`
      * defined by passing through arrays
    * `reduceLeft`
      * defined by passing through arrays
    * `reduceRight`
      * defined by passing through arrays
  * *laws*
    * "seek and find": for all `a : Type`, all functions `F a -> a?`, and all values `x : F a`, if `f(x)` exists then `f(x)` is in the array `toArray(x)`

* **Traversable** {`F`}
  * *include* **Foldable** {`F`}
  * *definitions*
    * `traverse : ∀ a b k . (Applicative {k}, a -> k b) -> (F a -> t (F b))`
  * *laws*
    * See [Haskell documentation](https://hackage.haskell.org/package/base-4.8.1.0/docs/Data-Traversable.html)

