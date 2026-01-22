'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaItem {
    id: string
    url: string
    caption?: string
    is_primary?: boolean
}

interface ImageGalleryProps {
    mediaItems: MediaItem[]
    onClose?: () => void
    initialIndex?: number
}

export function ImageGallery({ mediaItems, onClose, initialIndex = 0 }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
    const [isCurrentLoading, setIsCurrentLoading] = useState(true)

    useEffect(() => {
        if (initialIndex >= 0 && initialIndex < mediaItems.length) {
            setCurrentIndex(initialIndex)
        }
    }, [initialIndex, mediaItems.length])

    useEffect(() => {
        setIsCurrentLoading(!loadedImages.has(currentIndex))
    }, [currentIndex, loadedImages])

    useEffect(() => {
        mediaItems.forEach((item, idx) => {
            if (!loadedImages.has(idx) && item.url) {
                const img = new window.Image()
                img.src = item.url
                img.onload = () => {
                    setLoadedImages((prev) => new Set([...prev, idx]))
                }
            }
        })
    }, [mediaItems, loadedImages])

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
        )
    }

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
        )
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose?.()
        } else if (e.key === 'ArrowLeft') {
            goToPrevious()
        } else if (e.key === 'ArrowRight') {
            goToNext()
        }
    }

    if (mediaItems.length === 0) return null

    const currentImage = mediaItems[currentIndex]

    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={goToPrevious}
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={goToNext}
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>

                <div className="relative w-full h-full flex items-center justify-center px-16 py-8">
                    {isCurrentLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    <div className={`relative w-full h-full max-w-7xl max-h-full transition-opacity duration-300 ${isCurrentLoading ? 'opacity-0' : 'opacity-100'}`}>
                        <Image
                            src={currentImage.url}
                            alt={currentImage.caption || `Foto ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                            quality={85}
                            onLoadingComplete={() => setLoadedImages((prev) => new Set([...prev, currentIndex]))}
                        />
                    </div>
                    {currentIndex > 0 && (
                        <div className="absolute opacity-0 pointer-events-none -z-10">
                            <Image
                                src={mediaItems[currentIndex - 1].url}
                                alt=""
                                width={1920}
                                height={1080}
                                priority={false}
                                onLoadingComplete={() => setLoadedImages((prev) => new Set([...prev, currentIndex - 1]))}
                            />
                        </div>
                    )}
                    {currentIndex < mediaItems.length - 1 && (
                        <div className="absolute opacity-0 pointer-events-none -z-10">
                            <Image
                                src={mediaItems[currentIndex + 1].url}
                                alt=""
                                width={1920}
                                height={1080}
                                priority={false}
                                onLoadingComplete={() => setLoadedImages((prev) => new Set([...prev, currentIndex + 1]))}
                            />
                        </div>
                    )}
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
                    <div className="text-sm opacity-80">
                        {currentIndex + 1} de {mediaItems.length}
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-2">
                    {mediaItems.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/40'
                                }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
