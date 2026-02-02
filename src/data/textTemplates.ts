/**
 * Text template configuration for the wedding card editor
 * Centralized location for all text templates
 */

export interface TextTemplate {
  id: string;
  name: string;
  content: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  previewStyle?: React.CSSProperties;
}

/**
 * Available text templates for the editor
 * Add or modify templates here for easier maintenance
 */
export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: "adventure",
    name: "Adventure",
    content: "ADVENTURE",
    fontSize: 36,
    fontWeight: 700,
    fontFamily: "Brush Script MT",
    previewStyle: {
      fontFamily: "Brush Script MT, cursive",
      fontStyle: "italic",
    },
  },
  {
    id: "wedding_title",
    name: "Tiêu đề thiệp cưới",
    content: "THIỆP MỜI CƯỚI",
    fontSize: 48,
    fontWeight: 700,
    fontFamily: "Playfair Display",
    previewStyle: {
      fontFamily: "Playfair Display, serif",
      letterSpacing: "2px",
    },
  },
  {
    id: "couple_names",
    name: "Tên cặp đôi",
    content: "Anh & Em",
    fontSize: 42,
    fontWeight: 600,
    fontFamily: "Dancing Script",
    previewStyle: {
      fontFamily: "Dancing Script, cursive",
    },
  },
  {
    id: "romantic_quote",
    name: "Lời nhắn lãng mạn",
    content: "Tình yêu là hạnh phúc",
    fontSize: 24,
    fontWeight: 400,
    fontFamily: "Great Vibes",
    previewStyle: {
      fontFamily: "Great Vibes, cursive",
      fontStyle: "italic",
    },
  },
  {
    id: "invitation_text",
    name: "Lời mời",
    content: "Trân trọng kính mời",
    fontSize: 20,
    fontWeight: 500,
    fontFamily: "Cormorant Garamond",
    previewStyle: {
      fontFamily: "Cormorant Garamond, serif",
    },
  },
  {
    id: "date_time",
    name: "Ngày giờ",
    content: "10:00 | 15/02/2026",
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "Lora",
    previewStyle: {
      fontFamily: "Lora, serif",
      letterSpacing: "1px",
    },
  },
  {
    id: "venue",
    name: "Địa điểm",
    content: "Nhà hàng tiệc cưới ABC",
    fontSize: 16,
    fontWeight: 400,
    fontFamily: "Montserrat",
    previewStyle: {
      fontFamily: "Montserrat, sans-serif",
    },
  },
  {
    id: "thank_you",
    name: "Lời cảm ơn",
    content: "Cảm ơn sự hiện diện của bạn",
    fontSize: 18,
    fontWeight: 300,
    fontFamily: "Raleway",
    previewStyle: {
      fontFamily: "Raleway, sans-serif",
      fontStyle: "italic",
    },
  },
  {
    id: "save_date",
    name: "Save The Date",
    content: "SAVE THE DATE",
    fontSize: 32,
    fontWeight: 700,
    fontFamily: "Bebas Neue",
    previewStyle: {
      fontFamily: "Bebas Neue, cursive",
      letterSpacing: "3px",
    },
  },
  {
    id: "formal_greeting",
    name: "Lời chào trang trọng",
    content: "Kính gửi quý khách",
    fontSize: 22,
    fontWeight: 500,
    fontFamily: "Crimson Text",
    previewStyle: {
      fontFamily: "Crimson Text, serif",
    },
  },
  {
    id: "blessing",
    name: "Lời chúc phúc",
    content: "Chúc mừng hạnh phúc",
    fontSize: 26,
    fontWeight: 600,
    fontFamily: "Parisienne",
    previewStyle: {
      fontFamily: "Parisienne, cursive",
    },
  },
  {
    id: "modern_title",
    name: "Tiêu đề hiện đại",
    content: "WE'RE GETTING MARRIED",
    fontSize: 28,
    fontWeight: 600,
    fontFamily: "Poppins",
    previewStyle: {
      fontFamily: "Poppins, sans-serif",
      letterSpacing: "2px",
    },
  },
  {
    id: "classic_monogram",
    name: "Chữ viết tắt tên",
    content: "A & E",
    fontSize: 64,
    fontWeight: 700,
    fontFamily: "Cinzel",
    previewStyle: {
      fontFamily: "Cinzel, serif",
      letterSpacing: "4px",
    },
  },
];
