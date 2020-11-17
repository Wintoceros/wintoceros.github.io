// eslint-disable-next-line prefer-destructuring
const form = document.forms[0],
      speciesInput = document.getElementById("species"),
      isGhostCheckBox = document.getElementById("isGhost"),
      abilitySelect = document.getElementById("ability"),
      hpInput = document.getElementById("hp"),
      minInput = document.getElementById("min-lvl"),
      maxInput = document.getElementById("max-lvl"),
      jsonOutput = document.querySelector("pre"),
      clipboardAction = document.getElementById("clipboard-button"),
      copiedButton = clipboardAction.cloneNode(true);

/* eslint-disable no-magic-numbers, indent */
const gensEnd = [
        152,
        252,
        387,
        494,
        560,
      ],
      ghostMask = 0b1000,
      getAbilityMask = shifts => 1 << shifts >> 1;
/* eslint-enable no-magic-numbers, indent */
let first = true;

function objToJSONCode (obj) {
  const code = document.createElement("code");

  code.textContent = JSON.stringify(obj);

  return code;
}

function getGen (id) {
  const n = parseInt(id, 10);

  return gensEnd.findIndex(number => n < number) + 1;
}

form.addEventListener("submit", evt => {
  evt.preventDefault();
  const id = speciesInput.value;

  const mon = {
    id,
    hindranceMask: (isGhostCheckBox.checked
      ? ghostMask
      : 0b0000) + getAbilityMask(abilitySelect.value),
    hp: hpInput.value,
    "level-range": [ parseInt(minInput.value, 10), parseInt(maxInput.value, 10) ],
    generation: getGen(id),
    species: { english: "", french: "", spanish: "", german: "" },
  };

  console.log(mon);

  if (first) {
    while (jsonOutput.hasChildNodes())
      jsonOutput.removeChild(jsonOutput.firstChild);
    first = false;
  }
  jsonOutput.append(
    objToJSONCode(mon),
    "\n",
  );
}, false);

clipboardAction.addEventListener("click", () => {
  window.getSelection().selectAllChildren(jsonOutput);
  document.execCommand("copy");
  clipboardAction.textContent = "C'est dans le presse-papiers !";
  first = true;
  clipboardAction.disabled = true;
  setTimeout(() => {
    clipboardAction.parentNode.replaceChild(copiedButton, clipboardAction);
    clipboardAction.disabled = false;
  }, 1000); // eslint-disable-line no-magic-numbers
}, false);
