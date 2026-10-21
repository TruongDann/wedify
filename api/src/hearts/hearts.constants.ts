// Bang gia / quy doi tim. Co the doi qua bien moi truong, khong can sua code.
export const DEFAULT_HEART_BUY_VND = 1000; // khach nap 1.000đ -> 1 tim
export const DEFAULT_HEART_CASHOUT_VND = 700; // host doi 1 tim nhan duoc -> 700đ (nen tang giu 30%)

export const HEART_PACKAGES = [10, 20, 50, 100, 200, 500];
export const MIN_TOPUP_HEARTS = 10;
export const MAX_TOPUP_HEARTS = 10000;

export const DEFAULT_GIFT_ITEMS = [
  { code: 'heart-burst', name: 'Bắn tim', emoji: '💘', heartPrice: 5, animationType: 'hearts', sortOrder: 1 },
  { code: 'love-lock', name: 'Khoá tình yêu', emoji: '🔐', heartPrice: 10, animationType: 'hearts', sortOrder: 2 },
  { code: 'sweet-cake', name: 'Bánh ngọt', emoji: '🎂', heartPrice: 20, animationType: 'confetti', sortOrder: 3 },
  { code: 'party-popper', name: 'Pháo mừng', emoji: '🎉', heartPrice: 30, animationType: 'confetti', sortOrder: 4 },
  { code: 'fireworks', name: 'Pháo hoa', emoji: '🎆', heartPrice: 50, animationType: 'fireworks', sortOrder: 5 },
  { code: 'champagne', name: 'Rượu mừng', emoji: '🍾', heartPrice: 80, animationType: 'confetti', sortOrder: 6 },
  { code: 'love-hearts', name: 'Trái tim', emoji: '💕', heartPrice: 100, animationType: 'hearts', sortOrder: 7 },
  { code: 'lucky-money', name: 'Lì xì', emoji: '🧧', heartPrice: 200, animationType: 'fireworks', sortOrder: 8 },
];
