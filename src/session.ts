export type BaseDataType = { [key: string]: any };

export class Session<DataType extends BaseDataType> {
  #data: DataType;
  #flash = {};

  constructor(data = {} as DataType, flash: any = {}) {
    this.#data = data;
    this.#flash = flash;
  }

  get data() {
    return this.#data;
  }

  get flashedData() {
    return this.#flash;
  }

  set(key: keyof DataType, value: any) {
    if (typeof value === "function") {
      value = value(this.get(key));
    }

    this.#data[key] = value;

    return this;
  }

  get(key: keyof DataType) {
    return this.#data[key];
  }

  has(key: string) {
    return !!this.#data[key];
  }

  clear() {
    return new self();
  }

  flash(key: string, value?: any) {
    if (value === undefined) {
      const flashedValue = this.#flash[key];

      delete this.#flash[key];

      return flashedValue;
    }

    this.#flash[key] = value;

    return this;
  }

  toJSON() {
    return {
      data: this.#data,
      flash: this.#flash,
    };
  }
}
