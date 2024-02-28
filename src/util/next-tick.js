
let callbacks = [];

let waiting = false;
function flushCallback() {
  callbacks.forEach(cb => cb());
  waiting = false;
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (waiting === false) {
    setTimeout(flushCallback, 0);
    waiting = true;
  }
}