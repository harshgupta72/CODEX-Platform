"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoading } from "./global-loader";
import { ReactNode, MouseEvent } from "react";

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  // loading text removed for minimalist loader
  // estimated time removed for minimalist loader
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  replace?: boolean;
  prefetch?: boolean;
}

export function LoadingLink({ 
  href, 
  children, 
  className = "",
  onClick,
  replace = false,
  prefetch = true
}: LoadingLinkProps) {
  const router = useRouter();
  const { setLoading } = useLoading();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Don't show loader for external links or if default is prevented
    if (e.defaultPrevented || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Show loading state
    setLoading(true);

    // Navigate programmatically to ensure we can control the loading state
    e.preventDefault();
    
    const navigate = () => {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
      
      // Hide loading after a minimum duration to show the animation
      setTimeout(() => {
        setLoading(false);
      }, 600);
    };

    // Add a small delay to show loading animation
    setTimeout(navigate, 100);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}

// Custom hook for programmatic navigation with loading
export function useLoadingRouter() {
  const router = useRouter();
  const { setLoading } = useLoading();

  const push = (href: string) => {
    setLoading(true);
    router.push(href);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const replace = (href: string) => {
    setLoading(true);
    router.replace(href);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return { push, replace };
}
