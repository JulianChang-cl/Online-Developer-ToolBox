import React, { useState, useRef } from 'react'
import { svgViewerService } from '@/services/svg-viewer'

interface LoadedFile {
    id: string
    name: string
    content: string
    size: number
}

export function SVGViewerTool() {
    const [files, setFiles] = useState<LoadedFile[]>([])
    const [activeFileId, setActiveFileId] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
    const [background, setBackground] = useState<'grid' | 'white' | 'black'>('grid')

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Handle file upload
    const handleFileUpload = async (uploadedFiles: FileList | null) => {
        if (!uploadedFiles || uploadedFiles.length === 0) return

        const newFiles: LoadedFile[] = []

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i]
            // Accept .svg files or files with image/svg+xml type
            if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) continue

            const text = await file.text()
            const validation = svgViewerService.validate!(text)

            if (validation.valid) {
                newFiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    name: file.name,
                    content: text,
                    size: file.size
                })
            }
        }

        if (newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles])
            setActiveFileId(newFiles[0].id)
            // Reset view
            setZoom(1)
            setPan({ x: 0, y: 0 })
        }
    }

    const activeFile = files.find(f => f.id === activeFileId)

    // Zoom controls
    const handleZoom = (delta: number) => {
        setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)))
    }

    // Pan controls
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!activeFile) return
        setIsPanning(true)
        setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return
        const dx = e.clientX - lastMousePos.x
        const dy = e.clientY - lastMousePos.y
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
        setIsPanning(false)
    }

    // Export
    const handleDownload = (type: 'svg' | 'png') => {
        if (!activeFile) return

        if (type === 'svg') {
            const blob = new Blob([activeFile.content], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = activeFile.name
            a.click()
            URL.revokeObjectURL(url)
        } else {
            // PNG export would require rendering to canvas first
            const img = new Image()
            const blob = new Blob([activeFile.content], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(img, 0, 0)
                    const pngUrl = canvas.toDataURL('image/png')
                    const a = document.createElement('a')
                    a.href = pngUrl
                    a.download = activeFile.name.replace('.svg', '.png')
                    a.click()
                }
                URL.revokeObjectURL(url)
            }
            img.src = url
        }
    }

    return (
        <div className="h-full flex flex-col p-4 gap-4">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex gap-2 overflow-x-auto max-w-[50%]">
                    {files.map(file => (
                        <button
                            key={file.id}
                            onClick={() => setActiveFileId(file.id)}
                            className={`px-3 py-1 rounded text-sm whitespace-nowrap flex items-center ${activeFileId === file.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {file.name}
                            <span
                                className="ml-2 opacity-50 hover:opacity-100 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFiles(prev => prev.filter(f => f.id !== file.id))
                                    if (activeFileId === file.id) {
                                        setActiveFileId(null)
                                    }
                                }}
                            >
                                ×
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".svg"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        Open SVG
                    </button>

                    {activeFile && (
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 border border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setBackground('grid')}
                                className={`p-1.5 rounded transition-all ${background === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm ring-1 ring-black/5' : 'hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500'}`}
                                title="Transparency Grid"
                            >
                                <div className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-500" style={{
                                    background: 'conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg)',
                                    backgroundSize: '8px 8px'
                                }} />
                            </button>
                            <button
                                onClick={() => setBackground('white')}
                                className={`p-1.5 rounded transition-all ${background === 'white' ? 'bg-white dark:bg-gray-600 shadow-sm ring-1 ring-black/5' : 'hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500'}`}
                                title="White Background"
                            >
                                <div className="w-4 h-4 bg-white rounded-sm border border-gray-300 dark:border-gray-500" />
                            </button>
                            <button
                                onClick={() => setBackground('black')}
                                className={`p-1.5 rounded transition-all ${background === 'black' ? 'bg-white dark:bg-gray-600 shadow-sm ring-1 ring-black/5' : 'hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500'}`}
                                title="Black Background"
                            >
                                <div className="w-4 h-4 bg-black rounded-sm border border-gray-300 dark:border-gray-500" />
                            </button>
                        </div>
                    )}
                    {activeFile && (
                        <>
                            <button
                                onClick={() => handleDownload('svg')}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors text-sm"
                            >
                                Save SVG
                            </button>
                            <button
                                onClick={() => handleDownload('png')}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors text-sm"
                            >
                                Save PNG
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Canvas */}
                <div
                    className={`flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
                        }`}
                    onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        handleFileUpload(e.dataTransfer.files)
                    }}
                >
                    {!activeFile ? (
                        <div className="text-center text-gray-500">
                            <p className="text-xl mb-2">Drag & Drop SVG files here</p>
                            <p className="text-sm">or click "Open SVG" to browse</p>
                        </div>
                    ) : (
                        <div
                            className="w-full h-full overflow-hidden cursor-move relative"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* Background grid for transparency */}
                            <div className={`absolute inset-0 pointer-events-none ${background === 'white' ? 'bg-white' :
                                    background === 'black' ? 'bg-gray-900' :
                                        'bg-gray-100'
                                }`}
                                style={background === 'grid' ? {
                                    backgroundImage: `
                                        linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                        linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                        linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                        linear-gradient(-45deg, transparent 75%, #ccc 75%)
                                    `,
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                } : undefined}
                            />

                            <div
                                className="origin-center transition-transform duration-75 ease-out"
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}
                                dangerouslySetInnerHTML={{ __html: activeFile.content }}
                            />

                            {/* Zoom Controls Overlay */}
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded shadow-lg">
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    onClick={() => handleZoom(0.1)}
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <span className="text-center text-xs">{Math.round(zoom * 100)}%</span>
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    onClick={() => handleZoom(-0.1)}
                                    title="Zoom Out"
                                >
                                    -
                                </button>
                                <button
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs"
                                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                                    title="Reset View"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                {activeFile && (
                    <div className="w-64 flex-shrink-0 p-4 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">File Info</h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div>
                                <span className="text-gray-500 block">Name</span>
                                <span className="break-all">{activeFile.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Size</span>
                                <span>{(activeFile.size / 1024).toFixed(2)} KB</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Dimensions</span>
                                {/* We could parse this from the SVG content if needed */}
                                <span>-</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
