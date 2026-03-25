export const sanitizeText = (value = '') =>
  String(value)
    .trim()
    .replace(/[<>]/g, '');
