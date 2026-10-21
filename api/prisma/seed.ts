/**
 * Seed du lieu tham chieu bat buoc phai co truoc khi User dau tien dang ky:
 * 3 goi dich vu Free/Basic/Premium theo dung bang gia trong SRS (muc 3.12.1).
 * Chay: npm run db:seed
 *
 * Luu y: gia/gioi han lay tu trang pricing tai thoi diem khao sat (co khuyen mai tam thoi) -
 * SRS tu ghi chu can lam ro voi business owner truoc khi chot cung, nen coi day la GIA TRI
 * KHOI TAO, sua lai qua Admin Panel (module Quan ly Plan) khi co so lieu chinh thuc.
 */
import { PrismaClient, PlanTier, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const plans: Array<{
    tier: PlanTier;
    name: string;
    price: number;
    maxImages: number;
    maxViews: number;
    maxInvitations: number;
    storageDurationMonths: number;
    templateTierAccess: PlanTier;
    hasWatermarkRemoval: boolean;
    hasCustomMusic: boolean;
    hasCustomFont: boolean;
    hasZenAi: boolean;
  }> = [
    {
      tier: PlanTier.FREE,
      name: "Free",
      price: 0,
      maxImages: 10,
      maxViews: 300,
      maxInvitations: 1,
      storageDurationMonths: 6,
      templateTierAccess: PlanTier.FREE,
      hasWatermarkRemoval: false,
      hasCustomMusic: false,
      hasCustomFont: false,
      hasZenAi: false,
    },
    {
      tier: PlanTier.BASIC,
      name: "Basic",
      price: 169000,
      maxImages: 50,
      maxViews: 10000,
      maxInvitations: 5, // SRS ghi 3-5, chua khop giua landing/FAQ - can chot lai voi business owner
      storageDurationMonths: 24,
      templateTierAccess: PlanTier.BASIC,
      hasWatermarkRemoval: true,
      hasCustomMusic: true,
      hasCustomFont: true,
      hasZenAi: true,
    },
    {
      tier: PlanTier.PREMIUM,
      name: "Premium",
      price: 269000,
      maxImages: 100,
      maxViews: 50000,
      maxInvitations: 10, // SRS ghi 5-10, chua khop giua landing/FAQ - can chot lai voi business owner
      storageDurationMonths: 60,
      templateTierAccess: PlanTier.PREMIUM,
      hasWatermarkRemoval: true,
      hasCustomMusic: true,
      hasCustomFont: true,
      hasZenAi: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  const categoryDefinitions = [
    { name: "Wedding", slug: "wedding", description: "Thiệp cưới", sortOrder: 1 },
    { name: "Birthday", slug: "birthday", description: "Thiệp sinh nhật", sortOrder: 2 },
    { name: "Luxury", slug: "luxury", description: "Thiệp cao cấp", sortOrder: 3 },
    { name: "Romantic", slug: "romantic", description: "Thiệp lãng mạn", sortOrder: 4 },
    { name: "Minimal", slug: "minimal", description: "Thiệp tối giản", sortOrder: 5 },
  ] as const;

  const categoryMap = new Map<string, string>();
  for (const category of categoryDefinitions) {
    const record = await prisma.templateCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder },
      create: { name: category.name, slug: category.slug, description: category.description, sortOrder: category.sortOrder },
    });
    categoryMap.set(category.slug, record.id);
  }

  const styleMap = new Map<string, string>();
  for (const style of [
    { name: "Romantic", slug: "romantic", description: "Lãng mạn" },
    { name: "Modern", slug: "modern", description: "Hiện đại" },
    { name: "Luxury", slug: "luxury", description: "Sang trọng" },
    { name: "Floral", slug: "floral", description: "Hoa lá" },
  ]) {
    const record = await prisma.templateStyle.upsert({
      where: { slug: style.slug },
      update: { name: style.name, description: style.description },
      create: { name: style.name, slug: style.slug, description: style.description },
    });
    styleMap.set(style.slug, record.id);
  }

  const defaultComponents = [
    { name: "Heart Frame", type: "shape", category: "wedding", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=400&fit=crop", description: "Khung trái tim lãng mạn", configJson: { animation: "pulse", accent: "#f472b6" } },
    { name: "Rose Garland", type: "image", category: "wedding", tier: PlanTier.BASIC, thumbnailUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&h=400&fit=crop", description: "Hoa hồng nền trang trí", configJson: { animation: "zoom", accent: "#fb7185" } },
    { name: "Sparkle Badge", type: "text", category: "birthday", tier: PlanTier.FREE, thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop", description: "Badge chúc mừng phát sáng", configJson: { animation: "bounce", accent: "#f59e0b" } },
  ] as const;

  for (const component of defaultComponents) {
    const existing = await prisma.component.findFirst({
      where: { name: component.name, category: component.category },
    });

    if (existing) {
      await prisma.component.update({
        where: { id: existing.id },
        data: {
          ...component,
          configJson: component.configJson as never,
        },
      });
    } else {
      await prisma.component.create({
        data: {
          ...component,
          configJson: component.configJson as never,
        },
      });
    }
  }

  const buildLongFormTemplateSeed = ({
    name,
    category,
    style,
    tier,
    thumbnailUrl,
    accent,
    titleText,
    dateText,
    storyText,
    locationText,
    secondaryImage,
  }: {
    name: string;
    category: string;
    style: string;
    tier: PlanTier;
    thumbnailUrl: string;
    accent: string;
    titleText: string;
    dateText: string;
    storyText: string;
    locationText: string;
    secondaryImage: string;
  }) => ({
    name,
    category,
    style,
    tier,
    thumbnailUrl,
    contentJson: {
      canvasSettings: { width: 600, height: 3200, backgroundColor: "#fffafc" },
      elements: [
        { id: "bg", type: "image", src: thumbnailUrl, position: { x: 0, y: 0 }, size: { width: 600, height: 3200 }, opacity: 1, animation: { enabled: true, continuous: true, type: "zoom" } },
        { id: "heroOverlay", type: "shape", shapeType: "rectangle", position: { x: 40, y: 40 }, size: { width: 520, height: 900 }, rotation: 0, opacity: 0.2, zIndex: 1, locked: false, fill: "rgba(255,255,255,0.28)", stroke: "rgba(255,255,255,0.7)", strokeWidth: 1 },
        { id: "title", type: "text", content: titleText, position: { x: 90, y: 180 }, size: { width: 420, height: 120 }, fontFamily: "Great Vibes", fontSize: 72, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "date", type: "text", content: dateText, position: { x: 170, y: 360 }, size: { width: 260, height: 60 }, fontFamily: "Montserrat", fontSize: 26, color: "#fff1f7", animation: { enabled: true, continuous: true, type: "slideIn" } },
        { id: "invite", type: "text", content: "Trân trọng kính mời quý khách\nđến dự lễ thành hôn của chúng tôi", position: { x: 80, y: 500 }, size: { width: 440, height: 120 }, fontFamily: "Lora", fontSize: 20, color: "#fffaf9", animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "storyHeader", type: "text", content: "OUR STORY", position: { x: 60, y: 930 }, size: { width: 480, height: 50 }, fontFamily: "Montserrat", fontSize: 24, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "slideIn" } },
        { id: "story", type: "text", content: storyText, position: { x: 80, y: 1000 }, size: { width: 440, height: 180 }, fontFamily: "Lora", fontSize: 20, color: "#fffaf7", backgroundColor: "rgba(255,255,255,0.06)", lineHeight: 1.8, letterSpacing: 0, padding: { top: 18, right: 18, bottom: 18, left: 18 }, borderRadius: { topLeft: 18, topRight: 18, bottomLeft: 18, bottomRight: 18 }, animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "photo1", type: "image", src: secondaryImage, position: { x: 70, y: 1260 }, size: { width: 220, height: 280 }, opacity: 1, animation: { enabled: true, continuous: true, type: "zoom" }, objectFit: "cover", border: { width: 2, color: "rgba(255,255,255,0.6)", style: "solid", position: "all" }, borderRadius: { topLeft: 18, topRight: 18, bottomLeft: 18, bottomRight: 18 } },
        { id: "photo2", type: "image", src: thumbnailUrl, position: { x: 310, y: 1260 }, size: { width: 220, height: 280 }, opacity: 1, animation: { enabled: true, continuous: true, type: "zoom" }, objectFit: "cover", border: { width: 2, color: "rgba(255,255,255,0.6)", style: "solid", position: "all" }, borderRadius: { topLeft: 18, topRight: 18, bottomLeft: 18, bottomRight: 18 } },
        { id: "timelineTitle", type: "text", content: "LỊCH TRÌNH", position: { x: 60, y: 1630 }, size: { width: 480, height: 42 }, fontFamily: "Montserrat", fontSize: 22, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "timeline1", type: "shape", shapeType: "rectangle", position: { x: 65, y: 1690 }, size: { width: 470, height: 120 }, rotation: 0, opacity: 1, zIndex: 10, locked: false, fill: "rgba(255,255,255,0.12)", stroke: "rgba(255,255,255,0.4)", strokeWidth: 1 },
        { id: "timeline2", type: "shape", shapeType: "rectangle", position: { x: 65, y: 1825 }, size: { width: 470, height: 120 }, rotation: 0, opacity: 1, zIndex: 11, locked: false, fill: "rgba(255,255,255,0.12)", stroke: "rgba(255,255,255,0.4)", strokeWidth: 1 },
        { id: "timeline3", type: "shape", shapeType: "rectangle", position: { x: 65, y: 1960 }, size: { width: 470, height: 120 }, rotation: 0, opacity: 1, zIndex: 12, locked: false, fill: "rgba(255,255,255,0.12)", stroke: "rgba(255,255,255,0.4)", strokeWidth: 1 },
        { id: "locationTitle", type: "text", content: "ĐỊA ĐIỂM", position: { x: 60, y: 2145 }, size: { width: 480, height: 42 }, fontFamily: "Montserrat", fontSize: 22, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "location", type: "text", content: locationText, position: { x: 80, y: 2220 }, size: { width: 440, height: 200 }, fontFamily: "Montserrat", fontSize: 20, color: "#fffaf7", backgroundColor: "rgba(255,255,255,0.08)", lineHeight: 1.8, letterSpacing: 0, padding: { top: 26, right: 20, bottom: 26, left: 20 }, border: { width: 1, color: "rgba(255,255,255,0.35)", style: "solid", position: "all" }, borderRadius: { topLeft: 18, topRight: 18, bottomLeft: 18, bottomRight: 18 }, animation: { enabled: true, continuous: true, type: "bounce" } },
        { id: "galleryTitle", type: "text", content: "ALBUM ẢNH", position: { x: 60, y: 2470 }, size: { width: 480, height: 42 }, fontFamily: "Montserrat", fontSize: 22, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "fadeIn" } },
        { id: "gallery1", type: "image", src: secondaryImage, position: { x: 70, y: 2525 }, size: { width: 210, height: 260 }, opacity: 1, animation: { enabled: true, continuous: true, type: "zoom" }, objectFit: "cover", border: { width: 2, color: "rgba(255,255,255,0.5)", style: "solid", position: "all" }, borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 } },
        { id: "gallery2", type: "image", src: thumbnailUrl, position: { x: 320, y: 2525 }, size: { width: 210, height: 260 }, opacity: 1, animation: { enabled: true, continuous: true, type: "zoom" }, objectFit: "cover", border: { width: 2, color: "rgba(255,255,255,0.5)", style: "solid", position: "all" }, borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 } },
        { id: "rsvpBox", type: "text", content: "RSVP\nCảm ơn bạn đã ở bên chúng mình", position: { x: 90, y: 2820 }, size: { width: 420, height: 180 }, fontFamily: "Montserrat", fontSize: 24, color: "#fffaf7", backgroundColor: "rgba(255,255,255,0.09)", lineHeight: 1.7, letterSpacing: 1, padding: { top: 26, right: 20, bottom: 26, left: 20 }, border: { width: 1, color: "rgba(255,255,255,0.4)", style: "solid", position: "all" }, borderRadius: { topLeft: 22, topRight: 22, bottomLeft: 22, bottomRight: 22 }, animation: { enabled: true, continuous: true, type: "pulse" } },
        { id: "gift", type: "text", content: "Mừng cưới\nTặng quà bằng tình yêu và lời chúc hạnh phúc", position: { x: 80, y: 3040 }, size: { width: 440, height: 120 }, fontFamily: "Lora", fontSize: 20, color: "#fffaf7", animation: { enabled: true, continuous: true, type: "fadeIn" } },
      ],
    },
  });

  const templates = [
    buildLongFormTemplateSeed({ name: "Moonlit Romance", category: "wedding", style: "romantic", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&h=1200&fit=crop", accent: "#ec4899", titleText: "Mình Anh & Hoàng", dateText: "20.06.2025", storyText: "Từ những lần đi bộ cùng nhau trong những chiều mưa, đến ngày hôm nay, chúng tôi đã tìm thấy nhau trong một tình yêu dịu dàng và bền bỉ. Mỗi ngày bên nhau là một câu chuyện mới, và hôm nay, chúng tôi rất hân hạnh được chia sẻ niềm vui này với mọi người.", locationText: "📍 Trung tâm tiệc cưới Aurora\n123 Đường Nguyễn Huệ, Q.1, TP.HCM", secondaryImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Garden Glow", category: "luxury", style: "floral", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=1200&fit=crop", accent: "#0f766e", titleText: "Linh & Khoa", dateText: "12.05.2026", storyText: "Chúng tôi bắt đầu từ một khoảng lặng rất nhỏ nhưng đã trở thành nơi giữ những điều đẹp nhất. Sự hiện diện của nhau khiến mọi thứ trở nên bình yên, đầy màu sắc và đáng trân trọng. Hôm nay, chúng tôi xin mời bạn tham dự ngày đặc biệt này cùng chúng tôi.", locationText: "📍 Khu vườn trắng Blossom\n88 Đường Hùng Vương, Nha Trang", secondaryImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Gilded Romance", category: "luxury", style: "luxury", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=1200&fit=crop", accent: "#d97706", titleText: "Maya & Daniel", dateText: "17.11.2026", storyText: "Đó là một buổi chiều rất bình thường khi cả hai nhận ra mình đã tìm thấy ‘nhà’ trong mỗi người. Từ những câu chuyện, những nụ cười, đến những lời hứa, tất cả đều dẫn đến ngày hôm nay, ngày mà chúng tôi muốn đồng hành cùng bạn trong niềm hạnh phúc trọn vẹn nhất.", locationText: "📍 Riverside Ballroom\nSố 26, Bến Nghé, Quận 1, TP.HCM", secondaryImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Blush Horizon", category: "romantic", style: "romantic", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&h=1200&fit=crop", accent: "#f472b6", titleText: "Hannah & Miles", dateText: "09.07.2026", storyText: "Mỗi bước đi của chúng tôi đều được kết nối bởi những khoảnh khắc trong sáng và những câu chuyện rất riêng. Tình yêu mà mỗi người mang đến cho nhau đã khiến cuộc sống thêm ấm áp, và chúng tôi mong muốn cùng bạn nhìn thấy ngày hôm nay với niềm vui thật lớn.", locationText: "📍 The Rose Pavilion\nĐường Sơn Trà, Đà Nẵng", secondaryImage: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Forest Vows", category: "wedding", style: "floral", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1200&fit=crop", accent: "#4d7c0f", titleText: "Anya & Luke", dateText: "21.12.2026", storyText: "Trong không gian yên bình giữa thiên nhiên, chúng tôi nhận ra mình đã tìm được một sự vững chắc. Những tháng ngày qua đã dạy chúng tôi biết đón nhận mọi thứ bằng lòng tin và niềm biết ơn. Ngày này, chúng tôi muốn dành cho bạn những phút giây hạnh phúc cùng nhau.", locationText: "📍 Green Haven Villa\n200 Đường Lê Lợi, Hà Nội", secondaryImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Moon & Pearl", category: "luxury", style: "luxury", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&h=1200&fit=crop", accent: "#8b5cf6", titleText: "Emmy & Noah", dateText: "12.08.2026", storyText: "Chúng tôi đã học cách yêu nhau bằng sự kiên nhẫn, niềm tin và những khoảnh khắc rất nhỏ. Một ngày, hai con người dần trở thành một gia đình trong trái tim nhau. Và hôm nay, chúng tôi xin mời bạn cùng chứng kiến một bước ngoặt đẹp như giấc mơ.", locationText: "📍 Pearl Hall\n12 Hoàng Hoa Thám, Đà Lạt", secondaryImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Velvet Sunset", category: "luxury", style: "luxury", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=1200&fit=crop", accent: "#f59e0b", titleText: "Alicia & James", dateText: "22.09.2027", storyText: "Đôi khi, tình yêu đẹp nhất lại khởi đầu từ những điều rất đỗi bình thường. Chúng tôi cùng nhau bước qua những mùa, những ngày, và cuối cùng đã đi đến một ngày ngập tràn ánh sáng. Hôm nay là niềm hạnh phúc mà chúng tôi muốn chia sẻ với bạn.", locationText: "📍 Golden Valley Resort\n31 Mạc Đĩnh Chi, Quận 1, TP.HCM", secondaryImage: "https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Ivory Garden", category: "wedding", style: "floral", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=1200&fit=crop", accent: "#d97706", titleText: "Isabella & Henry", dateText: "13.06.2027", storyText: "Mỗi lần nhìn thấy nhau là một lần yêu thêm một chút. Từ những cuộc trò chuyện ngắn, đến những chặng đường dài, chúng tôi đã cùng nhau dệt nên một mối tình ấm áp. Ngày hôm nay là kết thúc của một hành trình đẹp, và là khởi đầu của một chương mới.", locationText: "📍 Vườn Cỏ Hoa\n36 Nguyễn Văn Cừ, Hà Nội", secondaryImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Coastal Dream", category: "wedding", style: "modern", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=1200&fit=crop", accent: "#0ea5e9", titleText: "Sara & Ethan", dateText: "05.04.2027", storyText: "Chúng tôi tin rằng tình yêu không chỉ là những lời hứa đẹp, mà còn là sự đồng hành thật sự trong mọi thăng trầm. Mỗi ngày bên nhau là một trải nghiệm mới, và ngày cưới là một lời khẳng định cho niềm tin ấy. Chúng tôi rất vui khi có bạn cùng chúc mừng.", locationText: "📍 Seaside Villa\nNo. 9 Bạch Đằng, Đà Nẵng", secondaryImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=1200&fit=crop" }),
    buildLongFormTemplateSeed({ name: "Heavenly Promise", category: "luxury", style: "romantic", tier: PlanTier.PREMIUM, thumbnailUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&h=1200&fit=crop", accent: "#d946ef", titleText: "Jasmine & Ryan", dateText: "14.02.2028", storyText: "Những điều đẹp nhất trong cuộc sống đôi khi đến rất ngẫu nhiên, nhưng khi đến, chúng ta đã biết trân trọng. Chúng tôi đã cùng nhau xây dựng một câu chuyện yêu thương, và hôm nay muốn ký lên một lời hứa mới với tất cả những người thân yêu bên mình.", locationText: "📍 The Grand Hall\nĐường Lê Quý Đôn, Nha Trang", secondaryImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&h=1200&fit=crop" }),
  ] as const;

  const allTemplateIds = (await prisma.template.findMany({ select: { id: true } })).map((item) => item.id);
  if (allTemplateIds.length > 0) {
    await prisma.invitation.updateMany({
      where: { templateId: { in: allTemplateIds } },
      data: { templateId: null },
    });
    await prisma.template.deleteMany({ where: { id: { in: allTemplateIds } } });
  }

  await prisma.template.createMany({
    data: templates.map((template) => ({
      name: template.name,
      categoryId: categoryMap.get(template.category)!,
      styleId: styleMap.get(template.style) ?? null,
      tier: template.tier,
      thumbnailUrl: template.thumbnailUrl,
      contentJson: template.contentJson as never,
      isActive: true,
    })),
  });

  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin@123456";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Minh Quang",
      role: UserRole.ADMIN,
      passwordHash: adminHash,
      isLocked: false,
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: "Minh Quang",
      role: UserRole.ADMIN,
      wallet: { create: { balance: 0 } },
    },
  });

  const templateCount = await prisma.template.count({ where: { isActive: true } });
  console.log(`Da seed ${plans.length} goi dich vu: Free, Basic, Premium.`);
  console.log(`Da seed ${templateCount} mau template mac dinh cho Wedding/Birthday/Luxury.`);
  console.log(`Admin ready: ${adminUser.email} / ${adminPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
