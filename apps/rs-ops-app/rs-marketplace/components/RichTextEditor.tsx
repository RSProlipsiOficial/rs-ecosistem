

import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';

import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { StrikethroughIcon } from './icons/StrikethroughIcon';
import { ListOrderedIcon } from './icons/ListOrderedIcon';
import { ListUnorderedIcon } from './icons/ListUnorderedIcon';
import { AlignLeftIcon } from './icons/AlignLeftIcon';
import { AlignCenterIcon } from './icons/AlignCenterIcon';
import { AlignRightIcon } from './icons/AlignRightIcon';
import { AlignJustifyIcon } from './icons/AlignJustifyIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { CodeIcon } from './icons/CodeIcon';
import { RemoveFormatIcon } from './icons/RemoveFormatIcon';
import { TextColorIcon } from './icons/TextColorIcon';
import { HighlightIcon } from './icons/HighlightIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ImageIcon } from './icons/ImageIcon';
import { HorizontalRuleIcon } from './icons/HorizontalRuleIcon';


interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

interface MenuBarProps {
    editor: Editor | null;
    openLinkModal: () => void;
}

const MenuBar = ({ editor, openLinkModal }: MenuBarProps) => {
    const imageInputRef = useRef<HTMLInputElement>(null);

    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        imageInputRef.current?.click();
    }, []);
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, etc.).');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (src) {
                editor.chain().focus().setImage({ src, alt: 'Imagem na descrição' }).run();
            }
        };
        reader.onerror = () => {
            alert('Ocorreu um erro ao ler o arquivo.');
        };
        reader.readAsDataURL(file);
    
        if (event.target) {
            event.target.value = '';
        }
    };

    const ToolbarButton = ({ onClick, isActive, children, title }: { onClick: () => void, isActive?: boolean, children?: React.ReactNode, title: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded-md transition-colors flex flex-col items-center justify-center ${isActive ? 'bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))]' : 'text-[rgb(var(--color-brand-text-dim))] hover:bg-[rgb(var(--color-brand-gray))]'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[rgb(var(--color-brand-gray-light))]">
            <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
                <UndoIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
                <RedoIcon className="w-5 h-5" />
            </ToolbarButton>
            <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
             <select
                onChange={(e) => {
                    const value = e.target.value;
                    const level = parseInt(value, 10);
                    if (level === 0) {
                        editor.chain().focus().setParagraph().run();
                    } else {
                        editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                    }
                }}
                 value={
                    editor.isActive('heading', { level: 1 }) ? '1' :
                    editor.isActive('heading', { level: 2 }) ? '2' :
                    editor.isActive('heading', { level: 3 }) ? '3' : '0'
                }
                className="bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] text-[rgb(var(--color-brand-text-light))] py-2 px-2 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))] transition-colors text-sm font-semibold focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
            >
                <option value="0">Parágrafo</option>
                <option value="1">Título 1</option>
                <option value="2">Título 2</option>
                <option value="3">Título 3</option>
            </select>
            <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrito">
                <BoldIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Itálico">
                <ItalicIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Sublinhado">
                <UnderlineIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Tachado">
                <StrikethroughIcon className="w-5 h-5" />
            </ToolbarButton>
             <div className="relative">
                <ToolbarButton onClick={() => {}} isActive={editor.isActive('textStyle')} title="Cor do Texto">
                   <TextColorIcon className="w-5 h-5" />
                   <div 
                     className="w-full h-1 rounded-full mt-1 border border-[rgb(var(--color-brand-gray))] " 
                     style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
                   ></div>
                </ToolbarButton>
                <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(event.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#FFFFFF'}
                />
            </div>
            <div className="relative">
                <ToolbarButton onClick={() => {}} isActive={editor.isActive('highlight')} title="Cor de Destaque">
                    <HighlightIcon className="w-5 h-5" />
                     <div 
                         className="w-full h-1 rounded-full mt-1 border border-[rgb(var(--color-brand-gray))]" 
                         style={{ backgroundColor: editor.getAttributes('highlight').color || `rgb(var(--color-brand-gold))` }}
                    ></div>
                </ToolbarButton>
                <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
                    value={editor.getAttributes('highlight').color || `rgb(var(--color-brand-gold))`}
                />
            </div>
            <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Alinhar à Esquerda">
                <AlignLeftIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centralizar">
                <AlignCenterIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Alinhar à Direita">
                <AlignRightIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justificar">
                <AlignJustifyIcon className="w-5 h-5" />
            </ToolbarButton>
             <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
            <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} title="Adicionar Link">
                <LinkIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Adicionar Imagem/GIF">
                <ImageIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha Horizontal">
                <HorizontalRuleIcon className="w-5 h-5" />
            </ToolbarButton>
             <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista com Marcadores">
                <ListUnorderedIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Lista Numerada">
                <ListOrderedIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citação">
                <QuoteIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Bloco de Código">
                <CodeIcon className="w-5 h-5" />
            </ToolbarButton>
            <div className="border-l border-[rgb(var(--color-brand-gray-light))] mx-1 h-6 self-center"></div>
             <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Limpar Formato">
                <RemoveFormatIcon className="w-5 h-5" />
            </ToolbarButton>
        </div>
    );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false, // Prevent opening link on click inside editor
                autolink: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Image,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none',
            },
        },
    });

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const openLinkModal = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href || '';
        setLinkUrl(previousUrl);
        setIsLinkModalOpen(true);
    }, [editor]);

    const closeLinkModal = useCallback(() => {
        setIsLinkModalOpen(false);
        setLinkUrl('');
    }, []);

    const saveLink = useCallback(() => {
        if (!editor) return;

        if (linkUrl) {
            let finalUrl = linkUrl;
            if (!/^https?:\/\//i.test(linkUrl) && !/^mailto:/i.test(linkUrl)) {
                finalUrl = `https://${linkUrl}`;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
        } else {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }
        closeLinkModal();
    }, [editor, linkUrl, closeLinkModal]);


    return (
        <div className="bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md focus-within:border-[rgb(var(--color-brand-gold))] transition-colors">
            <style>{`
                .ProseMirror {
                    color: rgb(var(--color-brand-text-light));
                }
                .ProseMirror blockquote {
                    border-left: 3px solid rgb(var(--color-brand-gold)); /* amber-500 */
                    padding-left: 1rem;
                    margin-left: 0.5rem;
                    font-style: italic;
                    color: rgb(var(--color-brand-text-dim)); /* gray-300 */
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5rem;
                }
                .ProseMirror a {
                    color: rgb(var(--color-info)); /* A golden-green for links */
                    text-decoration: underline;
                    cursor: pointer;
                }
                .ProseMirror code {
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 0.2em 0.4em;
                    border-radius: 5px;
                    color: #f3f4f6;
                }
                .ProseMirror pre {
                    background-color: rgb(var(--color-brand-dark)); /* gray-900 */
                    padding: 1rem;
                    border-radius: 0.5rem;
                    color: rgb(var(--color-brand-text-dim));
                    font-family: monospace;
                }
                 .ProseMirror mark {
                    border-radius: 2px;
                    padding: 0.1em 0.2em;
                 }
                 .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                 }
            `}</style>
            <MenuBar editor={editor} openLinkModal={openLinkModal} />
            <div className="min-h-[200px] cursor-text p-4">
                <EditorContent editor={editor} />
            </div>

            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-[rgb(var(--color-brand-dark))]/[.70] z-[101] flex items-center justify-center p-4" onClick={closeLinkModal}>
                    <div 
                        className="bg-[rgb(var(--color-brand-dark))] border-2 border-[rgb(var(--color-brand-gold))]/[.30] rounded-lg shadow-2xl p-6 w-full max-w-md space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-[rgb(var(--color-brand-text-light))]">Adicionar / Editar Link</h3>
                        <div>
                            <label htmlFor="link-url" className="block text-sm font-medium text-[rgb(var(--color-brand-text-dim))] mb-1">URL</label>
                            <input
                                id="link-url"
                                type="url"
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                autoFocus
                                className="w-full bg-[rgb(var(--color-brand-gray))] border-2 border-[rgb(var(--color-brand-gray-light))] rounded-md py-2 px-3 text-[rgb(var(--color-brand-text-light))] focus:outline-none focus:border-[rgb(var(--color-brand-gold))]"
                                placeholder="https://exemplo.com"
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveLink(); } }}
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={closeLinkModal}
                                className="text-sm font-semibold bg-[rgb(var(--color-brand-gray))] text-[rgb(var(--color-brand-text-light))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-gray-light))]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={saveLink}
                                className="text-sm font-bold bg-[rgb(var(--color-brand-gold))] text-[rgb(var(--color-brand-dark))] py-2 px-4 rounded-md hover:bg-[rgb(var(--color-brand-secondary))]"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
