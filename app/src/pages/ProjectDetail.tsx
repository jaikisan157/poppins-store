import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, getImageUrl } from '@/lib/api';
import type { Product } from '@/types';
import { useSocket } from '@/contexts/SocketContext';
import {
  ExternalLink,
  ArrowLeft,
  Eye,
  Zap,
  Code2,
  ArrowUpRight,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinProduct, leaveProduct } = useSocket();

  const [project, setProject] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      joinProduct(id);
    }

    return () => {
      if (id) {
        leaveProduct(id);
      }
    };
  }, [id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getById(id!);
      setProject(response.data.product);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetIt = async () => {
    if (!project) return;

    // Track click
    try {
      await productsApi.trackClick(project._id);
    } catch { }

    if (project.externalUrl) {
      window.open(project.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Purchase link coming soon!');
    }
  };

  // Parse YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <div className="aspect-video shimmer rounded-xl" />
              <div className="flex gap-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 shimmer rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <div className="h-4 shimmer rounded w-1/3" />
              <div className="h-8 shimmer rounded w-3/4" />
              <div className="h-4 shimmer rounded w-full" />
              <div className="h-4 shimmer rounded w-full" />
              <div className="h-12 shimmer rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const youtubeEmbed = project.videoUrl ? getYouTubeEmbedUrl(project.videoUrl) : null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {/* Back button */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
          {/* Left: Media */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main image / video */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {showVideo && youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={project.name}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : showVideo && project.videoUrl && !youtubeEmbed ? (
                <video
                  src={project.videoUrl}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <img
                    src={getImageUrl(project.images[selectedImage]?.url)}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                  {project.videoUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center group/play"
                    >
                      <div className="h-16 w-16 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center shadow-glow-lg group-hover/play:scale-110 transition-transform duration-300">
                        <Play className="h-6 w-6 text-primary-foreground ml-1" />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnails */}
            {(project.images.length > 1 || project.videoUrl) && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setShowVideo(false);
                    }}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === index && !showVideo
                      ? 'border-primary shadow-glow'
                      : 'border-white/10 hover:border-white/20'
                      }`}
                  >
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.alt || project.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                {project.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex items-center justify-center bg-white/[0.05] ${showVideo ? 'border-primary shadow-glow' : 'border-white/10 hover:border-white/20'
                      }`}
                  >
                    <Play className="h-5 w-5 text-primary" />
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            <div className="pt-6 border-t border-white/[0.06]">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">About This Project</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
            </div>
          </div>

          {/* Right: Info & CTA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category & Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-medium tracking-wider uppercase text-primary px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10">
                  {project.category}
                </span>
                {project.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-neon-purple">
                    <Zap className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground leading-tight">
                {project.name}
              </h1>
              {project.shortDescription && (
                <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                  {project.shortDescription}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-mono">{project.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-mono">{project.clickCount || 0} clicks</span>
              </div>
            </div>

            {/* GET IT Button */}
            <button
              onClick={handleGetIt}
              className="w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-base font-bold rounded-xl hover:bg-primary/90 transition-all duration-300 glow-primary hover:glow-primary-strong hover:-translate-y-0.5 active:translate-y-0"
            >
              <ExternalLink className="h-5 w-5" />
              Get It Now
            </button>

            {/* What's Included */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                What's Included
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Full source code',
                  'Documentation & setup guide',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading text-sm font-semibold text-foreground">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading text-sm font-semibold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-white/5 text-muted-foreground border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Projects */}
        {project.relatedProducts && project.relatedProducts.length > 0 && (
          <div className="border-t border-white/[0.06] pt-16">
            <div className="mb-8">
              <p className="text-xs font-mono font-medium tracking-wider uppercase text-primary mb-2">
                You may also like
              </p>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                Related Projects
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {project.relatedProducts.map((related) => (
                <Link key={related._id} to={`/project/${related._id}`}>
                  <div className="group overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-500 hover:shadow-glow">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={getImageUrl(related.images[0]?.url)}
                        alt={related.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
                      <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {related.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{related.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
