import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Message {
  date: string
  time: string
  sender: string
  content: string
  type: 'text' | 'image' | 'audio' | 'sticker' | 'system'
  attachmentPath?: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatName, setChatName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Create a map of media files
    const mediaMap = new Map<string, string>()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/') || 
          file.type.startsWith('audio/') || 
          file.name.endsWith('.opus') ||
          file.name.endsWith('.webp')) {
        const objectUrl = URL.createObjectURL(file)
        mediaMap.set(file.name, objectUrl)
      }
    }
    // Find the chat file
    let chatFile: File | null = null
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.endsWith('.txt')) {
        chatFile = files[i]
        break
      }
    }

    if (!chatFile) {
      alert('No se encontró el archivo de chat (.txt)')
      return
    }

    const text = await chatFile.text()
    const lines = text.split('\n')
    const parsedMessages: Message[] = []
    let currentChatName = ''

    // Extract chat name from the first line
    const firstLine = lines[0]
    if (firstLine.includes('Chat de')) {
      currentChatName = firstLine.split('Chat de')[1].trim()
      setChatName(currentChatName)
    }

    // Parse messages
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Match WhatsApp message format: [DD/MM/YYYY, HH:mm:ss] Sender: Message
      const match = line.match(/\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.+)/)
      if (match) {
        const [, date, time, sender, content] = match
        const message: Message = {
          date,
          time,
          sender: sender.trim(),
          content: content.trim(),
          type: 'text'
        }

        // Check for system messages
        if (content.includes('Messages and calls are end-to-end encrypted') ||
            content.includes('created this group') ||
            content.includes('added you')) {
          message.type = 'system'
        }

        // Check for attachments
        const attachmentMatch = content.match(/<attached: (.+?)>/)
        if (attachmentMatch) {
          const fileName = attachmentMatch[1]
          if (mediaMap.has(fileName)) {
            message.attachmentPath = mediaMap.get(fileName)
            
            // Determine attachment type
            if (fileName.toLowerCase().includes('-photo-')) {
              message.type = 'image'
            } else if (fileName.toLowerCase().includes('-audio-')) {
              message.type = 'audio'
            } else if (fileName.toLowerCase().includes('-sticker-')) {
              message.type = 'sticker'
            }
          }
        }

        parsedMessages.push(message)
      }
    }
    console.log(parsedMessages)

    setMessages(parsedMessages)
  }

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'system':
        return (
          <div className="text-sm text-gray-500 italic">
            {message.content}
          </div>
        )
      case 'image':
        return (
          <>
            <div className="text-sm">
              {message.content.replace(/<attached: .+?>/, '')}
            </div>
            {message.attachmentPath && (
              <div className="mt-2">
                <img
                  src={message.attachmentPath}
                  alt="Imagen del chat"
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </>
        )
      case 'audio':
        return (
          <>
            <div className="text-sm">
              {message.content.replace(/<attached: .+?>/, '')}
            </div>
            {message.attachmentPath && (
              <div className="mt-2">
                <audio controls className="w-full">
                  <source src={message.attachmentPath} type="audio/ogg" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              </div>
            )}
          </>
        )
      case 'sticker':
        return (
          <>
            <div className="text-sm">
              {message.content.replace(/<attached: .+?>/, '')}
            </div>
            {message.attachmentPath && (
              <div className="mt-2">
                <img
                  src={message.attachmentPath}
                  alt="Sticker"
                  className="max-w-[200px] rounded-lg"
                />
              </div>
            )}
          </>
        )
      default:
        return <div className="text-sm">{message.content}</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-4">
            <h1 className="text-xl font-semibold">
              {chatName || 'WhatsApp Chat Viewer'}
            </h1>
          </div>

          {/* File Upload */}
          <div className="p-4 border-b">
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory=""
              mozdirectory=""
              odirectory=""
              directory=""
              multiple
              onChange={handleFolderUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              Selecciona la carpeta completa exportada de WhatsApp
            </p>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'system' 
                    ? 'justify-center' 
                    : message.sender === 'Tú' 
                      ? 'justify-end' 
                      : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.type === 'system'
                      ? 'bg-gray-50 text-gray-500'
                      : message.sender === 'Tú'
                        ? 'bg-green-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type !== 'system' && (
                    <div className="text-xs text-gray-500 mb-1">
                      {message.sender} • {format(new Date(`${message.date.split('/')[2]}-${message.date.split('/')[1]}-${message.date.split('/')[0]} ${message.time}`), 'PPp', { locale: es })}
                    </div>
                  )}
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 