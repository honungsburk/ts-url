/**
 * In the URI spec, this is what a URL looks like:
 *
 *  https://example.com:8042/over/there?name=ferret#nose
 *  \___/   \______________/\_________/ \_________/ \__/
 *    |            |            |            |        |
 *  scheme     authority       path        query   fragment
 *
 *
 * This module is for parsing the **query** part of a URL.
 *
 * This library is a port of {@link this Elm library | https://package.elm-lang.org/packages/elm/url/latest/Url-Parser-Query}
 */

////////////////////////////////////////////////////////////////////////////////
// Combinators
////////////////////////////////////////////////////////////////////////////////

export type URLQuery = Record<string, string[]>;

export namespace URLQuery {
  /**
   * Turn a url query string into a URLQuery object
   *
   * @example
   * ```ts
   * const urlQuery = fromString(window.location.search)
   * const query = myCustomParser(urlQuery)
   * ...
   * ```
   *
   * @param key - the query string
   * @return a structured URLQuery for further parsing, or undefined
   */
  export function fromString(s: string): URLQuery | undefined {
    const urlQuery: URLQuery = {};
    let foundQuestionMark = false;
    let key: undefined | string = undefined;
    let start: undefined | number = undefined;
    for (let pos = 0; pos < s.length; pos++) {
      // We have a key, so we are looking for a value
      if (key) {
        if (start === undefined) {
          if (s.charAt(pos) === "=") {
            start = pos + 1;
          }
        } else if (s.charAt(pos) === "&") {
        }
      }

      if (foundQuestionMark) {
        if (s.charAt(pos) === "&") {
          // if()
        }
      }
    }

    return urlQuery;
  }
}

/**
 * A simple function!
 */
export type QueryParser<A> = (values: URLQuery) => A;

/**
 * An alias for QueryParser
 */
export type Parser<A> = QueryParser<A>;

export const parse =
  <A>(p: Parser<A>) =>
  (s: string): A | undefined => {
    const urlQuery = URLQuery.fromString(s);
    return urlQuery === undefined ? undefined : p(urlQuery);
  };

////////////////////////////////////////////////////////////////////////////////
// Combinators
////////////////////////////////////////////////////////////////////////////////

/**
 * Handle `string` parameters.
 *
 * @example
 * ```ts
 * const search: Parser<string | undefined> = stringP("search")
 * // ?search=cats             == "cats"
 * // ?search=42               == "42"
 * // ?branch=left             == undefined
 * // ?search=cats&search=dogs == undefined
 * ```
 *
 * @param key - the key to look for
 * @return a parser that succeeds iff only that key is present
 */
export function stringP(key: string): Parser<string | undefined> {
  return customP(key)((stringList) =>
    stringList.length === 1 ? stringList[0] : undefined
  );
}

/**
 * Handle `int` parameters.
 *
 * @example
 * ```ts
 * const page: Parser<number | undefined> = intP("page")
 * // ?page=2        == 2
 * // ?page=17.1     == 17
 * // ?page=two      == undefined
 * // ?sort=date     == undefined
 * // ?page=2&page=3 == undefined
 * ```
 *
 * @param key - the key to look for
 * @return a parser that succeeds iff only that key is present
 */
export function intP(key: string): Parser<number | undefined> {
  return customP(key)((stringList) =>
    stringList.length === 1 ? parseIntSafe(stringList[0]) : undefined
  );
}

function parseIntSafe(s: string): number | undefined {
  try {
    const res = parseInt(s);
    if (isNaN(res)) {
      return undefined;
    }
    return res;
  } catch (err) {
    return undefined;
  }
}

/**
 * Handle `number` parameters.
 *
 * @example
 * ```ts
 * const scale: Parser<number | undefined>  = numberP("scale")
 * // ?scale=2                == 2
 * // ?scale=17.12            == 17.21
 * // ?scale=two              == undefined
 * // ?scale=date             == undefined
 * // ?scale=2.12&scale=3.123 == undefined
 * ```
 *
 * @param key - the key to look for
 * @return a parser that succeeds iff only that key is present
 */
export function numberP(key: string): Parser<number | undefined> {
  return customP(key)((stringList) =>
    stringList.length === 1 ? parseNumberSafe(stringList[0]) : undefined
  );
}

function parseNumberSafe(s: string): number | undefined {
  try {
    const res = Number.parseFloat(s);
    if (isNaN(res)) {
      return undefined;
    }
    return res;
  } catch (err) {
    return undefined;
  }
}

/**
 * Handle enumerated parameters. Maybe you want a true-or-false parameter:
 *
 * @example
 * ```ts
 * debug: Parser<boolean | undefined> =
 *     enum("debug")(({"true" : true, "false": false})
 * // ?debug=true            == true
 * // ?debug=false           == false
 * // ?debug=1               == undefined
 * // ?debug=0               == undefined
 * // ?true=true             == undefined
 * // ?debug=true&debug=true == undefined
 * ```
 *
 * @param key - the key to look for
 * @param enums - a record of string values and what they map to.
 * @return a parser that succeeds iff only that key is present
 */
export const enumP =
  (key: string) =>
  <A>(enums: Record<string, A>): Parser<A | undefined> => {
    return customP(key)((stringList) =>
      stringList.length === 1 ? enums[stringList[0]] : undefined
    );
  };

/**
 * Create a custom query parser. Maybe you want a true-or-false parameter:
 *
 * @example
 *
 * Say you are unlucky enough to need to handle `?post=2&post=7` to show a couple
 * posts on screen at once. You could say:
 *
 * ```ts
 *   posts : Parser (Maybe (List Int))
 *   posts =
 *     custom "post" (List.maybeMap String.toInt)
 *   -- ?post=2        == [2]
 *   -- ?post=2&post=7 == [2, 7]
 *   -- ?post=2&post=x == [2]
 *   -- ?hats=2        == []
 * ```
 *
 * @param key - the key to look for
 * @param enums - a record of string values and what they map to.
 * @return a parser that succeeds iff only that key is present
 */
export const customP =
  (key: string) =>
  <A>(fn: (p: string[]) => A): Parser<A> => {
    return (dict) => fn(lookup(key, dict) ?? []);
  };

function lookup<A>(key: string, record: Record<string, A>): A | undefined {
  return record[key];
}

////////////////////////////////////////////////////////////////////////////////
// Mapping
////////////////////////////////////////////////////////////////////////////////

export const map =
  <A, B>(fn: (a: A) => B) =>
  (p: Parser<A>): Parser<B> => {
    return (dict) => fn(p(dict));
  };

export const map2 =
  <A, B, Result>(fn: (a: A, b: B) => Result) =>
  (p1: Parser<A>) =>
  (p2: Parser<B>): Parser<Result> => {
    return (dict) => fn(p1(dict), p2(dict));
  };

export const map3 =
  <A, B, C, Result>(fn: (a: A, b: B, c: C) => Result) =>
  (p1: Parser<A>) =>
  (p2: Parser<B>) =>
  (p3: Parser<C>): Parser<Result> => {
    return (dict) => fn(p1(dict), p2(dict), p3(dict));
  };
