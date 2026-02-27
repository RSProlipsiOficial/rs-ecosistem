/**
 * Serviço de Opiniões e Dúvidas — RS Marketplace
 * Conecta ao Supabase (product_reviews, product_questions, product_answers)
 */
import { supabase } from './supabaseClient';
import { Review, Question, Answer } from '../types';

// === REVIEWS (OPINIÕES) ===

export async function fetchReviewsByProduct(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[reviewService] Erro ao buscar reviews:', error);
        return [];
    }

    // Map DB schema to frontend Review type
    return (data || []).map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        productName: '',
        author: row.customer_name || 'Anônimo',
        rating: row.rating,
        title: row.title || '',
        text: row.comment || '',
        createdAt: row.created_at,
        status: row.is_approved ? 'Aprovada' as const : 'Pendente' as const,
    }));
}

export async function fetchAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[reviewService] Erro ao buscar todas as reviews:', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        productName: '',
        author: row.customer_name || 'Anônimo',
        rating: row.rating,
        title: row.title || '',
        text: row.comment || '',
        createdAt: row.created_at,
        status: row.is_approved ? 'Aprovada' as const : 'Pendente' as const,
    }));
}

export async function submitReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review | null> {
    const { data, error } = await supabase
        .from('product_reviews')
        .insert({
            product_id: review.productId,
            customer_id: 'anonymous',
            customer_name: review.author,
            rating: review.rating,
            title: review.title,
            comment: review.text,
            verified_purchase: false,
            is_approved: false,
            helpful_count: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('[reviewService] Erro ao enviar review:', error);
        return null;
    }

    return {
        id: data.id,
        productId: data.product_id,
        productName: review.productName,
        author: data.customer_name,
        rating: data.rating,
        title: data.title || '',
        text: data.comment || '',
        createdAt: data.created_at,
        status: 'Pendente',
    };
}

export async function updateReviewStatus(reviewId: string, isApproved: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);

    if (error) {
        console.error('[reviewService] Erro ao atualizar status:', error);
        return false;
    }
    return true;
}

export async function deleteReviews(reviewIds: string[]): Promise<boolean> {
    const { error } = await supabase
        .from('product_reviews')
        .delete()
        .in('id', reviewIds);

    if (error) {
        console.error('[reviewService] Erro ao deletar reviews:', error);
        return false;
    }
    return true;
}

// === QUESTIONS (DÚVIDAS) ===

export async function fetchQuestionsByProduct(productId: string): Promise<Question[]> {
    const { data, error } = await supabase
        .from('product_questions')
        .select(`
      id,
      product_id,
      author,
      text,
      created_at,
      product_answers (
        id,
        author,
        text,
        created_at
      )
    `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[reviewService] Erro ao buscar questions:', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        author: row.author,
        text: row.text,
        createdAt: row.created_at,
        answers: (row.product_answers || []).map((a: any) => ({
            id: a.id,
            author: a.author,
            text: a.text,
            createdAt: a.created_at,
        })),
    }));
}

export async function submitQuestion(question: Omit<Question, 'id' | 'createdAt' | 'answers'>): Promise<Question | null> {
    const { data, error } = await supabase
        .from('product_questions')
        .insert({
            product_id: question.productId,
            author: question.author,
            text: question.text,
        })
        .select()
        .single();

    if (error) {
        console.error('[reviewService] Erro ao enviar question:', error);
        return null;
    }

    return {
        id: data.id,
        productId: data.product_id,
        author: data.author,
        text: data.text,
        createdAt: data.created_at,
        answers: [],
    };
}

export async function submitAnswer(questionId: string, answer: Omit<Answer, 'id' | 'createdAt'>): Promise<Answer | null> {
    const { data, error } = await supabase
        .from('product_answers')
        .insert({
            question_id: questionId,
            author: answer.author,
            text: answer.text,
        })
        .select()
        .single();

    if (error) {
        console.error('[reviewService] Erro ao enviar answer:', error);
        return null;
    }

    return {
        id: data.id,
        author: data.author,
        text: data.text,
        createdAt: data.created_at,
    };
}
