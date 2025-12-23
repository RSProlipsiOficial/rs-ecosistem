export type AspectRatio = '1:1' | '9:16' | '3:4' | '16:9' | '4:5' | '1.91:1';

export interface AdFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  label: string;
  aspectRatio: AspectRatio; // For Gemini config
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: 'Playfair Display' | 'Inter' | 'Cinzel' | 'Lato';
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  type: 'headline' | 'body' | 'cta';
  uppercase?: boolean;
  opacity?: number;
  letterSpacing?: number; // em units
  shadow?: boolean;
}

export interface GeneratedCopy {
  headline: string;
  body: string;
  cta: string;
}

export interface EditorState {
  format: AdFormat;
  backgroundImage: string | null;
  layers: TextLayer[];
  selectedLayerId: string | null;
  isGeneratingImage: boolean;
  isGeneratingCopy: boolean;
}