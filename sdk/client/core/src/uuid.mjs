export class UUID {
  static generate = prefix => {
    return `${prefix ? `${prefix}-` : ''}xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}