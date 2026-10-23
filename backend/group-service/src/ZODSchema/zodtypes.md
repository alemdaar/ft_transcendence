# Zod — Types, Validators, and Common Methods

> **Scope:** This is a practical reference to the main Zod schema types and validation methods, with examples. Zod evolves over time, so exact APIs can differ between Zod 3 and Zod 4. Examples marked **Zod 4** use the current Zod 4 style. Check your installed version before copying version-specific code.

## 1. The basic idea

Zod lets you describe what data should look like, then validate data against that schema.

```ts
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().min(18),
});

const result = UserSchema.safeParse({
  name: "Ali",
  age: 21,
});

if (result.success) {
  console.log(result.data); // validated data
} else {
  console.log(result.error.issues); // validation errors
}
```

- **Schema:** rules describing acceptable data.
- **`parse(data)`:** validates and returns parsed data; throws a `ZodError` if invalid.
- **`safeParse(data)`:** validates and returns `{ success: true, data }` or `{ success: false, error }`.
- **Parsed data:** may differ from input because schemas can strip unknown object keys, apply defaults, coerce values, or transform data.

## 2. Primitive schemas

| Type / method | What it validates | Example | Notes |
|---|---|---|---|
| `z.string()` | Text | `z.string()` | Can add string constraints such as `.min()`, `.max()`, `.email()` |
| `z.number()` | Numbers | `z.number()` | Does not accept `"12"` as a number unless you coerce it |
| `z.int()` (Zod 4) | Integers | `z.int()` | Use `z.number().int()` in Zod 3 |
| `z.boolean()` | `true` or `false` | `z.boolean()` | Does not accept `"true"` as a string |
| `z.bigint()` | JavaScript `bigint` | `z.bigint()` | For large integer values represented as BigInt |
| `z.date()` | JavaScript `Date` instances | `z.date()` | A date string is not automatically converted; use coercion or a transform if needed |
| `z.undefined()` | Only `undefined` | `z.undefined()` | Useful for precise schemas |
| `z.null()` | Only `null` | `z.null()` | `null` is different from `undefined` |
| `z.void()` | `undefined` / no meaningful return value | `z.void()` | Commonly used for function return schemas |
| `z.nan()` | `NaN` | `z.nan()` | Special numeric value |
| `z.literal(value)` | One exact literal | `z.literal("admin")` | Can validate exact strings, numbers, booleans, `null`, etc. |
| `z.enum([...])` (Zod 4) | One of a fixed set of strings | `z.enum(["admin", "user"])` | In Zod 3, commonly `z.enum(["admin", "user"])` too |
| `z.stringbool()` (Zod 4) | Common string representations of booleans | `z.stringbool()` | Useful for environment variables and query strings; accepted words are configurable |

## 3. String validations

| Method | What it does | Example |
|---|---|---|
| `.min(n)` | Requires at least `n` characters | `z.string().min(3)` |
| `.max(n)` | Allows at most `n` characters | `z.string().max(100)` |
| `.length(n)` | Requires exactly `n` characters | `z.string().length(6)` |
| `.email()` | Validates email-like format | `z.email()` (Zod 4) or `z.string().email()` |
| `.url()` | Validates URL format | `z.url()` (Zod 4) or `z.string().url()` |
| `.uuid()` | Validates UUID format | `z.uuid()` (Zod 4) or `z.string().uuid()` |
| `.regex(re)` | Requires a regular-expression match | `z.string().regex(/^[A-Z]+$/)` |
| `.startsWith(s)` | Requires a prefix | `z.string().startsWith("user_")` |
| `.endsWith(s)` | Requires a suffix | `z.string().endsWith(".com")` |
| `.includes(s)` | Requires a substring | `z.string().includes("@")` |
| `.trim()` | Trims surrounding whitespace in parsed output | `z.string().trim()` |
| `.toLowerCase()` | Converts parsed output to lowercase | `z.string().toLowerCase()` |
| `.toUpperCase()` | Converts parsed output to uppercase | `z.string().toUpperCase()` |
| `.nonempty()` | Requires at least one character | `z.string().nonempty()`; `.min(1)` is also common |
| `z.email()` / `z.url()` / `z.uuid()` | Standalone format validators in Zod 4 | `z.email()` |

## 4. Number validations

