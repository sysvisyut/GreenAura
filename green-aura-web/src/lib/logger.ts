type LogLevel = "debug" | "info" | "warn" | "error";

const isDebugEnabled = () => {
  if (typeof window !== "undefined") {
    return (
      (globalThis as unknown as { __DEBUG__?: boolean }).__DEBUG__ === true ||
      process.env.NEXT_PUBLIC_DEBUG_LOGS === "1"
    );
  }
  return process.env.NEXT_PUBLIC_DEBUG_LOGS === "1";
};

function formatMessage(level: LogLevel, namespace: string, message: unknown, extra?: unknown) {
  const time = new Date().toISOString();
  const base = `[${time}] [${namespace}] [${level.toUpperCase()}]`;
  return extra !== undefined ? [base, message, extra] : [base, message];
}

export function createLogger(namespace: string) {
  return {
    debug: (message: unknown, extra?: unknown) => {
      if (!isDebugEnabled()) return;
      // eslint-disable-next-line no-console
      console.debug(...formatMessage("debug", namespace, message, extra));
    },
    info: (message: unknown, extra?: unknown) => {
      // eslint-disable-next-line no-console
      console.info(...formatMessage("info", namespace, message, extra));
    },
    warn: (message: unknown, extra?: unknown) => {
      // eslint-disable-next-line no-console
      console.warn(...formatMessage("warn", namespace, message, extra));
    },
    error: (message: unknown, extra?: unknown) => {
      // eslint-disable-next-line no-console
      console.error(...formatMessage("error", namespace, message, extra));
    },
  } as const;
}
