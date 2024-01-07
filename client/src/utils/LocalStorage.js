class LocalStorage {
  static get(key) {
    const isValue = localStorage.getItem(key);
    return isValue ? JSON.parse(isValue) : null;
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
export default LocalStorage;
