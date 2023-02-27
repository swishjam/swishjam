class UuidGenerator {
  static generate(prefix) {
    return `${prefix}-${Date.now()}-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

module.exports = { UuidGenerator };