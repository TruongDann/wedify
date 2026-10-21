/**
 * Mẫu "Fall in love" — thiệp dài một trang cuộn, ảnh cưới ngoài trời, chữ viết tay đỏ.
 * Bố cục dựng theo kiểu thiệp cuộn phổ biến (ảnh lớn đầu trang, chuyện tình, lịch, đếm ngược,
 * bản đồ, xác nhận tham dự). Ảnh từ Unsplash (giấy phép Unsplash), họa tiết trong public/assets/images/decor,
 * font Google Fonts; lời văn, tên và địa chỉ là nội dung mẫu để người dùng thay.
 */

import type { Template } from "@/types/editor";
import { DEFAULT_MEDIA } from "@/components/widgets/widgetModel";
import { GUEST_NAME_TOKEN } from "@/components/card/guestName";
import { WHITE, anim, createBuilder, unsplash } from "./templateBuilder";

const RED = "#b70000";

const PHOTO = {
  hero: unsplash("1537633552985-df8429e8048b"),
  field: unsplash("1532712938310-34cb3982ef74"),
  forest: unsplash("1591604466107-ec97de577aff", 800),
  bride: unsplash("1583939003579-730e3918a45a", 800),
  chairs: unsplash("1522673607200-164d1b6ce486", 800),
  heartHands: unsplash("1516589178581-6cd7833ae3b2", 900),
  bouquet: unsplash("1525258946800-98cfd641d0de", 500),
  couple: unsplash("1550005809-91ad75fb315f", 500),
  monochrome: unsplash("1460978812857-470ed1c77af0"),
  rings: unsplash("1606800052052-a08af7148866", 400),
  hands: unsplash("1511285560929-80b456fea0bc", 400),
  holdHands: unsplash("1520854221256-17451cc331bf", 800),
  aisle: unsplash("1469371670807-013ccf25f16a"),
  evening: unsplash("1519741497674-611481863552"),
};

const { elements, text, photo, decor, widget } = createBuilder("fil", "2027-05-20T11:00");

// ---------------------------------------------------------------------------
// 1. Ảnh bìa + lời chào
// ---------------------------------------------------------------------------
photo(PHOTO.hero, [0, 0, 500, 845], "fadeIn", 0, { filters: { brightness: 92, contrast: 100, saturation: 100, blur: 0, grayscale: 0 } });
text("Hai trái tim, một mái nhà,\nvà cả một đời bên nhau.", [10, 14, 480, 44], { font: "Quicksand", size: 16, color: WHITE, bold: true });
text("Welcome to our wedding", [70, 110, 360, 44], { font: "Prata", size: 26, color: WHITE });
text("We got married", [10, 278, 230, 60, 17], { font: "Allison", size: 46, color: WHITE }, "slideRight");
text("Minh Anh", [40, 662, 150, 32], { font: "Prata", size: 26, color: WHITE }, "slideRight");
text("BRIDE", [55, 706, 120, 30], { font: "Italiana", size: 24, color: WHITE, spacing: 2 }, "slideRight");
text("Hoàng Nam", [300, 662, 170, 32], { font: "Prata", size: 26, color: WHITE }, "slideLeft");
text("GROOM", [325, 706, 120, 30], { font: "Italiana", size: 24, color: WHITE, spacing: 2 }, "slideLeft");
text("2027.05.20", [136, 790, 228, 32], { font: "Italiana", size: 26, color: WHITE, spacing: 2 });

// Dải chữ dưới ảnh bìa
text("WEDDING", [0, 851, 160, 30], { font: "Italiana", size: 20, spacing: 2 }, "slideRight");
text("INVITATION", [170, 851, 160, 30], { font: "Italiana", size: 20, spacing: 2 });
text("2027", [370, 851, 120, 30], { font: "Italiana", size: 20, spacing: 2 }, "slideLeft");

// ---------------------------------------------------------------------------
// 2. Ảnh ngang + lời cảm ơn
// ---------------------------------------------------------------------------
photo(PHOTO.field, [0, 884, 500, 284]);
text("Right love | Right reason | Right time", [10, 1066, 480, 30], { font: "Italiana", size: 22, color: WHITE, spacing: 1 });
text("Cảm ơn gia đình và bạn bè đã luôn ở bên,\nđể hôm nay chúng mình được về chung một nhà.", [20, 1110, 460, 44], { font: "Quicksand", size: 14, color: WHITE, bold: true });

