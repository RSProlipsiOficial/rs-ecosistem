
export interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

// Hardcoded initial team member data
export const initialTeamMembers: TeamMember[] = [
  { id: 1, name: 'João Silva', title: 'CEO & Fundador', bio: 'Visionário por trás da fusão de marketing digital e MMN.', imageUrl: 'https://picsum.photos/seed/person1/200/200' },
  { id: 2, name: 'Maria Souza', title: 'Diretora de Marketing', bio: 'Especialista em estratégias digitais de alta performance.', imageUrl: 'https://picsum.photos/seed/person2/200/200' },
  { id: 3, name: 'Carlos Santos', title: 'Gerente de Rede', bio: 'Líder experiente em construção e suporte de equipes MMN.', imageUrl: 'https://picsum.photos/seed/person3/200/200' },
  { id: 4, name: 'Ana Costa', title: 'Head de Produtos', bio: 'Responsável pela inovação e qualidade dos nossos produtos.', imageUrl: 'https://picsum.photos/seed/person4/200/200' },
];
