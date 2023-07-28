// useClipboard.js
export default function useClipboard() {
  const copyToClipboard = async (contentToCopy) => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      alert('Texto copiado al portapapeles.');
    } catch (error) {
      console.error('Error al copiar el texto:', error);
    }
  };

  return { copyToClipboard };
}