// ---------------------------------------------------------------------------
// 3. Chuyện tình
// ---------------------------------------------------------------------------
text("OUR LOVE STORY", [10, 1205, 480, 36], { font: "Prata", size: 30, spacing: 2 });
text("Fall in love", [270, 1250, 110, 28], { font: "Quicksand", size: 16 });
photo(PHOTO.forest, [59, 1313, 382, 248]);
text("Sweet", [262, 1510, 230, 100, -23], { font: "Mrs Saint Delafield", size: 90, color: "#d63030" }, "slideLeft");

decor("laurel-left", [168, 1645, 28, 56]);
text("WEDDING\nINVITATION", [180, 1645, 140, 56], { font: "Prata", size: 18, lineHeight: 1.4 });
decor("laurel-right", [304, 1645, 28, 56]);
text(
  "Có những ngày bình thường bỗng trở nên đặc biệt,\nchỉ vì có một người cùng mình đi qua.\nChúng mình đã cùng nhau qua bao mùa nắng mưa,\nvà giờ đây muốn được nắm tay nhau thật lâu.\nRất mong bạn sẽ đến chung vui\ntrong ngày trọng đại của hai đứa.",
  [10, 1730, 480, 180],
  { font: "Cormorant Garamond", size: 18, lineHeight: 1.5 },
);
text("2027.05.20", [146, 1935, 208, 30], { font: "Italiana", size: 24, spacing: 2 });
text("Hẹn gặp bạn trong ngày vui của chúng mình nhé!", [25, 2000, 450, 34], { font: "Prata", size: 18 });

// ---------------------------------------------------------------------------
// 4. Ảnh dọc trên nền giọt mềm, chữ đứng
// ---------------------------------------------------------------------------
decor("blob-soft", [40, 2130, 300, 300]);
photo(PHOTO.bride, [91, 2169, 385, 544]);
text("Our\nlove story", [230, 2080, 250, 120], { font: "Ephesis", size: 48, color: "#c91212", lineHeight: 1, shadow: true });
text("Love is patient, love is kind.", [-158, 2298, 425, 36, 90], { font: "Allison", size: 34 }, "slideRight");
photo(PHOTO.chairs, [10, 2624, 392, 219]);
text("05.20", [385, 2750, 110, 44, 90], { font: "Bodoni Moda", size: 26, spacing: 3 }, "slideLeft");

// ---------------------------------------------------------------------------
// 5. Fall in love
// ---------------------------------------------------------------------------
decor("doves", [16, 2895, 100, 62], "slideRight");
text("FALL IN\nLOVE", [121, 2890, 140, 72], { font: "Playfair Display", size: 28, color: "#5c5c5c", align: "left", lineHeight: 1.2 });
text("Dù đi bao xa, cuối con đường\nvẫn là chúng ta bên nhau.", [36, 2995, 428, 50], { font: "Cormorant Garamond", size: 19 });
text("YOU ARE", [30, 3103, 110, 27], { font: "Playfair Display", size: 20, color: "#434343" }, "slideRight");
text("MY DEAREST", [170, 3103, 170, 27], { font: "Playfair Display", size: 20, color: "#434343" });
text("LOVE", [380, 3103, 90, 27], { font: "Playfair Display", size: 20, color: "#434343" }, "slideLeft");
photo(PHOTO.heartHands, [37, 3137, 425, 565]);
text("Love & forever\nyou and me", [50, 3705, 400, 140], { font: "Allison", size: 64, color: RED, lineHeight: 1 });
text(
  "Gặp nhau giữa muôn người là duyên,\nở lại bên nhau qua năm tháng là lựa chọn.\nCảm ơn vì đã chọn nhau mỗi ngày —\nvà cảm ơn bạn đã đến để cùng chứng kiến.",
  [18, 3850, 464, 110],
  { font: "Cormorant Garamond", size: 18, lineHeight: 1.5 },
);

