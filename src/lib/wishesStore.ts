/**
 * Lời chúc và lượt thích của khách. Chưa có backend nên lưu tạm trên trình duyệt (như rsvpStore);
 * khi có API, thay các hàm dưới bằng apiRequest("/wishes"...) — giao diện không cần đổi.
 */

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const WISHES_KEY = "wedify-wishes";
const LIKES_KEY = "wedify-likes";
const LIKED_KEY = "wedify-liked";

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bộ nhớ trình duyệt đầy / bị chặn — bỏ qua
  }
};

/** Vài lời chúc mẫu để thiệp không trống khi chưa có ai gửi. */
const SAMPLE_WISHES: Wish[] = [
  { id: "s1", name: "Lan Anh", message: "Chúc hai bạn trăm năm hạnh phúc! 💕", createdAt: "" },
  { id: "s2", name: "Đức Minh", message: "Mãi yêu nhau như ngày đầu nhé!", createdAt: "" },
  { id: "s3", name: "Thu Hà", message: "Chúc mừng hạnh phúc, sớm có tin vui nha 🎉", createdAt: "" },
];

export const loadWishes = (): Wish[] => {
  const own = read<Wish[]>(WISHES_KEY, []);
  return [...own].reverse().concat(SAMPLE_WISHES);
};

export const addWish = async (name: string, message: string): Promise<Wish> => {
  const wish: Wish = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim().slice(0, 40),
    message: message.trim().slice(0, 300),
    createdAt: new Date().toISOString(),
  };
  write(WISHES_KEY, [...read<Wish[]>(WISHES_KEY, []), wish]);
  return wish;
};

export const loadLikes = () => ({
  count: read<number>(LIKES_KEY, 0),
  liked: read<boolean>(LIKED_KEY, false),
});

/** Bấm thích / bỏ thích; trả về trạng thái mới. */
export const toggleLike = () => {
  const { count, liked } = loadLikes();
  const next = { count: Math.max(0, count + (liked ? -1 : 1)), liked: !liked };
  write(LIKES_KEY, next.count);
  write(LIKED_KEY, next.liked);
  return next;
};
