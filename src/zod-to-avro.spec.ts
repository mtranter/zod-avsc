import { z } from "zod";
import { zodToAvro } from "./zod-to-avro";

describe("zod-to-avro", () => {
  const namespace = "com.zodtoavro";
  it("string", () => {
    const description = "A string value";
    const zodValue = z.string({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual("string");
  });
  it("number", () => {
    const description = "A number value";
    const zodValue = z.number({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual("double");
  });
  it("date", () => {
    const description = "A date value";
    const zodValue = z.date({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual("long");
  });
  it("bigint", () => {
    const description = "A bigint value";
    const zodValue = z.bigint({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual("long");
  });
  it("boolean", () => {
    const description = "A boolean value";
    const zodValue = z.boolean({ description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual("boolean");
  });

  it("array", () => {
    const description = "Some values";
    const zodValue = z.array(z.string({ description }), { description });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual({
      type: "array",
      items: "string",
    });
  });
  it("union", () => {
    const description = "Some values";
    const zodValue = z.union([z.string(), z.number(), z.boolean(), z.date()], {
      description,
    });
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual(["string", "double", "boolean", "long"]);
  });
  it("nullable", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).nullable();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual(["null", "string"]);
  });
  it("optional", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).optional();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual(["null", "string"]);
  });
  it("nullish", () => {
    const description = "Some values";
    const zodValue = z.string({ description }).nullish();
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toEqual(["null", "string"]);
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
          zip: z.string().optional(),
        }),
      },
      { description }
    );
    const avroSchema = zodToAvro("value", zodValue, { namespace });
    expect(avroSchema).toMatchObject({
      name: "value",
      type: "record",
      namespace,
      doc: description,
      fields: [
        {
          doc: undefined,
          name: "name",
          type: "string",
        },
        {
          doc: undefined,
          name: "age",
          type: "double",
        },
        {
          doc: undefined,
          name: "address",
          type: {
            fields: [
              {
                doc: undefined,
                name: "street",
                type: "string",
              },
              {
                doc: undefined,
                name: "city",
                type: "string",
              },
              {
                doc: undefined,
                name: "state",
                type: "string",
              },
              {
                doc: undefined,
                name: "zip",
                type: ["null", "string"],
                default: "null",
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
  it("object with duplicate children", () => {
    const description = "Some values";
    const address = z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    });
    const zodValue = z.object(
      {
        name: z.string(),
        age: z.number(),
        address,
        billingAddress: address,
      },
      { description }
    );
    const avroSchema = zodToAvro("value", zodValue, { namespace });

    expect(avroSchema).toMatchObject({
      name: "value",
      type: "record",
      namespace,
      doc: description,
      fields: [
        {
          doc: undefined,
          name: "name",
          type: "string",
        },
        {
          doc: undefined,
          name: "age",
          type: "double",
        },
        {
          doc: undefined,
          name: "address",
          type: {
            fields: [
              {
                doc: undefined,
                name: "street",
                type: "string",
              },
              {
                doc: undefined,
                name: "city",
                type: "string",
              },
              {
                doc: undefined,
                name: "state",
                type: "string",
              },
              {
                doc: undefined,
                name: "zip",
                type: "string",
              },
            ],
            name: "address",
            type: "record",
            namespace,
          },
        },
        {
          doc: undefined,
          name: "billingAddress",
          type: `${namespace}.address`,
        },
      ],
    });
  });
});
