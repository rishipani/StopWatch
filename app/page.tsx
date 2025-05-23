"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Clock, Award, AlertCircle } from "lucide-react"

interface LapTime {
  id: number
  time: number
  lapDuration: number
}

export default function ModernStopwatch() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<LapTime[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isRunning) {
      // When starting, calculate the new start time based on any previous elapsed time
      startTimeRef.current = Date.now() - pausedTimeRef.current

      // Clear any existing interval just to be safe
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Set up a new interval
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current)
      }, 10)
    } else if (intervalRef.current) {
      // When stopping, clear the interval and store the elapsed time
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning]) // Remove time from dependencies to prevent loop

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
    pausedTimeRef.current = time // Store the current elapsed time when pausing
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
    pausedTimeRef.current = 0
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleLap = () => {
    if (isRunning && time > 0) {
      const lapDuration = laps.length === 0 ? time : time - laps[laps.length - 1].time
      const newLap: LapTime = {
        id: laps.length + 1,
        time: time,
        lapDuration: lapDuration,
      }
      setLaps((prev) => [...prev, newLap])
    }
  }

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  const getBestLap = () => {
    if (laps.length === 0) return null
    return laps.reduce((best, current) => (current.lapDuration < best.lapDuration ? current : best))
  }

  const getWorstLap = () => {
    if (laps.length === 0) return null
    return laps.reduce((worst, current) => (current.lapDuration > worst.lapDuration ? current : worst))
  }

  const bestLap = getBestLap()
  const worstLap = getWorstLap()

  const getMotivationalMessage = () => {
    if (laps.length === 0) return "Ready to track your time"
    if (laps.length < 3) return "Great start, keep going"
    if (laps.length < 5) return "Excellent progress"
    return "Impressive performance"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <Clock className="w-5 h-5 text-blue-300" />
              <h1 className="text-2xl font-bold text-white">Precision Timer</h1>
            </div>
            <p className="text-blue-200/80 text-sm">{getMotivationalMessage()}</p>
          </div>

          {/* Main Timer Display */}
          <Card className="bg-black/30 backdrop-blur-xl border-0 shadow-[0_0_45px_rgba(59,130,246,0.2)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
            <CardContent className="relative p-10">
              <div className="text-center space-y-10">
                {/* Time Display */}
                <div className="relative">
                  <div className="text-7xl font-bold font-mono text-white tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {formatTime(time)}
                  </div>
                  {isRunning && <div className="absolute inset-0 bg-blue-400/10 blur-2xl animate-pulse"></div>}
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] border-0"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(217,119,6,0.5)] hover:shadow-[0_0_30px_rgba(217,119,6,0.7)] border-0"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}

                  <Button
                    onClick={handleReset}
                    size="lg"
                    className="bg-slate-700 hover:bg-slate-800 text-white font-medium px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(51,65,85,0.5)] hover:shadow-[0_0_30px_rgba(51,65,85,0.7)] border-0"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Lap Button */}
                {isRunning && (
                  <Button
                    onClick={handleLap}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] border-0"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Record Lap
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lap Times */}
          {laps.length > 0 && (
            <Card className="bg-black/30 backdrop-blur-xl border-0 shadow-[0_0_25px_rgba(59,130,246,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5"></div>
              <CardContent className="relative p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  Lap Times ({laps.length})
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {laps
                    .slice()
                    .reverse()
                    .map((lap) => (
                      <div
                        key={lap.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="border-white/20 text-white/90 min-w-[60px] justify-center"
                          >
                            Lap {lap.id}
                          </Badge>
                          {bestLap && lap.id === bestLap.id && (
                            <Badge className="bg-emerald-600/80 text-white text-xs">Fastest</Badge>
                          )}
                          {worstLap && lap.id === worstLap.id && laps.length > 1 && (
                            <Badge className="bg-rose-600/80 text-white text-xs">Slowest</Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-white font-mono text-sm">{formatTime(lap.lapDuration)}</div>
                          <div className="text-white/50 font-mono text-xs">{formatTime(lap.time)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {laps.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/30 backdrop-blur-xl border-0 shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden group hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-4 text-center">
                  <div className="text-emerald-400 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" />
                    Fastest Lap
                  </div>
                  <div className="text-white font-mono font-bold text-lg">
                    {bestLap && formatTime(bestLap.lapDuration)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-xl border-0 shadow-[0_0_15px_rgba(225,29,72,0.2)] overflow-hidden group hover:shadow-[0_0_25px_rgba(225,29,72,0.3)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-purple-500/5 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-4 text-center">
                  <div className="text-rose-400 text-sm font-medium mb-1 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Slowest Lap
                  </div>
                  <div className="text-white font-mono font-bold text-lg">
                    {worstLap && formatTime(worstLap.lapDuration)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-blue-200/50 text-xs">{isRunning ? "Timer running..." : "Timer ready"}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}
