import { BaseRepository } from "./baseRepository";
import { supabase } from "@/lib/supabase";

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  category: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface CommunityRating {
  id: string;
  post_id: string;
  user_id: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

/**
 * Repository for community posts operations
 */
export class CommunityPostRepository extends BaseRepository<CommunityPost> {
  constructor() {
    super("community_posts");
  }

  /**
   * Get approved posts with pagination
   */
  async getApprovedPosts(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as unknown as CommunityPost[];
  }

  /**
   * Get posts by user
   */
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as unknown as CommunityPost[];
  }

  /**
   * Approve a post
   */
  async approve(postId: string) {
    return this.update(postId, {
      status: "approved",
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Reject a post
   */
  async reject(postId: string) {
    return this.update(postId, {
      status: "rejected",
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Toggle pin status
   */
  async togglePin(postId: string) {
    const post = await this.getById(postId);
    if (!post) throw new Error("Post not found");
    
    return this.update(postId, {
      is_pinned: !post.is_pinned,
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Repository for community comments operations
 */
export class CommunityCommentRepository extends BaseRepository<CommunityComment> {
  constructor() {
    super("community_comments");
  }

  /**
   * Get comments for a post
   */
  async getByPostId(postId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("post_id", postId)
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return data as unknown as CommunityComment[];
  }

  /**
   * Approve a comment
   */
  async approve(commentId: string) {
    return this.update(commentId, {
      status: "approved",
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Reject a comment
   */
  async reject(commentId: string) {
    return this.update(commentId, {
      status: "rejected",
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Repository for community ratings operations
 */
export class CommunityRatingRepository extends BaseRepository<CommunityRating> {
  constructor() {
    super("community_ratings");
  }

  /**
   * Get ratings for a post
   */
  async getByPostId(postId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("post_id", postId)
      .eq("status", "approved");
    
    if (error) throw error;
    return data as unknown as CommunityRating[];
  }

  /**
   * Get average rating for a post
   */
  async getAverageRating(postId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("rating")
      .eq("post_id", postId)
      .eq("status", "approved");
    
    if (error) throw error;
    
    const ratings = data as unknown as { rating: number }[];
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }

  /**
   * Approve a rating
   */
  async approve(ratingId: string) {
    return this.update(ratingId, {
      status: "approved",
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Reject a rating
   */
  async reject(ratingId: string) {
    return this.update(ratingId, {
      status: "rejected",
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Update rating value
   */
  async updateRating(ratingId: string, newRating: number) {
    return this.update(ratingId, {
      rating: newRating,
      updated_at: new Date().toISOString(),
    });
  }
}

export const communityPostRepository = new CommunityPostRepository();
export const communityCommentRepository = new CommunityCommentRepository();
export const communityRatingRepository = new CommunityRatingRepository();
