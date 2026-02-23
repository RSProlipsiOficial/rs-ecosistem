export { supabase } from '../lib/supabaseClient';

// ============================================
// 📤 UPLOAD DE ARQUIVOS NO SUPABASE
// ============================================

/**
 * Upload de arquivo para o Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket (ex: 'pins', 'avatars', 'products')
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública do arquivo
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = ''
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Obter URL pública
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

/**
 * Upload de imagem de PIN
 */
export const uploadPinImage = async (file: File, pinId: string): Promise<string> => {
  return uploadFile(file, 'pins', pinId);
};

/**
 * Upload de avatar de consultor
 */
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  return uploadFile(file, 'avatars', userId);
};

/**
 * Upload de imagem de produto
 */
export const uploadProductImage = async (file: File, productId: string): Promise<string> => {
  return uploadFile(file, 'products', productId);
};

/**
 * Deletar arquivo do Supabase Storage
 */
export const deleteFile = async (bucket: string, filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
};

/**
 * Listar arquivos de um bucket
 */
export const listFiles = async (bucket: string, folder: string = ''): Promise<any[]> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
};

// ============================================
// 🗄️ BUCKETS NECESSÁRIOS
// ============================================

export const STORAGE_BUCKETS = {
  PINS: 'pins',
  AVATARS: 'avatars',
  PRODUCTS: 'products',
  DOCUMENTS: 'documents',
  BANNERS: 'banners',
  LOGOS: 'logos',
};

/**
 * Criar buckets no Supabase (executar uma vez)
 */
export const createBuckets = async () => {
  const bucketsToCreate = Object.values(STORAGE_BUCKETS);

  for (const bucketName of bucketsToCreate) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error(`Erro ao criar bucket ${bucketName}:`, error);
      } else {
        console.log(`Bucket ${bucketName} criado com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao criar bucket ${bucketName}:`, error);
    }
  }
};
