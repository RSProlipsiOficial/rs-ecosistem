
import React, { useRef, useEffect, useCallback, useState } from 'react';
import IconPickerModal from './IconPickerModal';
import { generateText } from './AIComponents'; // Only import generateText

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const fonts = ['Inter', 'Roboto', 'Lato', 'Montserrat', 'Open Sans'];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, height = '200px' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>({});
  const savedRange = useRef<Range | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && value !== editor.innerHTML) {
      editor.innerHTML = value;
    }
  }, [value]);
  
  const updateToolbarState = useCallback(() => {
    if (!editorRef.current) return;
    
    const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'];
    const newActiveCommands: Record<string, boolean> = {};
    commands.forEach(cmd => {
      newActiveCommands[cmd] = document.queryCommandState(cmd);
    });

    let isLink = false;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        let node = selection.getRangeAt(0).startContainer;
        if (node.nodeType === 3) { // Text node
            node = node.parentNode!;
        }
        while (node && node !== editorRef.current) {
            if (node.nodeName === 'A') {
                isLink = true;
                break;
            }
            node = (node as Element).parentNode!;
        }
    }
    newActiveCommands['createLink'] = isLink;
    
    setActiveCommands(newActiveCommands);
  }, []);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  }, [editorRef]);

  const restoreSelection = useCallback(() => {
    if (savedRange.current) {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(savedRange.current);
        }
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    document.addEventListener('selectionchange', updateToolbarState);
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('focus', updateToolbarState);
    
    editor.addEventListener('keyup', saveSelection);
    editor.addEventListener('mouseup', saveSelection);
    editor.addEventListener('focus', saveSelection);
    editor.addEventListener('blur', saveSelection);

    const handleClickOutside = (event: MouseEvent) => {
        if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
            setIsAiMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', updateToolbarState);
      editor.removeEventListener('keyup', updateToolbarState);
      editor.removeEventListener('mouseup', updateToolbarState);
      editor.removeEventListener('focus', updateToolbarState);
      
      editor.removeEventListener('keyup', saveSelection);
      editor.removeEventListener('mouseup', saveSelection);
      editor.removeEventListener('focus', saveSelection);
      editor.removeEventListener('blur', saveSelection);

      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [updateToolbarState, saveSelection]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveSelection();
      updateToolbarState();
    }
  }, [onChange, saveSelection, updateToolbarState]);

  const execCmd = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    handleInput();
  };
  
  const handleLink = () => {
    const isLink = activeCommands['createLink'];
    let defaultUrl = 'https://';
    
    if (isLink && savedRange.current) {
        let parentElement: Node | null = savedRange.current.startContainer;
        if (parentElement.nodeType === 3) parentElement = parentElement.parentNode;
        
        while (parentElement && parentElement !== editorRef.current) {
            if (parentElement.nodeName === 'A') {
                defaultUrl = (parentElement as HTMLAnchorElement).href;
                break;
            }
            parentElement = parentElement.parentNode;
        }
    }
    
    const url = prompt('Enter the URL:', defaultUrl);
    if (url) {
      execCmd('createLink', url);
    }
  };
  
  const handleImage = () => {
    const url = prompt('Enter the Image URL:');
    if (url) {
      const imgHTML = `<img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 4px;" />`;
      execCmd('insertHTML', imgHTML);
    }
  };

  const handleIconSelect = (svgString: string) => {
    editorRef.current?.focus();
    restoreSelection();
    const iconWrapper = `<span contenteditable="false" style="cursor: default; user-select: none;">${svgString}</span>&nbsp;`;
    document.execCommand('insertHTML', false, iconWrapper);
    handleInput();
    setIsIconPickerOpen(false);
  };
  
  const handleRewriteOrImprove = async (mode: 'rewrite' | 'improve') => {
      setIsAiMenuOpen(false);
      editorRef.current?.focus();
      restoreSelection();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      setIsAiLoading(true);
      try {
        const prompt = mode === 'rewrite' 
            ? `Reescreva o seguinte texto em português, focando em clareza, concisão e profissionalismo. Formate o resultado em HTML, usando tags como <p> e <strong> se apropriado. Texto: "${selectedText}"`
            : `Melhore a escrita do seguinte texto em português, corrigindo gramática, melhorando clareza e estilo. Formate o resultado em HTML, usando tags como <p> e <strong> se apropriado. Texto: "${selectedText}"`;
        const newText = await generateText(prompt);
        execCmd('insertHTML', newText);
      } catch (error) {
          console.error('AI text processing failed:', error);
          alert('Falha ao processar texto com IA.');
      } finally {
          setIsAiLoading(false);
      }
  };

  const hasSelection = savedRange.current ? savedRange.current.toString().trim().length > 0 : false;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-md text-text-primary focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
      <div className="flex items-center flex-wrap p-1 border-b border-gray-600 gap-1">
        <select
          onChange={e => execCmd('formatBlock', e.target.value)}
          className="bg-gray-800 border-none rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-gray-700 text-sm focus:outline-none"
          title="Formato do Bloco"
        >
          <option value="p">Parágrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>
        
        <select
          onChange={e => execCmd('fontName', e.target.value)}
          className="bg-gray-800 border-none rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-gray-700 text-sm focus:outline-none"
          title="Família da Fonte"
        >
          {fonts.map(font => <option key={font} value={font}>{font}</option>)}
        </select>
        
        <ToolbarDivider />
        
        <EditorButton onClick={() => execCmd('bold')} title="Negrito (Ctrl+B)" isActive={activeCommands['bold']}><BoldIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('italic')} title="Itálico (Ctrl+I)" isActive={activeCommands['italic']}><ItalicIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('underline')} title="Sublinhado (Ctrl+U)" isActive={activeCommands['underline']}><UnderlineIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('strikeThrough')} title="Tachado" isActive={activeCommands['strikeThrough']}><StrikeIcon /></EditorButton>
        
        <ToolbarDivider />

        <ColorPickerButton command="foreColor" title="Cor do Texto" icon={<TextColorIcon />} />
        <ColorPickerButton command="hiliteColor" title="Cor do Destaque" icon={<HighlightIcon />} />

        <ToolbarDivider />

        <EditorButton onClick={() => execCmd('justifyLeft')} title="Alinhar à Esquerda"><AlignLeftIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('justifyCenter')} title="Alinhar ao Centro"><AlignCenterIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('justifyRight')} title="Alinhar à Direita"><AlignRightIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('justifyFull')} title="Justificar"><AlignJustifyIcon /></EditorButton>

        <ToolbarDivider />

        <EditorButton onClick={() => execCmd('insertUnorderedList')} title="Lista Não Ordenada" isActive={activeCommands['insertUnorderedList']}><ListIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('insertOrderedList')} title="Lista Ordenada" isActive={activeCommands['insertOrderedList']}><ListOrderedIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('formatBlock', 'blockquote')} title="Citação em Bloco"><BlockquoteIcon /></EditorButton>
        
        <ToolbarDivider />

        <EditorButton onClick={handleLink} title="Adicionar Link" isActive={activeCommands['createLink']}><LinkIcon /></EditorButton>
        <EditorButton onClick={() => execCmd('unlink')} title="Remover Link" disabled={!activeCommands['createLink']}><UnlinkIcon /></EditorButton>
        <EditorButton onClick={handleImage} title="Inserir Imagem"><ImageIcon /></EditorButton>
        <EditorButton onClick={() => setIsIconPickerOpen(true)} title="Inserir Ícone"><SparklesIconSVG /></EditorButton>

        <ToolbarDivider />
        
        <div className="relative" ref={aiMenuRef}>
            <EditorButton onClick={() => setIsAiMenuOpen(prev => !prev)} title="Ações de IA" isActive={isAiMenuOpen}>
                {isAiLoading ? <SpinnerIcon /> : <span>IA</span>} {/* Replaced AIActionIcon with "IA" text */}
            </EditorButton>
            {isAiMenuOpen && (
                <div className="absolute top-full mt-2 w-56 bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg z-10 p-1">
                    <button onClick={() => handleRewriteOrImprove('rewrite')} disabled={!hasSelection} className="w-full text-left px-3 py-2 text-sm rounded text-text-primary hover:bg-accent hover:text-button-text transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RewriteIcon /><span>Reescrever Seleção</span>
                    </button>
                    <button onClick={() => handleRewriteOrImprove('improve')} disabled={!hasSelection} className="w-full text-left px-3 py-2 text-sm rounded text-text-primary hover:bg-accent hover:text-button-text transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ImproveIcon /><span>Melhorar Escrita</span>
                    </button>
                </div>
            )}
        </div>
        <EditorButton onClick={() => execCmd('removeFormat')} title="Limpar Formatação"><ClearFormattingIcon /></EditorButton>

      </div>
      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable
        className="w-full p-4 focus:outline-none prose-static"
        style={{ minHeight: height, color: 'var(--color-text-primary)' }}
        suppressContentEditableWarning={true}
      />
      {isIconPickerOpen && (
        <IconPickerModal
          isOpen={isIconPickerOpen}
          onClose={() => setIsIconPickerOpen(false)}
          onIconSelect={handleIconSelect}
        />
      )}
    </div>
  );
};

