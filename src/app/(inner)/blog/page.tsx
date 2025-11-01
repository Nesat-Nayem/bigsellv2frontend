"use client";

import React, { useState } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import BlogGridMain from "./BlogGridMain";
import { IBlogs, useGetBlogsQuery } from "@/store/blogsApi";
import { useRouter } from "next/navigation";
import HeaderThree from "@/components/header/HeaderThree";
import { Placeholder, Card, Row, Col, Container } from "react-bootstrap";

export default function BlogGridPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const { data: blogData, isLoading, error } = useGetBlogsQuery();
  const router = useRouter();

  const totalPages = blogData ? Math.ceil(blogData.length / postsPerPage) : 1;
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts =
    blogData?.slice(startIndex, startIndex + postsPerPage) || [];

  const goToDetails = (id: string) => {
    router.push(`/blog/${id}`);
  };

  // ✅ Improved Skeleton Grid
  if (isLoading) {
    return (
      <div className="demo-one">
        <HeaderThree />

        <Container className="py-5">
          <Row className="g-4">
            {[...Array(postsPerPage)].map((_, index) => (
              <Col key={index} xl={3} lg={4} md={6} sm={12}>
                <Card className="h-100 shadow-sm">
                  <Placeholder
                    as={Card.Img}
                    variant="top"
                    animation="wave"
                    className="w-100"
                    style={{ height: "200px" }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <Placeholder xs={4} animation="wave" />
                      <Placeholder xs={3} animation="wave" />
                    </div>
                    <Placeholder
                      as={Card.Title}
                      animation="wave"
                      className="mb-3"
                    >
                      <Placeholder xs={8} />
                    </Placeholder>
                    <Placeholder.Button variant="primary" xs={6} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        <ShortService />
        <FooterOne />
      </div>
    );
  }

  if (error) return <div>Error loading blog posts...</div>;

  return (
    <div className="demo-one">
      <HeaderThree />

      {/* Breadcrumb */}
      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <a href="/">Home</a>
                <i className="fa-regular fa-chevron-right" />
                <span className="current">Blog Grid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-seperator bg_light-1">
        <div className="container">
          <hr className="section-seperator" />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="rts-blog-area rts-section-gap bg_white bg_gradient-tranding-items">
        <div className="container">
          <div className="row g-5">
            {currentPosts.map((post: IBlogs) => (
              <div
                key={post._id}
                className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
              >
                <div
                  className="single-blog-style-card-border cursor-pointer"
                  onClick={() => goToDetails(post._id)}
                >
                  <BlogGridMain
                    slug={post._id}
                    blogImage={post.image}
                    blogTitle={post.title}
                    createdAt={post.createdAt}
                    blogCategory={post.category}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="row mt--50">
            <div className="col-lg-12">
              <div className="pagination-area-main-wrappper">
                <ul>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i}>
                      <button
                        className={currentPage === i + 1 ? "active" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {(i + 1).toString().padStart(2, "0")}
                      </button>
                    </li>
                  ))}
                  {currentPage < totalPages && (
                    <li>
                      <button onClick={() => setCurrentPage(currentPage + 1)}>
                        <i className="fa-regular fa-chevrons-right" />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}
