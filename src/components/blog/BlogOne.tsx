"use client";
import React from "react";
import BlogOneMain from "./BlogOneMain";
import { IBlogs, useGetBlogsQuery } from "@/store/blogsApi";

function BlogOne() {
  const { data: blogData, isLoading, error } = useGetBlogsQuery();

  if (isLoading) {
    return (
      <div>
        <div className="blog-area-start rts-section-gapBottom">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="title-area-between">
                  <div className="skeleton-blog-title"></div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="cover-card-main-over">
                  <div className="row g-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="col-lg-3 col-md-6 col-sm-12">
                        <div className="single-blog-area-start skeleton-blog-card">
                          {/* Image Skeleton */}
                          <div className="skeleton-blog-image">
                            <div className="skeleton-category-badge"></div>
                          </div>

                          {/* Content Skeleton */}
                          <div className="skeleton-blog-content">
                            {/* Date/Meta */}
                            <div className="skeleton-blog-meta">
                              <div className="skeleton-meta-item"></div>
                              <div className="skeleton-meta-item"></div>
                            </div>

                            {/* Title */}
                            <div className="skeleton-blog-title-line"></div>
                            <div className="skeleton-blog-title-line short"></div>

                            {/* Excerpt */}
                            <div className="skeleton-blog-excerpt"></div>
                            <div className="skeleton-blog-excerpt short"></div>

                            {/* Read More */}
                            <div className="skeleton-read-more"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .skeleton-blog-title {
            height: 32px;
            width: 300px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
            margin-bottom: 24px;
          }

          .skeleton-blog-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
            animation: pulse 2s ease-in-out infinite;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }

          .skeleton-blog-image {
            position: relative;
            width: 100%;
            padding-bottom: 65%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-category-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            width: 80px;
            height: 28px;
            background: linear-gradient(90deg, #e5e5e5 25%, #d5d5d5 50%, #e5e5e5 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 14px;
          }

          .skeleton-blog-content {
            padding: 20px;
          }

          .skeleton-blog-meta {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
          }

          .skeleton-meta-item {
            height: 14px;
            width: 80px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          .skeleton-blog-title-line {
            height: 18px;
            width: 100%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 10px;
          }

          .skeleton-blog-title-line.short {
            width: 75%;
          }

          .skeleton-blog-excerpt {
            height: 14px;
            width: 100%;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-top: 12px;
            margin-bottom: 8px;
          }

          .skeleton-blog-excerpt.short {
            width: 60%;
          }

          .skeleton-read-more {
            height: 16px;
            width: 100px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-top: 16px;
          }
        `}</style>
      </div>
    );
  }

  if (error) return <div>Error loading blog posts...</div>;

  const selectedPosts = blogData?.slice(0, 4) || [];

  return (
    <div>
      <div className="blog-area-start rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-area-between">
                <h2 className="title-left mb--0">Latest Blog Post Insights</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="cover-card-main-over">
                <div className="row g-4">
                  {selectedPosts.map((post: IBlogs) => (
                    <div key={post._id} className="col-lg-3 col-md-6 col-sm-12">
                      <div className="single-blog-area-start">
                        <BlogOneMain
                          Slug={post._id}
                          blogImage={post.image}
                          blogTitle={post.title}
                          blogCategory={post.category}
                          createdAt={post.createdAt}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogOne;