// ---------------------------------------------------------------------------
// 6. Thông tin cưới + 2 ảnh dọc
// ---------------------------------------------------------------------------
decor("divider-flourish", [100, 3962, 300, 40]);
text("LOVE", [20, 4010, 100, 25], { font: "Playfair Display", size: 20, color: "#8c8c8c" }, "slideRight");
text("WEDDING", [160, 4010, 180, 25], { font: "Playfair Display", size: 20, color: "#8c8c8c" });
text("INFORMATION", [300, 4010, 190, 25], { font: "Playfair Display", size: 20, color: "#8c8c8c" }, "slideLeft");
photo(PHOTO.bouquet, [29, 4057, 208, 293], "slideRight");
photo(PHOTO.couple, [262, 4057, 208, 293], "slideLeft");
text("Two hearts, one home, a lifetime of little moments.\nThank you for being part of our story.", [30, 4372, 440, 64], { font: "Quicksand", size: 16, color: "#353535", bold: true });
decor("wreath", [16, 4460, 90, 90], "slideRight");
text("YOU ARE\nPERFECT", [121, 4470, 214, 70], { font: "Playfair Display", size: 26, align: "left", lineHeight: 1.2 });
text("Một người thương, một đời thương", [80, 4560, 340, 28], { font: "Cormorant Garamond", size: 21, bold: true });

// ---------------------------------------------------------------------------
// 7. Ảnh đen trắng + lịch, ngày giờ, đếm ngược
// ---------------------------------------------------------------------------
photo(PHOTO.monochrome, [0, 4647, 500, 751], "slideUp", 0.2, { filters: { brightness: 80, contrast: 100, saturation: 100, blur: 0, grayscale: 0 } });
text("NO.12", [12, 4655, 70, 24], { font: "Quicksand", size: 16, color: WHITE, bold: true }, "slideRight");
text("05.20", [92, 4655, 80, 24], { font: "Quicksand", size: 16, color: WHITE, bold: true }, "slideRight");
text("FALL IN", [250, 4655, 120, 24], { font: "Quicksand", size: 16, color: WHITE, bold: true });
text("LOVE", [410, 4655, 70, 24], { font: "Quicksand", size: 16, color: WHITE, bold: true }, "slideLeft");
decor("laurel-left", [182, 4690, 20, 40]);
text("WEDDING\nINVITATION", [198, 4690, 104, 40], { font: "Quicksand", size: 13, color: WHITE, bold: true, lineHeight: 1.4 });
decor("laurel-right", [298, 4690, 20, 40]);
widget("calendar", [82, 5040, 336, 314], {
  color: WHITE,
  accentColor: "#f3a0aa",
  backgroundColor: "#00000055",
  borderRadius: 12,
  fontFamily: "Quicksand",
});
text("Thứ Năm · 20.05.2027 · 11:00 sáng", [10, 5440, 480, 36], { font: "Cormorant Garamond", size: 20, bold: true, color: "#3d3838" });
widget("countdown", [90, 5500, 320, 76], {
  color: WHITE,
  accentColor: "#940000",
  borderRadius: 8,
  fontFamily: "Quicksand",
});

// ---------------------------------------------------------------------------
// 8. Lời thương + ảnh nhỏ + ảnh vuông
// ---------------------------------------------------------------------------
text("Ngày ấy nắng rất đẹp, và em cười.\nTừ hôm đó, mọi con đường anh đi\nđều dẫn về phía em.", [26, 5620, 448, 90], { font: "Cormorant Garamond", size: 19, lineHeight: 1.5 });
photo(PHOTO.rings, [75, 5735, 170, 226], "slideRight");
photo(PHOTO.hands, [255, 5735, 170, 226], "slideLeft");
decor("wave-band", [0, 5940, 500, 350]);
text("Every love story is beautiful,\nbut ours is my favorite.", [40, 6010, 420, 80], { font: "Corinthia", size: 36, color: "#383838", lineHeight: 1.1 });
photo(PHOTO.holdHands, [37, 6110, 340, 340]);
text("FOREVER", [342, 6150, 140, 30, 90], { font: "Italiana", size: 20, spacing: 3 }, "slideLeft");
text("AND", [372, 6270, 80, 30, 90], { font: "Italiana", size: 20, spacing: 3 }, "slideLeft");
text("EVER", [367, 6360, 90, 30, 90], { font: "Italiana", size: 20, spacing: 3 }, "slideLeft");

