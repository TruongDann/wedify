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
      fontFamily: "Kaushan Script, cursive",
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
    content: "10:00\n15/02/2026",
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "Lora",
    previewStyle: {
      fontFamily: "Lora, serif",
      letterSpacing: "0.5px",
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
      letterSpacing: "1px",
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
  {
    id: "wedding_ceremony",
    name: "Lễ thành hôn",
    content: "LỄ THÀNH HÔN",
    fontSize: 34,
    fontWeight: 600,
    fontFamily: "Cinzel",
    previewStyle: {
      fontFamily: "Cinzel, serif",
      letterSpacing: "0.5px",
    },
  },
  {
    id: "wedding_of",
    name: "Thiệp cưới",
    content: "THE WEDDING\nOF",
    fontSize: 30,
    fontWeight: 500,
    fontFamily: "Cormorant Garamond",
    previewStyle: {
      fontFamily: "Cormorant Garamond, serif",
      letterSpacing: "1px",
    },
  },
  {
    id: "forever",
    name: "Mãi bên nhau",
    content: "Mãi bên nhau",
    fontSize: 42,
    fontWeight: 400,
    fontFamily: "Dancing Script",
    previewStyle: {
      fontFamily: "Dancing Script, cursive",
    },
  },
  {
    id: "happy_day",
    name: "Ngày hạnh phúc",
    content: "Ngày hạnh phúc",
    fontSize: 38,
    fontWeight: 400,
    fontFamily: "Allison",
    previewStyle: {
      fontFamily: "Allison, cursive",
    },
  },
  {
    id: "welcome_wedding",
    name: "Chào mừng",
    content: "WELCOME TO\nOUR WEDDING",
    fontSize: 26,
    fontWeight: 500,
    fontFamily: "Prata",
    previewStyle: {
      fontFamily: "Prata, serif",
      letterSpacing: "0.5px",
    },
  },
  {
    id: "with_love",
    name: "Gửi yêu thương",
    content: "With love",
    fontSize: 48,
    fontWeight: 400,
    fontFamily: "Parisienne",
    previewStyle: {
      fontFamily: "Parisienne, cursive",
    },
  },
  {
    id: "our_story",
    name: "Chuyện chúng mình",
    content: "OUR STORY",
    fontSize: 34,
    fontWeight: 600,
    fontFamily: "Josefin Sans",
    previewStyle: {
      fontFamily: "Josefin Sans, sans-serif",
      letterSpacing: "1px",
    },
  },
  {
    id: "wedding_date",
    name: "Ngày trọng đại",
    content: "20 · 05 · 2027",
    fontSize: 28,
    fontWeight: 500,
    fontFamily: "Playfair Display",
    previewStyle: {
      fontFamily: "Playfair Display, serif",
      letterSpacing: "0.5px",
    },
  },
  {
    id: "happily_ever_after",
    name: "Hạnh phúc trăm năm",
    content: "Hạnh phúc\ntrăm năm",
    fontSize: 36,
    fontWeight: 400,
    fontFamily: "Cormorant Garamond",
    previewStyle: {
      fontFamily: "Cormorant Garamond, serif",
      fontStyle: "italic",
    },
  },
];
