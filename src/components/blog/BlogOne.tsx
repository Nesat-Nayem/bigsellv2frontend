"use client";
import React from "react";
import BlogOneMain from "./BlogOneMain";
import { IBlogs, useGetBlogsQuery } from "@/store/blogsApi";

function BlogOne() {
  const { data: blogData, isLoading, error } = useGetBlogsQuery();

  if (isLoading) return <div>Loading...</div>;
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