// ---------------------------------------------------------------------------
// 9. Địa điểm
// ---------------------------------------------------------------------------
text("Tiệc cưới sẽ diễn ra tại đây —\nrất mong được đón bạn cùng gia đình.", [30, 6500, 440, 60], { font: "Cormorant Garamond", size: 19, lineHeight: 1.5 });
widget("map", [80, 6580, 340, 280], {
  color: "#313131",
  accentColor: "#940000",
  map: {
    address: "Hồ Gươm, Hoàn Kiếm, Hà Nội",
    placeName: "Trung tâm tiệc cưới Hoa Sen",
    buttonText: "Chỉ đường",
  },
});
text("Sảnh tầng 2 · Đón khách từ 10:30", [60, 6880, 380, 26], { font: "Playfair Display", size: 16, color: "#313131" });
decor("divider-flourish", [100, 6912, 300, 40]);
photo(PHOTO.aisle, [0, 6980, 500, 240]);

// ---------------------------------------------------------------------------
// 10. Kết
// ---------------------------------------------------------------------------
text("LOVE YOU", [0, 7240, 150, 32], { font: "Italiana", size: 20, spacing: 2 }, "slideRight");
text("FOREVER", [170, 7240, 160, 32], { font: "Italiana", size: 20, spacing: 2 });
text("AND EVER", [350, 7240, 150, 32], { font: "Italiana", size: 20, spacing: 2 }, "slideLeft");
photo(PHOTO.evening, [0, 7280, 500, 680]);
text("You are my\nsunshine", [60, 7340, 380, 160], { font: "Great Vibes", size: 64, color: WHITE, lineHeight: 1.1 });

// ---------------------------------------------------------------------------
// 11. Album, lời mời theo tên khách, xác nhận tham dự, mừng cưới, liên hệ
// ---------------------------------------------------------------------------
text("ALBUM ẢNH CƯỚI", [10, 8000, 480, 32], { font: "Prata", size: 22, spacing: 2 });
widget("album", [10, 8045, 480, 318], { animation: anim("fadeIn", 0.2), media: { ...DEFAULT_MEDIA, columns: 3 } });
text(`Trân trọng kính mời\n${GUEST_NAME_TOKEN}`, [10, 8395, 480, 72], { font: "Cormorant Garamond", size: 22, bold: true, lineHeight: 1.4 });
widget("rsvp", [70, 8480, 360, 0], {
  color: "#333333",
  backgroundColor: WHITE,
  borderRadius: 8,
  fontFamily: "Quicksand",
});
widget("reminder", [130, 8880, 240, 48], {
  color: WHITE,
  accentColor: "#940000",
  borderRadius: 24,
  button: { label: "Thêm vào lịch", phone: "", eventTitle: "Đám cưới Minh Anh & Hoàng Nam" },
  map: { address: "Hồ Gươm, Hoàn Kiếm, Hà Nội", placeName: "Trung tâm tiệc cưới Hoa Sen", buttonText: "Chỉ đường" },
});
widget("giftQr", [120, 8970, 260, 340], {
  color: "#333333",
  accentColor: "#940000",
  backgroundColor: WHITE,
  borderRadius: 12,
  gift: { title: "Hộp mừng cưới", bankCode: "VCB", accountNumber: "0123456789", accountName: "NGUYEN VAN A", note: "Mung cuoi Minh Anh Hoang Nam" },
});
widget("call", [30, 9335, 210, 46], {
  color: WHITE,
  accentColor: "#5c5c5c",
  borderRadius: 23,
  button: { label: "Gọi chú rể", phone: "0900000001", eventTitle: "" },
});
widget("call", [260, 9335, 210, 46], {
  color: WHITE,
  accentColor: "#5c5c5c",
  borderRadius: 23,
  button: { label: "Gọi cô dâu", phone: "0900000002", eventTitle: "" },
});
decor("doves", [190, 9410, 120, 75]);
text("Thank you", [10, 9490, 480, 90], { font: "Pacifico", size: 56 });

export const fallInLoveTemplate: Template = {
  id: "fall-in-love",
  name: "Đồng cỏ Fall in love",
  thumbnail: unsplash("1537633552985-df8429e8048b", 300),
  category: "outdoor",
  canvasSettings: {
    width: 500,
    height: 9620,
    backgroundColor: "#ffffff",
    backgroundImage: null,
    backgroundSize: "cover",
    backgroundMusic: null,
    isMusicPlaying: false,
    fallingEffect: { kind: "petals", density: 22, speed: 0.8 },
    intro: {
      style: "envelope",
      title: "Minh Anh & Hoàng Nam",
      subtitle: "Trân trọng kính mời",
      buttonText: "Mở thiệp",
      color: "#e9efe4",
      textColor: "#3f4a36",
    },
  },
  elements,
};
