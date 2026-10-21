import { Tag, Typography } from "antd";
import { HeartOutlined } from "@ant-design/icons";
import { adminStyles as styles } from "@/admin/theme/theme";

export function LoginHero() {
  return <section className={styles.loginVisual}><div className="flex items-center gap-3 text-xl font-extrabold"><span className={styles.brandMark}><HeartOutlined /></span>Wedify Admin</div><div><Tag color="magenta">NỀN TẢNG QUẢN TRỊ TẬP TRUNG</Tag><h1 className="my-[22px] max-w-[560px] text-5xl leading-[1.08] tracking-[-2px]">Mỗi tấm thiệp,<br />một câu chuyện đẹp.</h1><Typography.Paragraph className="!max-w-[520px] !text-[17px] !text-[#aebbd2]">Theo dõi vận hành, chăm sóc khách hàng và phát triển hệ sinh thái thiệp cưới từ một nơi duy nhất.</Typography.Paragraph></div><span className="text-[#71809c]">© 2026 Wedify · Secure administration</span></section>;
}


