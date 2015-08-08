let list = [];

export function describe (desc, fn) {
  list.push(desc);
  this.describe = this.context = describe.bind(this);
  this.it = (d, f) => {
    if (f.length <= 1) {
      Tinytest.add(list.concat(d).join(" - "), f);
    } else {
      Tinytest.addAsync(list.concat(d).join(" - "), f);
    }
  };
  fn.bind(this)();
  list.pop();
}
