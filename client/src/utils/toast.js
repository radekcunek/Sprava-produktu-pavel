const listeners = new Set();

function emit(toast) {
  listeners.forEach((fn) => fn(toast));
}

export const toast = {
  success: (message) => emit({ type: "success", message, id: Date.now() }),
  error:   (message) => emit({ type: "error",   message, id: Date.now() }),
  info:    (message) => emit({ type: "info",    message, id: Date.now() }),
  warning: (message) => emit({ type: "warning", message, id: Date.now() }),
};

export function onToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
