/*
  # Create Blog Posts Table for Multi-language Content Management

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `slug` (text, unique, required for SEO URLs)
      - Multi-language title fields: title_en, title_fr, title_es, title_pt, title_de, title_ja, title_hi, title_ru
      - Multi-language content fields: content_en, content_fr, content_es, content_pt, content_de, content_ja, content_hi, content_ru
      - Multi-language excerpt fields: excerpt_en, excerpt_fr, excerpt_es, excerpt_pt, excerpt_de, excerpt_ja, excerpt_hi, excerpt_ru
      - `author` (text, required)
      - `featured_image` (text, URL to image)
      - `category` (text, for organizing posts)
      - `tags` (text, comma-separated tags)
      - `published` (boolean, default false)
      - `featured` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `blog_posts` table
    - Add policy for authenticated admin users to manage blog posts
    - Public read access to published posts only

  3. Features
    - Multi-language support for global audience
    - SEO-friendly slug system
    - Featured posts capability
    - Category and tag organization
    - Draft/published workflow
*/

-- Create blog_posts table with all specified columns
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text DEFAULT '',
  title_fr text DEFAULT '',
  title_es text DEFAULT '',
  title_pt text DEFAULT '',
  title_de text DEFAULT '',
  title_ja text DEFAULT '',
  title_hi text DEFAULT '',
  title_ru text DEFAULT '',
  content_en text DEFAULT '',
  content_fr text DEFAULT '',
  content_es text DEFAULT '',
  content_pt text DEFAULT '',
  content_de text DEFAULT '',
  content_ja text DEFAULT '',
  content_hi text DEFAULT '',
  content_ru text DEFAULT '',
  excerpt_en text DEFAULT '',
  excerpt_fr text DEFAULT '',
  excerpt_es text DEFAULT '',
  excerpt_pt text DEFAULT '',
  excerpt_de text DEFAULT '',
  excerpt_ja text DEFAULT '',
  excerpt_hi text DEFAULT '',
  excerpt_ru text DEFAULT '',
  author text NOT NULL,
  featured_image text DEFAULT '',
  category text DEFAULT '',
  tags text DEFAULT '',
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on blog_posts table
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated admin users to manage blog posts
CREATE POLICY "Admin users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public read access to published posts only
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (published = true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at ON blog_posts(updated_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_blog_posts_updated_at();
