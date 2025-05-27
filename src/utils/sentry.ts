import * as Sentry from '@sentry/nextjs';

type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'log';

export function logToSentry(
  message: string,
  category: string = 'general',
  data?: Record<string, any>,
  LogLevel: LogLevel = 'info',
  error?: unknown

) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: LogLevel,
    data
  });

  if (error) {
    Sentry.captureException(error);
  } 
}