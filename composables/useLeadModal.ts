export function useLeadModal() {
  const isOpen = useState('lead-modal-open', () => false);
  const buttonSource = useState<string>('lead-modal-source', () => '');

  function open(source: string = '') {
    buttonSource.value = source;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, buttonSource, open, close };
}
