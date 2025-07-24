"use client"

import { useTheme } from "@/contexts/ThemeContext"
import React, { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, View } from "react-native"

const { width } = Dimensions.get("window")
const BAR_COUNT = 30

const RecordingWave = () => {
  const { colors } = useTheme()
  const animatedValues = useRef<Animated.Value[]>([])
  const [, setBars] = useState<number[]>([])

  useEffect(() => {
    const initialBars = Array.from({ length: BAR_COUNT }, () => Math.random() * 100)
    setBars(initialBars)
    animatedValues.current = initialBars.map(() => new Animated.Value(0))

    const interval = setInterval(() => {
      animatedValues.current.forEach((val) => {
        Animated.timing(val, {
          toValue: Math.random() * 100,
          duration: 300,
          useNativeDriver: false,
        }).start()
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <View
      className="flex-row items-end self-center my-4 overflow-hidden"
      style={{ width: width - 40, height: 100 }}
    >
      {animatedValues.current.map((animVal, index) => (
        <Animated.View
          key={index}
          className="mx-0.5 rounded-full"
          style={{
            width: 4,
            height: animVal,
            backgroundColor: colors.primary,
          }}
        />
      ))}
    </View>
  )
}

export default RecordingWave