| Method | What it does | Example |
|---|---|---|
| `.min(n)` | Minimum allowed value | `z.number().min(0)` |
| `.max(n)` | Maximum allowed value | `z.number().max(100)` |
| `.int()` | Requires an integer | `z.number().int()` |
| `.positive()` | Greater than zero | `z.number().positive()` |
| `.negative()` | Less than zero | `z.number().negative()` |
| `.nonnegative()` | Zero or greater | `z.number().nonnegative()` |
| `.nonpositive()` | Zero or less | `z.number().nonpositive()` |
| `.multipleOf(n)` | Must be a multiple of `n` | `z.number().multipleOf(5)` |
| `.finite()` | Must be finite | `z.number().finite()` |
| `z.int()` (Zod 4) | Integer schema with integer checks | `z.int()` |

## 5. Object schemas

| Type / method | What it does | Example |
|---|---|---|
| `z.object({...})` | Validates an object’s declared properties | `z.object({ name: z.string() })` |
| `z.strictObject({...})` (Zod 4) | Rejects undeclared/extra keys | `z.strictObject({ name: z.string() })` |
| `.strict()` (Zod 3 style) | Makes an object reject extra keys | `z.object({ name: z.string() }).strict()` |
| `z.looseObject({...})` (Zod 4) | Allows and preserves extra keys | `z.looseObject({ name: z.string() })` |
| `.passthrough()` (Zod 3 style) | Preserves extra keys instead of stripping them | `z.object({ name: z.string() }).passthrough()` |
| `.pick({...})` | Selects specific keys from an object schema | `UserSchema.pick({ name: true })` |
| `.omit({...})` | Removes selected keys from an object schema | `UserSchema.omit({ password: true })` |
| `.extend({...})` | Adds or replaces object fields | `UserSchema.extend({ role: z.string() })` |
| `.partial()` | Makes all object fields optional | `UserSchema.partial()` |
| `.required()` | Makes optional object fields required | `UserSchema.required()` |
| `.keyof()` | Creates an enum of the object's keys | `UserSchema.keyof()` |
| `.catchall(schema)` | Validates undeclared keys with another schema | `z.object({}).catchall(z.string())` |

**Important:** `z.object()` normally strips undeclared keys from the *parsed output*. It does not necessarily reject them. Use `z.strictObject()` (Zod 4) or `.strict()` (Zod 3) if extra keys must cause an error.

## 6. Arrays, tuples, records, maps, and sets

| Type / method | What it does | Example |
|---|---|---|
| `z.array(schema)` | Array whose elements match a schema | `z.array(z.string())` |
| `.min(n)` on array | Requires at least `n` items | `z.array(z.string()).min(1)` |
| `.max(n)` on array | Allows at most `n` items | `z.array(z.string()).max(10)` |
| `.length(n)` on array | Requires exactly `n` items | `z.array(z.string()).length(3)` |
| `z.tuple([...])` | Array with fixed positions and types | `z.tuple([z.string(), z.number()])` |
| `z.record(keySchema, valueSchema)` | Object/dictionary with validated keys and values | `z.record(z.string(), z.number())` |
| `z.partialRecord(keySchema, valueSchema)` (Zod 4) | Record where enum keys need not all be present | `z.partialRecord(z.enum(["a", "b"]), z.string())` |
| `z.map(keySchema, valueSchema)` | JavaScript `Map` with validated keys and values | `z.map(z.string(), z.number())` |
| `z.set(schema)` | JavaScript `Set` whose values match a schema | `z.set(z.string())` |
| `z.array(schema).element` | Accesses the array's element schema (where supported) | `NamesSchema.element` |

## 7. Combining schemas

| Type / method | What it does | Example |
|---|---|---|
| `z.union([A, B])` | Accepts data matching any listed schema | `z.union([z.string(), z.number()])` |
| `z.discriminatedUnion(key, options)` (Zod 3 and 4 APIs vary) | Chooses an object schema using a discriminator field | `z.discriminatedUnion("status", [A, B])` |
| `z.intersection(A, B)` | Requires data to satisfy both schemas | `z.intersection(A, B)` |
| `A.or(B)` | Alternative to a union for two schemas | `z.string().or(z.number())` |
| `A.and(B)` | Alternative to intersection for two schemas | `A.and(B)` |
| `z.never()` | Accepts no values | `z.never()` |
| `z.any()` | Accepts any value without meaningful validation | `z.any()` |
| `z.unknown()` | Accepts any value, while keeping its TypeScript type `unknown` | `z.unknown()` |

Prefer `z.unknown()` over `z.any()` when you want to force TypeScript code to check the value before using it.

## 8. Optional, nullable, default, and fallback values

