/**
 * Centralized Type Definitions
 * 
 * This file contains shared TypeScript interfaces used across the application.
 * All common types should be defined here to ensure consistency and avoid duplication.
 */

import type { Json } from '@/integrations/supabase/types';

// =============================================================================
// TRAVELER & GROUP TYPES
// =============================================================================

/**
 * Represents a single traveler in a group
 */
export interface Traveler {
  name: string;
  age: number;
  birthDate?: string;
  relationship?: string;
  specialNeeds?: string;
}

/**
 * Park date assignment for itinerary planning
 */
export interface ParkDate {
  date: string;
  park: string;
  parkId?: string;
  notes?: string;
}

// =============================================================================
// CLIENT PROFILE TYPES
// =============================================================================

/**
 * Core client profile interface - used across guide dashboard, admin, and client management
 * Note: travelers and park_dates use Json type for Supabase compatibility
 */
export interface ClientProfile {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  group_size: number | null;
  travelers: Json; // Supabase JSON - cast to Traveler[] when needed
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  hotel: string | null;
  hotel_type: string | null;
  hotel_address?: string | null;
  completion_percentage: number | null;
  is_access_enabled: boolean | null;
  guide_name: string | null;
  park_dates: Json; // Supabase JSON - cast to ParkDate[] when needed
  plan_tier?: string;
  created_at?: string | null;
  updated_at?: string | null;
  has_contract?: boolean; // Runtime-computed field for admin views
  // Additional optional fields
  has_transport?: boolean | null;
  visited_before?: boolean | null;
  last_visit?: string | null;
  group_style?: string | null;
  priority?: string[] | null;
  physical_restrictions?: string | null;
  food_allergies?: string | null;
  uses_stroller_or_wheelchair?: string | null;
  has_celebration?: boolean | null;
  celebration_type?: string | null;
  expectations?: string | null;
  concerns?: string | null;
  special_requests?: string | null;
  has_my_disney_experience?: boolean | null;
  checklist_items?: Json | null;
  authorize_guide_access?: boolean | null;
  is_locked?: boolean | null;
  preferred_language?: string | null;
}

/**
 * Simplified client profile for list views and cards
 */
export interface ClientProfileSummary {
  id: string;
  user_id: string;
  responsible_name: string | null;
  email: string | null;
  whatsapp: string | null;
  group_size: number | null;
  arrival_date: string | null;
  departure_date: string | null;
  parks: string[] | null;
  hotel: string | null;
  completion_percentage: number | null;
  is_access_enabled: boolean | null;
  guide_name: string | null;
  plan_tier?: string;
}

/**
 * Helper function to safely cast travelers JSON to Traveler[]
 */
export function parseTravelers(travelers: Json): Traveler[] {
  if (!travelers) return [];
  if (Array.isArray(travelers)) {
    return travelers as unknown as Traveler[];
  }
  return [];
}

/**
 * Helper function to safely cast park_dates JSON to ParkDate[]
 */
export function parseParkDates(parkDates: Json): ParkDate[] {
  if (!parkDates) return [];
  if (Array.isArray(parkDates)) {
    return parkDates as unknown as ParkDate[];
  }
  return [];
}

// =============================================================================
// MULTIPASS STATUS TYPES
// =============================================================================

export interface MultipassStatus {
  id: string;
  user_id: string;
  is_purchased: boolean;
  purchased_at: string | null;
  confirmed_by: string | null;
  first_disney_park_date: string | null;
  notification_start_date: string | null;
  last_notification_at: string | null;
  last_notification_sent: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// ATTRACTION & CONTENT TYPES
// =============================================================================

export interface Attraction {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  park_id: string | null;
  area: string | null;
  type: string | null;
  thrill_level: string | null;
  height_requirement: number | null;
  duration: number | null;
  average_wait_time: number | null;
  best_time_to_visit: string | null;
  lightning_lane: boolean | null;
  tips: string | null;
  image_url: string | null;
  icon: string | null;
  popularity_score: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
}

export interface AttractionPreference {
  id: string;
  user_id: string;
  park_name: string;
  attraction_name: string;
  priority: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// RESTAURANT TYPES
// =============================================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string | null;
  price_range: '$' | '$$' | '$$$' | '$$$$' | string | null;
  park_id: string | null;
  area: string | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  menu_url: string | null;
  latitude: number | null;
  longitude: number | null;
  reservation_required: boolean | null;
  type: 'quick-service' | 'table-service' | 'signature' | string | null;
  featured: boolean | null;
  character_dining: boolean | null;
  michelin: boolean | null;
  tips: string | null;
  must_try: string | null;
  highlights: string[] | null;
  image_url: string | null;
  average_cost_per_person: number | null;
  operating_hours: Record<string, string> | null;
  category: 'disney' | 'universal' | 'fora-parques' | string | null;
  subcategory: string | null;
  color: string | null;
  created_at: string | null;
}

// =============================================================================
// PLANNER TYPES
// =============================================================================

export interface PlannerItem {
  id: string;
  planner_id: string;
  date: string;
  item_id: string | null;
  item_name: string;
  item_type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity' | 'hotel' | 'custom';
  category: string;
  color: string;
  icon: string | null;
  time_slot: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  notes: string | null;
  reservation_time: string | null;
  reservation_confirmed: boolean | null;
  completed: boolean | null;
  order_index: number | null;
  created_at: string | null;
}

export interface UserPlanner {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_days: number;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// =============================================================================
// LIBRARY ITEM TYPES (for drag-and-drop)
// =============================================================================

export interface LibraryItem {
  id: string;
  name: string;
  type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity';
  category: string;
  color: string;
  icon?: string;
  description?: string;
  duration?: number;
  park_id?: string;
  park_slug?: string;
  park_name?: string;
  cuisine?: string;
  price_range?: string;
  reservation_required?: boolean;
  brands?: string[];
  image_url?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Generic filter options
 */
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// FORM FIELD CHANGE HANDLER TYPE
// =============================================================================

/**
 * Generic field change handler for profile forms
 */
export type FieldChangeHandler<T> = (data: Partial<T>) => void | Promise<void>;

/**
 * Travel profile field change handler
 */
export type TravelProfileFieldHandler = FieldChangeHandler<ClientProfile>;
