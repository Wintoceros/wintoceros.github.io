const rateURL = "rates.ndjson";
const languageSwitcher = document.getElementById("language-switch"),
      output= document.getElementById("progress-output"),
      form = document.forms[0],
      select = document.getElementById("species-select"),
      optionTemplate = document.getElementById("species-option");
let language = "english";

languageSwitcher.addEventListener("click", (evt) => {
  evt.preventDefault();

  const { target } = evt;

  ({ language } = target.dataset);
  console.log(language);
}, false);

function calcHP (base, level) {
  // eslint-disable-next-line no-magic-numbers
  return Math.floor((2 * base + 31) * level / 100) + level + 10;
}

// <https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read#Example_2_-_handling_text_line_by_line>
/**
 * Yields `JSON.parse`d values from a readableStream.reader outputting NDJSON data
 *
 * @param {ReadableStreamReader} reader - The reader of a readable stream. For example `response.body.getReader()`
 * @yields {any} A value out of a line of a NDJSON
 * @returns {AsyncGenerator<any>} -
 */
async function* yieldNDJSON (reader) {
  const utf8Decoder = new TextDecoder("utf-8"),
        newlineRe = /\r?\n/gmu;
  let { value, done } = await reader.read(),
      chunk;

  chunk = value
    ? utf8Decoder.decode(value)
    : "";

  let startIndex = 0;

  for (;;) {
    const lineToken = newlineRe.exec(chunk);

    if (lineToken) {
      yield JSON.parse(chunk.substring(startIndex, lineToken.index));
      startIndex = newlineRe.lastIndex;
      continue;
    }
    if (done)
      break;

    const remainder = chunk.substring(startIndex);

    // eslint-disable-next-line no-await-in-loop
    ({ value, done } = await reader.read());
    chunk = remainder + (value
      ? utf8Decoder.decode(value)
      : ""
    );
    newlineRe.lastIndex = 0;
    startIndex = 0;
  }

  // last line didn't end in a newline char
  if (startIndex < chunk.length)
    yield JSON.parse(chunk.substring(startIndex));
}

/**
 * Yields line by line data of a .ndjson URL. See `yieldNDJSON`
 *
 * @param {RequestInfo} url - The URL to fetch info from
 * @returns {AsyncGenerator<any>} -
 */
async function* yieldInfo (url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/x-ndjson",
    },
  });

  yield* yieldNDJSON(response.body.getReader());
}

(async () => {
  const mons = new Map();

  for await (const mon of yieldInfo(rateURL)) {
    mons.set(mon.id, mon);

    // appendOption(mon);
  }

  output.textContent = "Data fetched";
  setTimeout(() => {
    output.hidden = true;
    form.hidden = false;
  }, 0);

})().catch(console.error);
