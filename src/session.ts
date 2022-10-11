export type BaseDataType = { [key: string]: any };

export type SetFunction<T> = (value: T) => T;

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

  set(
    key: keyof DataType,
    value: DataType[typeof key] | SetFunction<DataType[typeof key]>
  ) {
    if (typeof value === "function") {
      const fn: SetFunction<DataType[typeof key]> = value;
      value = fn(this.get(key));
    }

    // We force value type as the condition above is not enough for typescript to infer type
    this.#data[key] = value as DataType[typeof key];

    return this;
  }

  get(key: keyof DataType) {
    return this.#data[key];
  }

  has(key: keyof DataType) {
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