const ToolbarDivider: React.FC = () => <div className="w-px h-6 bg-gray-600 mx-1"></div>;

const EditorButton: React.FC<React.PropsWithChildren<{ onClick: () => void; title: string; isActive?: boolean; disabled?: boolean }>> = ({ onClick, title, children, isActive, disabled = false }) => (
    <button type="button" onClick={onClick} title={title} disabled={disabled} className={`p-2 rounded transition-colors focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed ${ isActive ? 'bg-accent text-button-text' : 'text-text-secondary hover:text-text-primary hover:bg-gray-700 focus:bg-gray-700'}`}>
        {children}
    </button>
);

const ColorPickerButton: React.FC<{ command: string; title: string; icon: React.ReactNode }> = ({ command, title, icon }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        document.execCommand(command, false, e.target.value);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <button type="button" onClick={handleClick} title={title} className="relative p-2 hover:bg-gray-700 rounded transition-colors text-text-secondary hover:text-text-primary focus:outline-none focus:bg-gray-700">
            {icon}
            <input 
                type="color" 
                ref={inputRef}
                onInput={handleChange} // use onInput for live preview on some browsers
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
        </button>
    );
};

// Icons - New Premium Set
const Icon: React.FC<{ children: React.ReactNode; viewBox?: string }> = ({ children, viewBox = "0 0 24 24" }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor">{children}</svg>;
const BoldIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5h4.5a3.5 3.5 0 010 7H8V5zm0 7h5.5a3.5 3.5 0 010 7H8v-7z" fill="none"/></Icon>;
const ItalicIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m-2 16h8m-10 0h2m8-16h-8m10 0h-2" fill="none"/></Icon>;
const UnderlineIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 19h12M8 5v6a4 4 0 008 0V5" fill="none"/></Icon>;
const StrikeIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M16 7c-2.833 0-5.167-1-5.167-4C10.833 6 7 6 7 6c0 4-4 4-4 4" fill="none"/></Icon>;
const ListIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6h11M5 6.01V6M5 12.01V12M5 18.01V18M9 12h11M9 18h11" fill="none"/></Icon>;
const ListOrderedIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6h11M9 12h11M9 18h11M5 18H4a1 1 0 01-1-1v-1a1 1 0 011-1h1v3zm-1-7h1a1 1 0 001-1V8a1 1 0 00-1-1H4a1 1 0 00-1 1v2h2zm-1-6H4a1 1 0 00-1 1v1a1 1 0 001 1h1V5z" fill="none"/></Icon>;
const LinkIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72" fill="none"/></Icon>;
const UnlinkIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72M3 11l6 6m-7-1l8-8" fill="none"/></Icon>;
const TextColorIcon = () => <Icon><path d="M4.083 15h15.834M6.917 5L12 15l5.083-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/></Icon>;
const HighlightIcon = () => <Icon><path d="M16.22 3.12l-9.1 9.1c-.53.53-.53 1.39 0 1.92l4.55 4.55c.53.53 1.39.53 1.92 0l9.1-9.1a1.36 1.36 0 000-1.92L18.14 3.12a1.36 1.36 0 00-1.92 0zM8.83 8.33L15.67 1.5M4 17l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></Icon>;
const AlignLeftIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h10M4 14h16M4 18h10" fill="none"/></Icon>;
const AlignCenterIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 10h10M4 14h16M7 18h10" fill="none"/></Icon>;
const AlignRightIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 10h10M4 14h16M10 18h10" fill="none"/></Icon>;
const AlignJustifyIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" fill="none"/></Icon>;
const BlockquoteIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12V8a4 4 0 014-4h2M14 12V8a4 4 0 014-4h2m-6 14v-8m-6 8v-8" fill="none"/></Icon>;
const ImageIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79zM21 12.79l-4.24-4.24a1 1 0 00-1.42 0l-4.24 4.24M15.08 18.42a1 1 0 01-1.42 0l-2.82-2.82a1 1 0 00-1.42 0l-2.12 2.12" fill="none"/></Icon>;
const ClearFormattingIcon = () => <Icon><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 5H18m-9-2l-2 16m9-14l-1.5 10M4 19h14m0-16l-9 16" fill="none"/></Icon>;
const SparklesIconSVG = () => <Icon viewBox="0 0 20 20"><path d="M10 3.5c.414 0 .75.336.75.75v1.5a.75.75 0 01-1.5 0v-1.5c0-.414.336-.75.75-.75zm0 11.5c.414 0 .75.336.75.75v1.5a.75.75 0 01-1.5 0v-1.5c0-.414.336-.75.75-.75zM5.05 5.05a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.9 9.9a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM3.5 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm11.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.05 14.95a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zm9.9-9.9a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0z"/></Icon>;
const SpinnerIcon = () => <Icon><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" className="animate-spin" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></Icon>;
const RewriteIcon = () => <Icon viewBox="0 0 20 20"><path fillRule="evenodd" d="M15.312 11.282a.75.75 0 01-.22.53l-2.625 2.625a.75.75 0 01-1.06-1.06L13.19 11.693A3.75 3.75 0 0010.5 9h-3a.75.75 0 010-1.5h3a5.25 5.25 0 110 10.5c-2.34 0-4.334-1.51-5.01-3.626a.75.75 0 011.458-.388 3.75 3.75 0 007.302 0l-1.78-1.78a.75.75 0 01.53-1.282z" clipRule="evenodd" /></Icon>;
const ImproveIcon = () => <Icon viewBox="0 0 20 20"><path d="M10 3.5a.75.75 0 01.75.75V8.5h4.25a.75.75 0 010 1.5H10.75V14.5a.75.75 0 01-1.5 0V10H5a.75.75 0 010-1.5h4.25V4.25A.75.75 0 0110 3.5zM3 8.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H3.75A.75.75 0 013 8.5zm13.25 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-3.11 5.86a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM5.9 14.36a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06z" /></Icon>;


export default RichTextEditor;