| Method | What it means | Example |
|---|---|---|
| `.optional()` | Allows `undefined` / missing property | `z.string().optional()` |
| `.nullable()` | Allows `null` | `z.string().nullable()` |
| `.nullish()` | Allows `null` or `undefined` | `z.string().nullish()` |
| `.default(value)` | Supplies a default when input is `undefined` | `z.string().default("guest")` |
| `.prefault(value)` (Zod 4) | Supplies an input value before parsing when input is `undefined` | `z.string().trim().prefault(" guest ")` |
| `.catch(value)` | Returns a fallback if parsing fails | `z.number().catch(0)` |
| `.nonoptional()` (Zod 4) | Disallows `undefined` for a schema that permits it | `z.string().optional().nonoptional()` |

**Remember:**
- `optional` is not the same as `nullable`.
- `default` is for `undefined`, not generally for `null`.
- `.catch()` is a fallback on validation failure; do not use it if invalid input should be rejected.

## 9. Coercion and transformation

| Type / method | What it does | Example |
|---|---|---|
| `z.coerce.string()` | Converts input using JavaScript string conversion, then validates | `z.coerce.string()` |
| `z.coerce.number()` | Converts input to a number, then validates | `z.coerce.number()` |
| `z.coerce.boolean()` | Converts input using JavaScript truthiness | `z.coerce.boolean()` |
| `z.coerce.bigint()` | Attempts BigInt conversion | `z.coerce.bigint()` |
| `z.coerce.date()` | Converts compatible input to a `Date` | `z.coerce.date()` |
| `.transform(fn)` | Converts successfully parsed data to another value | `z.string().transform(s => s.trim())` |
| `.pipe(schema)` | Runs the output of one schema through another schema | `z.string().pipe(z.email())` (version/API dependent) |
| `z.preprocess(fn, schema)` | Changes input before validation | `z.preprocess(v => String(v), z.string())` |
| `.overwrite(fn)` (Zod 4) | Transforms a value without changing the inferred schema type | `z.string().overwrite(s => s.trim())` |

**Warning about booleans:** `z.coerce.boolean()` uses JavaScript truthiness, so `Boolean("false")` is `true`. For query strings like `"true"` and `"false"`, consider `z.stringbool()` in Zod 4 or an explicit preprocessing/validation rule.

## 10. Date, binary, and special schemas

| Type / method | What it validates | Example |
|---|---|---|
| `z.date()` | JavaScript `Date` object | `z.date()` |
| `z.coerce.date()` | Coerces compatible input into a `Date` | `z.coerce.date()` |
| `z.instanceof(Class)` | Instance of a JavaScript class | `z.instanceof(Date)` |
| `z.file()` (Zod 4) | File objects, with size/type constraints available | `z.file().max(1_000_000)` |
| `z.function()` | Function schema (API differs by version) | Check your Zod version's function-validation API |
| `z.promise(schema)` | Promise resolving to a value matching a schema | `z.promise(z.string())` (version-dependent; often unnecessary with async parsing) |
| `z.custom<T>()` | Custom validation for a type | `z.custom<` + "`" + `MyType` + "`" + `>(value => ...)` |
| `z.templateLiteral([...])` (Zod 4) | Validates strings matching a template-literal pattern | `z.templateLiteral(["user_", z.string()])` |

Some of these APIs have changed between Zod versions. Check the documentation for your installed version, particularly for function and promise schemas.

## 11. String formats (especially useful for APIs)

Zod 4 provides standalone format schemas for common formats:

| Validator | Example | Use |
|---|---|---|
| `z.email()` | `z.email()` | Email address |
| `z.url()` | `z.url()` | URL |
| `z.uuid()` | `z.uuid()` | UUID |
| `z.httpUrl()` | `z.httpUrl()` | HTTP/HTTPS URL |
| `z.ipv4()` | `z.ipv4()` | IPv4 address |
| `z.ipv6()` | `z.ipv6()` | IPv6 address |
| `z.cidrv4()` | `z.cidrv4()` | IPv4 CIDR |
| `z.cidrv6()` | `z.cidrv6()` | IPv6 CIDR |
| `z.iso.date()` | `z.iso.date()` | ISO date string |
| `z.iso.time()` | `z.iso.time()` | ISO time string |
| `z.iso.datetime()` | `z.iso.datetime()` | ISO datetime string |
| `z.iso.duration()` | `z.iso.duration()` | ISO duration string |

In Zod 3, these are commonly chained on strings, such as `z.string().email()` and `z.string().uuid()`.

## 12. Refinements and custom rules

