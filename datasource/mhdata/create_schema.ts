/**
 * Convert a JSON object to a TypeScript type definition.
 * In particular converting my.harvard/curricle course data
 * to TypeScript type definitions in schema_myharv.ts and schema_curricle.ts
 */

import fs from 'fs';

// type definitions
type Course = { [key: string]: any };

enum T {
  Null = 'Null',
  Undefined = 'Undefined',
  EmptyString = "EmptyString", // "", " ", etc.
  Boolean = 'Boolean',
  Number = 'Number',
  String = 'String',
  XMLString = "XMLString", // if starts with "<?xml"
  HTMLString = "HTMLString", // "<p>hello</p>", etc. if it includes "</"
  URLString = "URLString", // starts with "http" and is a valid URL
  TimeString = "TimeString", // [0-12]:[00-59](am | pm)
  Object = 'Object',
  Array = 'Array',
}

type MixedTypeInfo = Partial<{ [Type in T]: TypeInfo }>;
type TypeInfo = {
  type: T;
  count: number;
  examples: Set<any>;
  childKeyToMixedTypeInfo: { [key: string]: MixedTypeInfo };
};

function getType(val: any) : T {
  if (val === null) return T.Null;
  if (val === undefined) return T.Undefined;
  if (typeof val === 'boolean') return T.Boolean;
  if (typeof val === 'number') return T.Number;
  if (typeof val === 'string') {
    if (val.trim().length === 0) return T.EmptyString;
    if (val.startsWith('<?xml')) return T.XMLString;
    if (val.includes("</")) return T.HTMLString;
    if (val.startsWith('http')) {
      try {
        new URL(val);
        return T.URLString;
      } catch (e) {}
    }
    if (val.match(/^[0-9]{1,2}:[0-9]{2}(am|pm)$/)) return T.TimeString;
    return T.String;
  }
  if (Array.isArray(val)) return T.Array;
  if (typeof val === 'object') return T.Object;
  throw new Error(`unexpected type: ${typeof val}`);
}

function getTypeInfo(val: any) : TypeInfo {
  const type = getType(val);
  const typeInfo: TypeInfo = {
    type,
    count: 1,
    examples: new Set([val]),
    childKeyToMixedTypeInfo: {},
  };
  if (type === T.Array || type === T.Object) {
    for (let k in val) {
      const child = val[k];
      const childKey = type === T.Array ? '[i]' : `${k}`;
      const childTypeInfo = getTypeInfo(child);
      typeInfo.childKeyToMixedTypeInfo[childKey] = mergeTypeInfo(typeInfo.childKeyToMixedTypeInfo[childKey], childTypeInfo);
    }
  }
  return typeInfo;
}

function mergeTypeInfo(acc: MixedTypeInfo | undefined, curr: TypeInfo) : MixedTypeInfo {
  if (!acc) acc = {};
  if (!acc[curr.type]) {
    acc[curr.type] = {
      type: curr.type,
      count: 0,
      examples: new Set(),
      childKeyToMixedTypeInfo: {},
    };
  }
  let existing = acc[curr.type]!;
  existing.count += curr.count;
  if (existing.examples.size <= 20) existing.examples = new Set([...existing.examples, ...curr.examples]);
  for (let childKey in curr.childKeyToMixedTypeInfo) {
    existing.childKeyToMixedTypeInfo[childKey] = mergeMixedTypeInfo(existing.childKeyToMixedTypeInfo[childKey], curr.childKeyToMixedTypeInfo[childKey]);
  }
  // note keys that are in existing but not in curr -- mark as undefined
  for (let childKey in existing.childKeyToMixedTypeInfo) {
    if (!curr.childKeyToMixedTypeInfo[childKey]) {
      existing.childKeyToMixedTypeInfo[childKey].Undefined = {
        type: T.Undefined,
        count: (existing.childKeyToMixedTypeInfo[childKey]?.Undefined?.count ?? 0) + 1,
        examples: new Set([undefined]),
        childKeyToMixedTypeInfo: {},
      };
    }
  }
  return acc;
}

function mergeMixedTypeInfo(acc: MixedTypeInfo | undefined, curr: MixedTypeInfo) : MixedTypeInfo {
  acc = { ...acc };
  for (let key in curr) {
    acc = mergeTypeInfo(acc, curr[<T>key]!);
  }
  return acc;
}

function convertMixedTypeInfoToSchema(mixedTypeInfo: MixedTypeInfo, level: number) : string {
  let schemas = [];
  for (let key in mixedTypeInfo) {
    const typeInfo = mixedTypeInfo[<T>key]!;
    schemas.push(convertTypeInfoToSchema(typeInfo, level));
  }
  return schemas.join(' | ');
}

