// server/utils/commons/keyParser.js

/**
 * Parses a PEM formatted key string, replacing escaped newline characters ('\\n') with actual newline characters ('\n').
 * This is useful when PEM keys are read from environment variables or .env files, where newlines might be escaped.
 *
 * @param {string} key - The PEM key string, potentially with escaped newlines.
 * @returns {string|undefined} The parsed PEM key string with real newlines, or undefined if the input is falsy.
 */
export function parsePemKey(key) {
    if (!key) {
        return undefined;
    }
    return key.replace(/\\n/g, '\n');
}
