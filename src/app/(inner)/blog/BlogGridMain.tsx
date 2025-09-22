"use client";
import React from "react";
import Link from "next/link";

interface BlogGridMainProps {
  slug: string;
  blogImage: string;
  blogTitle?: string;
  createdAt?: string;
  blogCategory?: string;
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  slug,
  blogImage,
  blogTitle,
  createdAt,
  blogCategory,
}) => {
  return (
    <>
      <Link href={`/blog/${slug}`} className="thumbnail">
        <div style={{ width: "100%", height: "200px" }}>
          <img
            src={blogImage}
            alt="blog-area"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </Link>
      <div className="inner-content-body">
        <div className="tag-area">
          <div className="single">
            <i className="fa-light fa-clock" />
            <span>{createdAt?.slice(0, 9)}</span>
          </div>
          <div className="single">
            <i className="fa-light fa-folder" />
            <span>{blogCategory}</span>
          </div>
        </div>
        <a className="title-main" href={`/blog/${slug}`}>
          <h3 className="title animated fadeIn">
            {blogTitle ? blogTitle : "How to growing your business"}
          </h3>
        </a>
        <div className="button-area">
          <a
            href={`/blog/${slug}`}
            className="rts-btn btn-primary radious-sm with-icon"
          >
            <div className="btn-text">Read Details</div>
            <div className="arrow-icon">
              <i className="fa-solid fa-circle-plus" />
            </div>
            <div className="arrow-icon">
              <i className="fa-solid fa-circle-plus" />
            </div>
          </a>
        </div>
      </div>
    </>
  );
};

export default BlogGridMain;
