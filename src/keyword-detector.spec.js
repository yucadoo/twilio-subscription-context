import KeywordDetector from './keyword-detector';

/** @test {KeywordDetector} */
describe('KeywordDetector', () => {
  it('detects exact match', () => {
    const detector = new KeywordDetector(['test']);
    expect(detector.detect('test')).toBe(true);
  });

  it('detects difference', () => {
    const detector = new KeywordDetector(['test']);
    expect(detector.detect('different')).toBe(false);
  });

  it('detects one match among many', () => {
    const detector = new KeywordDetector(['a', 'b']);
    expect(detector.detect('b')).toBe(true);
  });

  it('is case insensitive', () => {
    const detector = new KeywordDetector(['test']);
    expect(detector.detect('tEsT')).toBe(true);
  });

  it('trimms content', () => {
    const detector = new KeywordDetector(['test']);
    expect(detector.detect(' test ')).toBe(true);
  });
});
