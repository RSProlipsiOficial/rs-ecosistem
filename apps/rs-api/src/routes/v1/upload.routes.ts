
import express from 'express';
import multer from 'multer';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAuth, requireRole, ROLES } from '../../middlewares/supabaseAuth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// POST /v1/upload/pin
router.post('/pin', supabaseAuth, requireRole([ROLES.ADMIN]), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `pin_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(b => b.name === 'pins')) {
            await supabase.storage.createBucket('pins', { public: true });
        }

        const { data, error } = await supabase.storage
            .from('pins')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: publicData } = supabase.storage
            .from('pins')
            .getPublicUrl(data.path);

        res.json({
            success: true,
            url: publicData.publicUrl
        });

    } catch (error: any) {
        console.error('Erro no upload de PIN:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
