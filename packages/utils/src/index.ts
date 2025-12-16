/**
 * 合并两个对象，返回一个新的对象，包含两个对象的所有属性。
 *
 * 当属性名冲突时，后者的属性值会覆盖前者的属性值。
 *
 * merge two objects into a new object.
 *
 * When there are conflicting property names, the value from the latter object will overwrite the value from the former object.
 * @param a
 * @param b
 * @returns 合并后的新对象 / the merged new object
 */
export function merge<T extends object, U extends object>(a: T, b: U): T & U {
    return { ...a, ...b };
}
