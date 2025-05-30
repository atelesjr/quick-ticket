import * as Sentry from '@sentry/nextjs';

type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'log';

export function logEvent(
  message: string,
  category: string = 'general',
  data?: Record<string, any>,
  level: LogLevel = 'info',
  error?: unknown

) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });

  if (error) {
    Sentry.captureException(error);
  } 

  Sentry.captureMessage(message, level);
}