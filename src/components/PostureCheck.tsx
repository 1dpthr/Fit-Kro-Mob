import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Camera, RotateCcw, Check, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface PostureCheckProps {
  onBack?: () => void
}

export const PostureCheck: React.FC<PostureCheckProps> = ({ onBack }) => {
  const [step, setStep] = useState<'intro' | 'camera' | 'result'>('intro')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStep('camera')
    } catch (error: any) {
      console.error('Camera permission denied:', error)
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions in your browser settings.'
        : 'Unable to access camera. Please check your device settings.'
      setCameraError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      stopCamera()
      analyzePosture()
    }
  }

  const analyzePosture = async () => {
    setAnalyzing(true)
    
    // Simulate AI analysis (in production, send to backend/AI service)
    setTimeout(() => {
      const mockResults = [
        {
          score: 'Good',
          mistakes: ['Keep your core engaged', 'Align your shoulders over your hips'],
          scoreColor: 'bg-green-100 text-green-800'
        },
        {
          score: 'Average',
          mistakes: ['Lower your hips more', 'Keep your back straight', 'Don\'t let knees pass toes'],
          scoreColor: 'bg-yellow-100 text-yellow-800'
        },
        {
          score: 'Needs Improvement',
          mistakes: ['Straighten your back', 'Lower your hips', 'Keep chest up', 'Distribute weight evenly'],
          scoreColor: 'bg-red-100 text-red-800'
        }
      ]
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setResult(randomResult)
      setAnalyzing(false)
      setStep('result')
    }, 2000)
  }

  const retry = () => {
    setCapturedImage(null)
    setResult(null)
    setStep('intro')
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl mb-2 text-white">AI Posture Check</h2>
          <p className="text-white/90">Get real-time feedback on your form</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {step === 'intro' && (
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>Follow these steps for accurate results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 size-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900">1</span>
                  </div>
                  <div>
                    <p>Place your phone 6-8 feet away</p>
                    <p className="text-sm text-gray-600">Use a stable surface or tripod</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 size-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900">2</span>
                  </div>
                  <div>
                    <p>Ensure full body is visible</p>
                    <p className="text-sm text-gray-600">Head to feet should be in frame</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 size-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-900">3</span>
                  </div>
                  <div>
                    <p>Perform your exercise</p>
                    <p className="text-sm text-gray-600">Currently supports: Squat, Push-up</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-900">
                  ⚠️ <strong>Note:</strong> This is an MVP feature. For best results, ensure good lighting and a clear background.
                </p>
              </div>

              <Button onClick={startCamera} className="w-full" size="lg">
                <Camera className="mr-2 size-5" />
                Start Camera
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'camera' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Skeleton overlay placeholder */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-white/50 text-center">
                    <p className="mb-2">Position yourself in frame</p>
                    <p className="text-sm">Full body should be visible</p>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="p-4 space-y-3 bg-white">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 Stand in the middle of the frame with your full body visible
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      stopCamera()
                      setStep('intro')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={captureImage} className="flex-1">
                    <Camera className="mr-2 size-4" />
                    Capture
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'result' && (
          <>
            <Card>
              <CardContent className="p-4">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
                )}
              </CardContent>
            </Card>

            {analyzing && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin size-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your posture...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                </CardContent>
              </Card>
            )}

            {result && !analyzing && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Posture Analysis</CardTitle>
                    <Badge className={result.scoreColor}>{result.score}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="mb-2">Key Points to Improve:</h4>
                    <div className="space-y-2">
                      {result.mistakes.map((mistake: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="size-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-orange-900">{index + 1}</span>
                          </div>
                          <p className="text-sm">{mistake}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💪 <strong>Tip:</strong> Practice these corrections and check your posture again. Proper form prevents injuries and maximizes results!
                    </p>
                  </div>

                  <Button onClick={retry} className="w-full">
                    <RotateCcw className="mr-2 size-4" />
                    Check Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Bottom spacing for nav bar */}
        <div className="h-24"></div>
      </div>
    </div>
  )
}