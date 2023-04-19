# Zod to Avro.

Untested.
Beta.

Pretty self explanatory.

`npm install zod-avsc`

Usage:

```typescript
import { z } from "zod";
import { zodToAvro } from "zod-avsc";

const description = "Some values";
const zodValue = z.object(
  {
    name: z.string(),
    age: z.number(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    }),
  },
  { description }
);
const avroSchema = zodToAvro("Person", zodValue, { namespace: "com.acme.people" });
```
