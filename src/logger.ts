/**
 * 日志记录器接口
 *
 * Logger interface
 */
export interface ILogger {
  trace(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}
