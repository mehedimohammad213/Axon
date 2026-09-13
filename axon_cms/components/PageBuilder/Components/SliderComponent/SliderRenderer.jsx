import React from "react";
import { Carousel, Typography } from "antd";
import Image from "next/image";
import { orderByIds } from "../../../slider/SliderForm/orderByIds";
import { resolveMediaUrl } from "../../../../utils/mediaUrl";

const { Text } = Typography;

/** Normalize medias from API relation or additional.slides fallback. */
function resolveSliderMedias(sliderData) {
  if (Array.isArray(sliderData?.medias) && sliderData.medias.length > 0) {
    return orderByIds(sliderData.medias, sliderData.media_ids || []);
  }

  const slides = sliderData?.additional?.slides;
  if (Array.isArray(slides) && slides.length > 0) {
    return slides.map((slide) => ({
      id: slide.id,
      file_path: slide.image,
      title: slide.alt,
    }));
  }

  return [];
}

function getCardMedia(card) {
  const media = card?.media_files;
  if (!media) return null;
  return Array.isArray(media) ? media[0] || null : media;
}

// Helper function to render slider images
export const renderSliderImages = (medias) => {
  if (!medias || medias.length === 0) return null;

  return medias.map((media) => (
    <div key={media.id} className="relative w-full">
      <Image
        src={resolveMediaUrl(media.file_path)}
        alt={media.title || "Slider Image"}
        width={900}
        height={400}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        objectFit="cover"
        className="rounded-lg"
        priority
        unoptimized
      />
    </div>
  ));
};

// Helper function to render card slider
export const renderCardSlider = (cards) => {
  if (!cards || cards.length === 0) return null;

  return cards.map((card) => {
    const mediaFile = getCardMedia(card);
    return (
      <div key={card.id} className="p-4 bg-white rounded-lg shadow-md">
        {mediaFile?.file_path && (
          <div className="relative w-full">
            <Image
              src={resolveMediaUrl(mediaFile.file_path)}
              alt={card.title_en || "Card Image"}
              width={900}
              height={600}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              objectFit="cover"
              className="rounded-lg"
              priority
              unoptimized
            />
          </div>
        )}
        <div className="mt-2">
          <Text strong className="text-lg">
            {card.title_en || "Untitled Card"}
          </Text>
        </div>
      </div>
    );
  });
};

// Main slider renderer component
const SliderRenderer = React.memo(({ sliderData, config = {} }) => {
  if (!sliderData) {
    return <p className="text-gray-500 text-center">No slider selected.</p>;
  }

  const defaultConfig = {
    autoplay: true,
    dots: false,
    effect: "scroll",
    speed: 500,
    height: 400,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const renderCarousel = (children) => (
    <Carousel
      autoplay={finalConfig.autoplay}
      dots={finalConfig.dots}
      effect={finalConfig.effect}
      speed={finalConfig.speed}
      className="rounded-lg overflow-hidden"
    >
      {children}
    </Carousel>
  );

  const type = (sliderData.type || "image").toLowerCase();
  const medias = resolveSliderMedias(sliderData);

  // Image / hero / custom types that carry media slides
  if (type !== "card" && medias.length > 0) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold text-theme pb-4">
          {sliderData.title_en || "Slider Title"}
        </h2>
        {renderCarousel(renderSliderImages(medias))}
      </div>
    );
  }

  if (type === "card" && sliderData.cards?.length > 0) {
    const orderedCards = orderByIds(
      sliderData.cards,
      sliderData.card_ids || []
    );
    return (
      <div className="w-full">
        <h2 className="text-xl font-bold text-theme pb-4">
          {sliderData.title_en || "Slider Title"}
        </h2>
        {renderCarousel(renderCardSlider(orderedCards))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">Slider has no media yet</p>
      <p className="mt-1 text-xs text-slate-500">
        Link images or cards to this slider in the page builder to see them here.
      </p>
      {sliderData?.title_en ? (
        <p className="mt-3 text-xs text-slate-400">Slider: {sliderData.title_en}</p>
      ) : null}
    </div>
  );
});

SliderRenderer.displayName = "SliderRenderer";

export default SliderRenderer;
