# WhatsApp Chat Viewer

Una aplicación web simple para visualizar chats exportados de WhatsApp en un formato similar al de la aplicación original.

## Características

- Interfaz similar a WhatsApp
- Soporte para archivos de chat exportados de WhatsApp
- Visualización de mensajes con formato de fecha y hora
- Diseño responsivo
- Soporte para mensajes enviados y recibidos

## Cómo usar

1. Clona este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en `http://localhost:5173`
5. Haz clic en el botón de selección de archivo y elige un archivo de chat exportado de WhatsApp (formato .txt)

## Cómo exportar chats de WhatsApp

1. Abre WhatsApp en tu teléfono
2. Ve al chat que quieres exportar
3. Toca los tres puntos en la esquina superior derecha
4. Selecciona "Más" > "Exportar chat"
5. Elige si quieres incluir los medios o no
6. Comparte el archivo contigo mismo por correo o guarda el archivo .txt

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- date-fns 