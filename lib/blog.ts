import fs from 'fs';
import path from 'path';
import { BlogPost } from '@/types';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

export function getAllBlogPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter(name => name.endsWith('.md'))
      .map(fileName => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parse frontmatter
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
        const match = fileContents.match(frontmatterRegex);
        
        if (!match) {
          console.error(`No frontmatter found in ${fileName}`);
          return null;
        }

        const frontmatter = match[1];
        const content = fileContents.replace(frontmatterRegex, '').trim();
        
        // Parse YAML frontmatter
        const data: any = {};
        frontmatter.split(/\r?\n/).forEach(line => {
          const separatorIndex = line.indexOf(':');
          if (separatorIndex !== -1) {
            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();
            data[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
          }
        });

        return {
          id,
          title: data.title || 'Sin título',
          slug: data.slug || id,
          excerpt: data.excerpt || '',
          content,
          author: data.author || 'ShopHub Team',
          publishedAt: data.publishedAt || new Date().toISOString(),
          updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
          category: data.category || 'blog',
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          featured: data.featured === 'true' || data.featured === true,
          imageUrl: data.imageUrl || '',
          searchQuery: data.searchQuery || ''
        } as BlogPost;
      })
      .filter((post): post is BlogPost => !!post);

    // Sort by date (newest first)
    return allPostsData.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const allPosts = getAllBlogPosts();
    return allPosts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error('Error getting blog post:', error);
    return null;
  }
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  try {
    const allPosts = getAllBlogPosts();
    return allPosts.filter(post => post.category === category);
  } catch (error) {
    console.error('Error getting blog posts by category:', error);
    return [];
  }
}

export function getFeaturedBlogPosts(): BlogPost[] {
  try {
    const allPosts = getAllBlogPosts();
    return allPosts.filter(post => post.featured);
  } catch (error) {
    console.error('Error getting featured blog posts:', error);
    return [];
  }
}
export function searchBlogPosts(query: string): BlogPost[] {
  try {
    const allPosts = getAllBlogPosts();
    const q = query.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(q) || 
      post.content.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q))
    );
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }
}