| Method | What it does | Example |
|---|---|---|
| `.refine(check, options)` | Adds a custom validation condition | `z.string().refine(s => s.length >= 3)` |
| `.superRefine((value, ctx) => ...)` | Adds one or more custom issues with paths (commonly used in Zod 3; still supported in Zod 4) | Useful for cross-field checks |
| `.check(...)` (Zod 4) | Lower-level custom checks API | See current Zod 4 docs for exact issue format |
| `z.custom()` | Creates a custom schema/check | Useful when built-in schemas do not cover the requirement |

Example: ensure password and confirmation match:

```ts
const PasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});
```

## 13. Parsing and error-handling methods

| Method | What it does | When to use |
|---|---|---|
| `.parse(data)` | Validates and returns parsed data; throws on failure | When exceptions are appropriate |
| `.safeParse(data)` | Returns a success/failure result instead of throwing | Common in Express middleware |
| `.parseAsync(data)` | Async parsing; supports async refinements/transforms | When schema uses async logic |
| `.safeParseAsync(data)` | Async version of `safeParse` | Async validation without throwing for ordinary validation failures |
| `.spa(data)` | Alias for `safeParseAsync` in supported versions | Short form; `safeParseAsync` is clearer |
| `.isOptional()` | Checks whether a schema accepts `undefined` | Schema introspection |
| `.isNullable()` | Checks whether a schema accepts `null` | Schema introspection |
| `.unwrap()` | Gets the inner schema from optional/nullable wrappers (where supported) | Schema composition |
| `z.input<typeof Schema>` | TypeScript type accepted as input | Useful when transforms/coercion change types |
| `z.output<typeof Schema>` / `z.infer<typeof Schema>` | TypeScript type of parsed output | Use `z.infer` for the output type |

Example:

```ts
const AgeSchema = z.coerce.number().int().min(0);

type AgeInput = z.input<typeof AgeSchema>;
type AgeOutput = z.output<typeof AgeSchema>;

// AgeInput can be unknown-like input depending on the API;
// AgeOutput is a number.
```

## 14. Express validation middleware pattern

This schema describes the request shape, so `safeParse` receives an object with matching keys:

```ts
import { z } from "zod";

const createUserSchema = z.strictObject({
  body: z.strictObject({
    name: z.string().min(3),
    email: z.email(),
  }),
});

function validate(schema: z.ZodType) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    req.validated = result.data;
    next();
  };
}
```

Usage:

```ts
router.post(
  "/users",
  validate(createUserSchema),
  (req, res) => {
    const { name, email } = req.validated.body;
    res.status(201).json({ name, email });
  }
);
```

Notes:
- A schema that declares only `body` validates only the `body` portion; add `params` and/or `query` to the schema if you want those validated too.
- `req.validated` is custom Express request data. In TypeScript, add a type declaration or use a typed request pattern to make TypeScript recognize it.
- `z.strictObject()` is Zod 4 style. For Zod 3, use `z.object({...}).strict()`.
- In a TypeScript project, type the middleware generically if you want schema-specific inferred request types.

## 15. Common mistakes

1. **Assuming extra keys always cause an error.** Regular `z.object()` strips undeclared keys from parsed output by default; it does not necessarily reject them.
2. **Assuming `safeParse()` edits `req.body`.** It returns a result. Use `result.data` if you want parsed/cleaned values.
3. **Confusing optional and nullable.** `z.string().optional()` allows `undefined`; `z.string().nullable()` allows `null`.
4. **Expecting strings to become numbers automatically.** Use `z.coerce.number()` if conversion is intended.
5. **Using `z.coerce.boolean()` for the string `"false"`.** JavaScript truthiness makes that string truthy.
6. **Using `parse()` without handling errors.** Use `safeParse()` or catch `ZodError`.
7. **Using async refinements with synchronous parsing.** Use `parseAsync()` or `safeParseAsync()` when async validation is involved.
8. **Copying examples from a different major version.** Check whether your project uses Zod 3 or Zod 4.

## 16. Quick cheat sheet

```ts
z.string()                    // text
z.number()                    // number
z.boolean()                   // boolean
z.object({ name: z.string() })// object
z.array(z.string())           // array of strings
z.enum(["admin", "user"])     // one allowed string
z.union([z.string(), z.number()]) // either string or number
z.string().optional()         // may be undefined
z.string().nullable()         // may be null
z.coerce.number()             // convert input to number
schema.safeParse(data)         // validate without throwing on bad input
schema.parse(data)             // validate and throw on bad input
```

## Official documentation

- Zod documentation: https://zod.dev/
- API reference: https://zod.dev/api
- Error handling: https://zod.dev/error-customization
