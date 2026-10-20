"use client";

import React from "react";
import { Group, Rect, Text, Image as KonvaImage, Circle, RegularPolygon } from "react-konva";
import useImage from "use-image";
import { WidgetElement } from "@/types/editor";
import { fitImage } from "./ImageElement";
import {
  bankName,
  giftQrUrl,
  layoutAlbum,
  layoutGift,
  widgetButton,
  widgetGift,
  widgetMedia,
  youtubeId,
  youtubeThumbnail,
} from "@/components/widgets/widgetModel";

type BodyProps = { element: WidgetElement };

/** Ảnh lấp đầy ô (cắt giữa), ô xám khi chưa tải được. */
const CoverImage: React.FC<{ src: string; x: number; y: number; width: number; height: number }> = ({
  src,
  x,
  y,
  width,
  height,
}) => {
  const [image] = useImage(src, "anonymous");
  if (!image) return <Rect x={x} y={y} width={width} height={height} fill="#e5e5e5" />;
  const fit = fitImage("cover", { width: image.naturalWidth, height: image.naturalHeight }, { width, height });
  return <KonvaImage image={image} x={x + fit.x} y={y + fit.y} width={fit.width} height={fit.height} crop={fit.crop} />;
};

const ButtonShape: React.FC<{ element: WidgetElement; icon: string }> = ({ element, icon }) => {
  const { width, height } = element.size;
  const { label } = widgetButton(element);
  return (
    <>
      <Rect width={width} height={height} fill={element.accentColor} cornerRadius={element.borderRadius} shadowColor="rgba(0,0,0,0.12)" shadowBlur={8} shadowOffsetY={2} />
      <Text
        width={width}
        height={height}
        text={`${icon}  ${label}`}
        fontFamily={element.fontFamily}
        fontSize={Math.min(16, height * 0.36)}
        fontStyle="bold"
        fill={element.color}
        align="center"
        verticalAlign="middle"
        wrap="none"
        ellipsis
      />
    </>
  );
};

export const CallShape: React.FC<BodyProps> = ({ element }) => <ButtonShape element={element} icon="📞" />;
export const ReminderShape: React.FC<BodyProps> = ({ element }) => <ButtonShape element={element} icon="📅" />;

export const YoutubeShape: React.FC<BodyProps> = ({ element }) => {
  const { width, height } = element.size;
  const id = youtubeId(widgetMedia(element).videoUrl);
  return (
    <>
      <Rect width={width} height={height} fill="#111111" />
      {id && <CoverImage src={youtubeThumbnail(id)} x={0} y={0} width={width} height={height} />}
      <Rect x={width / 2 - 34} y={height / 2 - 24} width={68} height={48} cornerRadius={12} fill="#ff0033" />
      <RegularPolygon x={width / 2 + 3} y={height / 2} sides={3} radius={13} rotation={90} fill="#ffffff" />
      {!id && (
        <Text y={height / 2 + 34} width={width} text="Dán link YouTube ở cột bên phải" fontSize={12} fill="#aaaaaa" align="center" />
      )}
    </>
  );
};

export const SlideshowShape: React.FC<BodyProps> = ({ element }) => {
  const { width, height } = element.size;
  const { images } = widgetMedia(element);
  const dotsWidth = images.length * 14 - 6;
  return (
    <>
      {images[0] ? <CoverImage src={images[0]} x={0} y={0} width={width} height={height} /> : <Rect width={width} height={height} fill="#e5e5e5" />}
      {images.length > 1 &&
        images.map((_, i) => (
          <Circle key={i} x={(width - dotsWidth) / 2 + 4 + i * 14} y={height - 14} radius={4} fill={i === 0 ? "#ffffff" : "rgba(255,255,255,0.5)"} />
        ))}
      <Group x={10} y={10}>
        <Rect width={86} height={22} cornerRadius={11} fill="rgba(0,0,0,0.45)" />
        <Text width={86} height={22} text={`▶ ${images.length} ảnh`} fontSize={11} fill="#ffffff" align="center" verticalAlign="middle" />
      </Group>
    </>
  );
};

export const AlbumShape: React.FC<BodyProps> = ({ element }) => {
  const { images, columns } = widgetMedia(element);
  return (
    <>
      {layoutAlbum(element.size.width, element.size.height, images.length, columns).map((c, i) => (
        <CoverImage key={i} src={images[i]} x={c.x} y={c.y} width={c.size} height={c.size} />
      ))}
    </>
  );
};

export const GiftQrShape: React.FC<BodyProps> = ({ element }) => {
  const { width, height } = element.size;
  const gift = widgetGift(element);
  const L = layoutGift(width, height);
  const [qr] = useImage(giftQrUrl(gift), "anonymous");
  const font = element.fontFamily;
  return (
    <>
      <Text x={L.padding} y={L.padding} width={width - L.padding * 2} height={L.titleHeight} text={gift.title} fontFamily={font} fontSize={18} fontStyle="bold" fill={element.color} align="center" verticalAlign="middle" />
      {qr ? (
        <KonvaImage image={qr} x={L.qrX} y={L.qrY} width={L.qr} height={L.qr} />
      ) : (
        <>
          <Rect x={L.qrX} y={L.qrY} width={L.qr} height={L.qr} fill="#f5f5f5" stroke="#dddddd" />
          <Text x={L.qrX} y={L.qrY} width={L.qr} height={L.qr} text="QR" fontSize={28} fill="#bbbbbb" align="center" verticalAlign="middle" />
        </>
      )}
      <Text
        x={L.padding}
        y={L.infoY}
        width={width - L.padding * 2}
        text={`${gift.accountName}\n${bankName(gift.bankCode)}\n${gift.accountNumber}`}
        fontFamily={font}
        fontSize={13}
        lineHeight={1.45}
        fill={element.color}
        align="center"
      />
    </>
  );
};