function convertTypeInfoToSchema(typeInfo: TypeInfo, level: number) : string {
  const { type, count, examples, childKeyToMixedTypeInfo } = typeInfo;

  if (type === T.Null) return `null`;
  if (type === T.Undefined) return `undefined`;
  if (type === T.EmptyString) return `EmptyString`;
  if (type === T.Boolean) {
    if (examples.size === 1) return `${examples.values().next().value}`;
    return `boolean`;
  }
  if (type === T.Number) {
    if (examples.size === 1) return `${examples.values().next().value}`;
    if (examples.size < 20) return `(${[...examples].map(x => `${x}`).join(' | ')})`;
    return `number`;
  }
  if (type === T.String || type === T.XMLString || type === T.HTMLString || type === T.URLString || type === T.TimeString) {
    let tsType = type === T.String ? 'string' : type === T.XMLString ? 'XMLString' : type === T.HTMLString ? 'HTMLString' : type === T.URLString ? 'URLString' : type === T.TimeString ? 'TimeString' : 'InvalidString';
    const formatString = (str : string) : string => {
      str = str.trim().replace(/"/g, `\\"`);
      if (str.length < 100) return `"${str}"`;
      return `LongString<${tsType}>`;
    }
    if (examples.size === 1) return formatString(examples.values().next().value);
    if (examples.size < 20 && type === T.String) return `(${[...new Set([...examples].map(formatString))].join(' | ')})`;
    return tsType;
  }
  if (type === T.Array) {
    const childTypeInfo = childKeyToMixedTypeInfo['[i]'];
    let childSchema = convertMixedTypeInfoToSchema(childTypeInfo, level);
    if (childSchema.includes(' | ')) return `(${childSchema})[]`;
    return `${childSchema}[]`;
    // return `Array<${childSchema}>`;
  }
  if (type === T.Object) {
    let currIndent = ''.padStart(level * 2, ' ');
    let newIndent = ''.padStart((level+1) * 2, ' ');

    let childSchemas = [];
    for (let childKey in childKeyToMixedTypeInfo) {
      const childTypeInfo = childKeyToMixedTypeInfo[childKey];
      childSchemas.push(`${childKey}: ${convertMixedTypeInfoToSchema(childTypeInfo, level + 1)},`);

      // print example of string above the key
      if (childTypeInfo.String && childTypeInfo.String.examples.size > 20) {
        childSchemas[childSchemas.length - 1] = `\n${newIndent}/* e.g. "${childTypeInfo.String.examples.values().next().value.trim().replace(/"/g, `\\"`).replace(/\*\//g, `*\\/`).replace(/\n/g, `\\n`)}" */\n${newIndent}${childSchemas[childSchemas.length - 1]}`;
      } else {
        childSchemas[childSchemas.length - 1] = `${newIndent}${childSchemas[childSchemas.length - 1]}`;
      }
    }

    // return `{\n${childSchemas.map(s => newIndent + s).join('\n')}\n${currIndent}}`;
    return `{\n${childSchemas.map(s => s).join('\n')}\n${currIndent}}`;
  }
  throw new Error(`unexpected type: ${type} for typeInfo: ${JSON.stringify(typeInfo)}`);
}

function convertToSchema(typeInfo : TypeInfo) : string {
  return `
type EmptyString = string; // "", " ", etc
type XMLString = string; // starts with "<?xml"
type HTMLString = string; // includes "</"
type URLString = string; // starts with "http" and is a valid URL
type TimeString = string; // hh:mm(am | pm)
type LongString<T> = string; // used in place of actual string in an enum when the string is too long

export type Course = ${convertTypeInfoToSchema(typeInfo, 0)};
`;
}

function main() {
  // save my.harvard schema to schema1.ts
  const courses1: Course[] = Object.values(JSON.parse(fs.readFileSync('../../data/courses_2022_Fall.json', 'utf8')).courses);
  const typeInfo1 = getTypeInfo(courses1);
  const schema1 = convertToSchema(typeInfo1.childKeyToMixedTypeInfo['[i]'].Object!);
  fs.writeFileSync('./schema_myharv.ts', schema1, 'utf8');
  console.log("My.Harvard Done!")

  // save curricle schema to schema2.ts
  const courses2: Course[] = Object.values(JSON.parse(fs.readFileSync('../../data/courses_newlines.json', 'utf8')));
  const typeInfo2 = getTypeInfo(courses2);
  const schema2 = convertToSchema(typeInfo2.childKeyToMixedTypeInfo['[i]'].Object!);
  fs.writeFileSync('./schema_curricle.ts', schema2, 'utf8');
  console.log("Curricle Done!")
}

main();
