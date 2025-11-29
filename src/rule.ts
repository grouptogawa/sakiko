import type { SakikoMessageEvent } from "./builtin";
import type { EventHandleContext } from "./bus";

/**
 * 检查事件的消息是否以指定的字符串开头
 *
 * Check if the message of the event starts with the specified string
 * @param template 字符串数组 String array
 * @param ignoreCase 是否忽略大小写 Whether to ignore case
 * @returns 事件处理函数 Event handler function
 */
export function startwith<T extends SakikoMessageEvent = SakikoMessageEvent>(
  template: string[],
  ignoreCase: boolean = true
): (event: T, ctx: EventHandleContext) => Promise<boolean> {
  return async (event: T, ctx: EventHandleContext) => {
    const message = event.getPlainText();
    for (let t of template) {
      if (ignoreCase) t = t.toLowerCase();
      if (message.startsWith(t)) {
        ctx.matchedText = t;
        return true;
      }
    }
    return false;
  };
}

/**
 * 检查事件的消息是否以指定的字符串结尾
 *
 * Check if the message of the event ends with the specified string
 * @param template 字符串数组 String array
 * @param ignoreCase 是否忽略大小写 Whether to ignore case
 * @returns 事件处理函数 Event handler function
 */
export function endwith<T extends SakikoMessageEvent = SakikoMessageEvent>(
  template: string[],
  ignoreCase: boolean = true
): (event: T, ctx: EventHandleContext) => Promise<boolean> {
  return async (event: T, ctx: EventHandleContext) => {
    const message = event.getPlainText();
    for (let t of template) {
      if (ignoreCase) t = t.toLowerCase();
      if (message.endsWith(t)) {
        ctx.matchedText = t;
        return true;
      }
    }
    return false;
  };
}

/**
 * 检查事件的消息是否完全匹配指定的字符串
 *
 * Check if the message of the event fully matches the specified string
 * @param template 字符串数组 String array
 * @param ignoreCase 是否忽略大小写 Whether to ignore case
 * @returns 事件处理函数 Event handler function
 */
export function fullmatch<T extends SakikoMessageEvent = SakikoMessageEvent>(
  template: string[],
  ignoreCase: boolean = true
): (event: T, ctx: EventHandleContext) => Promise<boolean> {
  return async (event: T, ctx: EventHandleContext) => {
    const message = event.getPlainText();
    for (let t of template) {
      if (ignoreCase) t = t.toLowerCase();
      if (message === t) {
        ctx.matchedText = t;
        return true;
      }
    }
    return false;
  };
}

/**
 * 检查事件的消息是否包含指定的字符串
 *
 * Check if the message of the event contains the specified string
 * @param template 字符串数组 String array
 * @param ignoreCase 是否忽略大小写 Whether to ignore case
 * @returns 事件处理函数 Event handler function
 */
export function keyword<T extends SakikoMessageEvent = SakikoMessageEvent>(
  template: string[],
  ignoreCase: boolean = true
): (event: T, ctx: EventHandleContext) => Promise<boolean> {
  return async (event: T, ctx: EventHandleContext) => {
    const message = event.getPlainText();
    for (let t of template) {
      if (ignoreCase) t = t.toLowerCase();
      if (message.includes(t)) {
        ctx.matchedText = t;
        return true;
      }
    }
    return false;
  };
}

/**
 * 检查事件的消息是否匹配指定的正则表达式
 *
 * Check if the message of the event matches the specified regular expression
 * @param regex 正则表达式 Regular expression
 * @returns 事件处理函数 Event handler function
 */
export function regex<T extends SakikoMessageEvent = SakikoMessageEvent>(
  regex: RegExp
): (event: T, ctx: EventHandleContext) => Promise<boolean> {
  return async (event: T, ctx: EventHandleContext) => {
    const match = event.getPlainText().match(regex);
    if (!match) return false;
    ctx.matchedText = match[0];
    ctx.regexGroup = match.slice(1);
    if (match.groups) ctx.regexDict = { ...match.groups };
    return true;
  };
}

// TODO: 实现模糊匹配能力

/**
 * 检查事件是否是直接发送给机器人的消息
 *
 * Check if the event is a direct message to the bot
 * @returns 事件处理函数 Event handler function
 */
export function toMe<T extends SakikoMessageEvent = SakikoMessageEvent>(): (
  event: T
) => Promise<boolean> {
  return async (event: T) => {
    return event.toMe();
  };
}
