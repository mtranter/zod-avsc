import {
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodString,
  ZodTypeAny,
  ZodUnion,
} from "zod";
import { match, P } from "ts-pattern";
import { schema } from "avsc";

export const zodToAvro = (
  name: string,
  zodType: ZodTypeAny,
  options?: { namespace: string }
): schema.AvroSchema => {
  return match<{ value: ZodTypeAny }, schema.AvroSchema>({ value: zodType })
    .with({ value: P.instanceOf(ZodOptional) }, (zodObject) => {
      return [
        "null",
        zodToAvro(name, zodObject.value.unwrap(), options),
      ] as schema.AvroSchema;
    })
    .with({ value: P.instanceOf(ZodNullable) }, (zodObject) => {
      return [
        "null",
        zodToAvro(name, zodObject.value.unwrap(), options),
      ] as schema.AvroSchema;
    })
    .with({ value: P.instanceOf(ZodObject<ZodRawShape>) }, (zodObject) => {
      return parseZodObjectToAvscRecord(name, zodObject.value, options);
    })
    .with({ value: P.instanceOf(ZodString) }, (zodString) => {
      return {
        name,
        type: "string",
        doc: zodString.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodUnion) }, (zodUnion) => {
      return Array.from(
        new Set(
          zodUnion.value.options.flatMap((zodType) =>
            zodToAvro(name, zodType, options)
          )
        )
      );
    })
    .with({ value: P.instanceOf(ZodEnum) }, (zodEnum) => {
      return {
        name,
        type: "enum",
        symbols: zodEnum.value.options,
        doc: zodEnum.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodNumber) }, (zodNumber) => {
      return {
        name,
        type: "double",
        doc: zodNumber.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodDate) }, (zodDate) => {
      return {
        name,
        type: "long",
        doc: zodDate.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodArray) }, (zodArray) => {
      return {
        name,
        type: "array",
        items: zodToAvro(`${name}-value`, zodArray.value._def.type, options),
        doc: zodArray.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodBigInt) }, (zodNumber) => {
      return {
        name,
        type: "long",
        doc: zodNumber.value.description,
        namespace: options?.namespace,
      };
    })
    .with({ value: P.instanceOf(ZodBoolean) }, (zodNumber) => {
      return {
        name,
        type: "boolean",
        doc: zodNumber.value.description,
        namespace: options?.namespace,
      };
    })
    .otherwise((v) => {
      throw new Error(`Unsupported type ${v}`);
    });
};

const parseZodObjectToAvscRecord = (
  name: string,
  zodObject: ZodObject<ZodRawShape>,
  options?: { namespace: string }
): schema.RecordType => {
  const shape = zodObject.shape;
  const fields = Object.entries(shape).map((k) => {
    const type = zodToAvro(k[0], k[1], options);
    const name = k[0];
    const doc = k[1].description;
    return { name, type, doc };
  });
  return { name, type: "record", fields, namespace: options?.namespace };
};
