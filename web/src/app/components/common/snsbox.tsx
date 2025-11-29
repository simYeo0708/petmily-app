'use client'

import Image from 'next/image'
import React from 'react'

type ImageBoxProps = {
  name?: string
  angle?: number          // 회전 각도 (deg)
  reverseRotate?: boolean // true면 반대로 회전
  size?: number           // 정사각 사이즈(px)
  x?: number | string     // left (px 또는 '10%' 등)
  y?: number | string     // top  (px 또는 '10%' 등)
  className?: string
}



export default function ImageBox({
  name = 'facebook',
  angle = 12,
  reverseRotate = false,
  size = 40,
  x = 0,
  y = 0,
  className = '',
}: ImageBoxProps) {
  const deg = (reverseRotate ? 1 : -1) * angle
  const toUnit = (v: number | string) => (typeof v === 'number' ? `${v}px` : v)
  
  return (
    <div
    style={{
        transform: `rotate(${deg}deg)`,
        width: `${size}px`,
        height: `${size}px`,
        left: toUnit(x),
        top: toUnit(y),
      }}
      className={`absolute ${name === 'facebook' ? "p-0" : "p-2"} overflow-hidden rounded-lg bg-white rotate-[var(--r)deg] border-none ${className}`}
    >
      <Image
        src={`/icons/${name}.png`}
        alt={name}
        width={size}
        height={size}
        className={`block rotate-[var(--r)deg] ${name === 'twitter' ? "mt-1" : ""}`}
        draggable={false}
      />
    </div>
  )
}
