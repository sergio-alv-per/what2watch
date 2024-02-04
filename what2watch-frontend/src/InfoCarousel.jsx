import { useEffect, useState } from "react"
import {
  FaArrowLeft as LeftArrow,
  FaArrowRight as RightArrow,
} from "react-icons/fa6"

export function InfoCarousel() {
  const slides = [
    {
      id: "create-rooms",
      description:
        "Create a room and invite your friends to join. You can join a room by entering the room code.",
      image: "./1.png",
    },
    {
      id: "swipe",
      description:
        "Swipe through a variety of movies and TV shows to find the perfect one to watch with your friends.",
      image: "./2.png",
    },
    {
      id: "match-watch",
      description:
        "When you and all of your friends have swiped right on the same movie or TV show, it's time to watch!",
      image: "./3.png",
    },
  ]

  return (
    <Carousel autoSlide>
      {slides.map((item) => (
        <CarouselInfoSlide key={item.id} item={item} />
      ))}
    </Carousel>
  )
}

function CarouselInfoSlide({ item }) {
  return (
    <div className="min-w-full">
      <img src={item.image} />
      <p className="text-white text-center">{item.description}</p>
    </div>
  )
}

function Carousel({
  children: slides,
  autoSlide = false,
  autoSlideInterval = 3000,
}) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [interacted, setInteracted] = useState(false)

  const nextSlide = () => {
    setActiveSlide((as) => (as < slides.length - 1 ? as + 1 : 0))
    setInteracted(true)
  }

  const prevSlide = () => {
    setActiveSlide((as) => (as === 0 ? slides.length - 1 : as - 1))
    setInteracted(true)
  }

  useEffect(() => {
    if (!autoSlide || interacted) return
    const slideInterval = setInterval(
      () => setActiveSlide((as) => (as < slides.length - 1 ? as + 1 : 0)),
      autoSlideInterval
    )

    return () => clearInterval(slideInterval)
  }, [slides.length, autoSlide, autoSlideInterval, interacted])

  return (
    <div className="w-full h-full p-16 relative">
      <div className="overflow-hidden w-full">
        <div
          className="flex gap-2 transition-transform ease-out duration-500"
          style={{
            transform: `translateX(calc(-${activeSlide * 100}% - ${
              activeSlide * 8 // gap-2 corresponds to 8 px
            }px))`,
          }}
        >
          {slides}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full shadow bg-teal-200 text-black hover:transition-transform hover:scale-110"
        >
          <LeftArrow />
        </button>
        <button
          onClick={nextSlide}
          className="p-3 rounded-full shadow bg-teal-200 text-black hover:transition-transform hover:scale-110"
        >
          <RightArrow />
        </button>
      </div>

      <div className="absolute bottom-4 right-0 left-0">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`
              transition-all w-3 h-3 bg-teal-200 rounded-full
              ${activeSlide === i ? "p-2" : "bg-opacity-50"}
            `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
