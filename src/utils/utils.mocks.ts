export class MockResponse {
  public cookies: any;

  public value: any;

  constructor() {
    this.cookies = {};
    this.value = {};
  }

  public cookie(key: string, val: string) {
    this.cookies[key] = val;
  }

  public json(obj: any) {
    this.value = obj;
  }
}
