/*
  Renames directories under public/konfigurator/dywaniki to English equivalents.
  Only affects folder names; does not modify any code.
*/

const fs = require('fs');
const path = require('path');

function safeRename(fromPath, newName) {
  if (!fs.existsSync(fromPath)) return;
  const dir = path.dirname(fromPath);
  const toPath = path.join(dir, newName);
  if (fromPath === toPath) return;
  if (fs.existsSync(toPath)) return; // avoid collisions
  fs.renameSync(fromPath, toPath);
}

function mapColor(pl) {
  const map = {
    bezowy: 'beige',
    bezowe: 'beige',
    bordowe: 'maroon',
    brazowy: 'brown',
    brazowe: 'brown',
    ciemnoszary: 'darkgrey',
    ciemnoszare: 'darkgrey',
    czarne: 'black',
    czerwone: 'red',
    fioletowy: 'purple',
    fioletowe: 'purple',
    granatowy: 'darkblue',
    granatowe: 'darkblue',
    jasnoszary: 'lightgrey',
    jasnoszare: 'lightgrey',
    niebieski: 'blue',
    niebieskie: 'blue',
    pomaranczowe: 'orange',
    rozowy: 'pink',
    rozowe: 'pink',
    zielony: 'green',
    zielone: 'green',
    zolte: 'yellow'
  };
  return map[pl] || pl;
}

const base = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki');

// 3D structure folders
safeRename(path.join(base, '3d', 'plaster'), 'honey');
safeRename(path.join(base, '3d', 'romby'), 'diamonds');

// 3D color folders
['honey', 'diamonds'].forEach((struct) => {
  const structPath = path.join(base, '3d', struct);
  if (fs.existsSync(structPath)) {
    for (const entry of fs.readdirSync(structPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const en = mapColor(entry.name);
      if (en !== entry.name) {
        safeRename(path.join(structPath, entry.name), en);
      }
    }
  }
});

// classic root
safeRename(path.join(base, 'klasyczne'), 'classic');

// classic structure folders
safeRename(path.join(base, 'classic', 'plaster miodu'), 'honeycomb');
safeRename(path.join(base, 'classic', 'romby'), 'diamonds');

// classic/honeycomb folders: "plaster X obszycie" and "plaster czarne"
const hc = path.join(base, 'classic', 'honeycomb');
if (fs.existsSync(hc)) {
  for (const entry of fs.readdirSync(hc, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name === 'plaster czarne') {
      safeRename(path.join(hc, name), 'honey black');
      continue;
    }
    const m = name.match(/^plaster (.+) obszycie$/);
    if (m) {
      const en = mapColor(m[1]);
      safeRename(path.join(hc, name), `honey ${en} trim`);
    }
  }
}

// classic/diamonds folders: "romby X"
const cd = path.join(base, 'classic', 'diamonds');
if (fs.existsSync(cd)) {
  for (const entry of fs.readdirSync(cd, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const m = entry.name.match(/^romby (.+)$/);
    if (m) {
      const en = mapColor(m[1]);
      safeRename(path.join(cd, entry.name), `diamonds ${en}`);
    }
  }
}

console.log('Renames completed.');


