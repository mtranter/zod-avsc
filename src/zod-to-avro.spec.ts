import { z } from "zod";
import { parse } from "avsc";
import { zodToAvro } from "./zod-to-avro";

describe("zod-to-avro", () => {
  const namespace = "com.zodtoavro";
  it("string", () => {
    const description = "A string value";
    const zodValue = z.string({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      doc: description,
      name: "value",
      namespace,
      type: "string",
    });
  });
  it("number", () => {
    const description = "A number value";
    const zodValue = z.number({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      doc: description,
      name: "value",
      namespace,
      type: "double",
    });
  });
  it("date", () => {
    const description = "A date value";
    const zodValue = z.date({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      doc: description,
      name: "value",
      namespace,
      type: "long",
    });
  });
  it("bigint", () => {
    const description = "A bigint value";
    const zodValue = z.bigint({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      doc: description,
      name: "value",
      namespace,
      type: "long",
    });
  });
  it("boolean", () => {
    const description = "A boolean value";
    const zodValue = z.boolean({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      doc: description,
      name: "value",
      namespace,
      type: "boolean",
    });
  });

  it("array", () => {
    const description = "Some values";
    const zodValue = z.array(z.string({ description }), { description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual({
      doc: description,
      name: "value",
      namespace,
      type: "array",
      items: {
        doc: description,
        name: "value-value",
        namespace,
        type: "string",
      },
    });
  });
  it("union", () => {
    const description = "Some values";
    const zodValue = z.union([z.string(), z.number(), z.boolean(), z.date()], {
      description,
    });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual([
      { name: "value", type: "string", namespace: "com.zodtoavro" },
      { name: "value", type: "double", namespace: "com.zodtoavro" },
      { name: "value", type: "boolean", namespace: "com.zodtoavro" },
      { name: "value", type: "long", namespace: "com.zodtoavro" },
    ]);
  });
  it("nullable", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).nullable();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual([
      "null",
      {
        doc: description,
        name: "value",
        namespace,
        type: "string",
      },
    ]);
  });
  it("optional", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).optional();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual([
      "null",
      {
        doc: description,
        name: "value",
        namespace,
        type: "string",
      },
    ]);
  });
  it("nullish", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).nullish();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual([
      "null",
      {
        doc: description,
        name: "value",
        namespace,
        type: "string",
      },
    ]);
  });
  it("object", () => {
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
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual({
      name: "value",
      type: "record",
      namespace,
      fields: [
        {
          doc: undefined,
          name: "name",
          type: {
            doc: undefined,
            name: "name",
            namespace,
            type: "string",
          },
        },
        {
          doc: undefined,
          name: "age",
          type: {
            doc: undefined,
            name: "age",
            namespace,
            type: "double",
          },
        },
        {
          doc: undefined,
          name: "address",
          type: {
            fields: [
              {
                doc: undefined,
                name: "street",
                type: {
                  doc: undefined,
                  name: "street",
                  namespace,
                  type: "string",
                },
              },
              {
                doc: undefined,
                name: "city",
                type: {
                  doc: undefined,
                  name: "city",
                  namespace,
                  type: "string",
                },
              },
              {
                doc: undefined,
                name: "state",
                type: {
                  doc: undefined,
                  name: "state",
                  namespace,
                  type: "string",
                },
              },
              {
                doc: undefined,
                name: "zip",
                type: {
                  doc: undefined,
                  name: "zip",
                  namespace,
                  type: "string",
                },
              },
            ],
            name: "address",
            type: "record",
            namespace,
          },
        },
      ],
    });
  });
});
