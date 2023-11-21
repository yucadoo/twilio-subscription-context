export default class {
  constructor(keywords) {
    this.keywords = keywords.map(keyword => this.constructor.normalize(keyword));
  }

  detect(content) {
    const normalizedContent = this.constructor.normalize(content);
    return this.keywords.some(keyword => normalizedContent === keyword);
  }

  static normalize(text) {
    return text.trim().toLowerCase();
  }
}
