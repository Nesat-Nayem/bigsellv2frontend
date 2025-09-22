"use client";
import React from "react";
import Link from "next/link";

interface BlogGridMainProps {
  Slug: string;
  blogImage: string;
  blogTitle?: string;
  blogCategory?: string;
  createdAt?: string;
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  Slug,
  blogImage,
  blogTitle,
  blogCategory,
  createdAt,
}) => {
  return (
    <>
      <Link href={`/blog/${Slug}`} className="thumbnail">
        <div style={{ width: "100%", height: "200px" }}>
          <img
            src={blogImage}
            alt="blog-area"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </Link>
      <div className="blog-body">
        <div className="top-area">
          <div className="single-meta">
            <i className="fa-light fa-clock" />
            <span>{createdAt}</span>
          </div>
          <div className="single-meta">
            <i className="fa-regular fa-folder" />
            <span>{blogCategory}</span>
          </div>
        </div>
        <Link href={`/blog/${Slug}`}>
          <h4 className="title">
            {blogTitle ? blogTitle : "How to growing your business"}
          </h4>
        </Link>
        <a href={`/blog/${Slug}`} className="shop-now-goshop-btn">
          <span className="text">Read Details</span>
          <div className="plus-icon">
            <i className="fa-sharp fa-regular fa-plus" />
          </div>
          <div className="plus-icon">
            <i className="fa-sharp fa-regular fa-plus" />
          </div>
        </a>
      </div>
    </>
  );
};

export default BlogGridMain;
