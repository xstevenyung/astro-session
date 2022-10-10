export class Session {
  #data = new Map();
  #flash = new Map();

  constructor(data = {}, flash = {}) {
    this.#data = new Map(Object.entries(data));
    this.#flash = new Map(Object.entries(flash));
  }

  get data() {
    return Object.fromEntries(this.#data);
  }

  get flashedData() {
    return Object.fromEntries(this.#flash);
  }

  set(key: string, value: any) {
    if (typeof value === "function") {
      value = value(this.get(key));
    }

    this.#data.set(key, value);

    return this;
  }

  get(key: string) {
    return this.#data.get(key);
  }

  has(key: string) {
    return this.#data.has(key);
  }

  clear() {
    this.#data.clear();
    return this;
  }

  flash(key: string, value?: any) {
    if (value === undefined) {
      const flashedValue = this.#flash.get(key);

      this.#flash.delete(key);

      return flashedValue;
    }

    this.#flash.set(key, value);

    return this;
  }

  toJSON() {
    return {
      data: Object.fromEntries(this.#data),
      flash: Object.fromEntries(this.#flash),
    };
  }
}
