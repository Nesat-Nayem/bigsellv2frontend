"use client";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { useGetBlogByIdQuery, useGetBlogsQuery } from "@/store/blogsApi";
import { useParams } from "next/navigation";

export default function Home() {
  const { slug } = useParams(); // Get the ID from URL parameters
  const { data: blogPost, isLoading, error } = useGetBlogByIdQuery(slug as string);
  const { data: allBlogs } = useGetBlogsQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !blogPost) {
    return <div>Post not found!</div>;
  }

  return (
    <div className="demo-one">
      <HeaderOne />

      <div className="blog-sidebar-area rts-section-gap">
        <div className="container">
          <div className="row">
            {/* Blog Content */}
            <div className="col-lg-8 order-lg-1 order-md-2 order-sm-2 order-2">
              <div className="blog-details-area-1">
                <div className="thumbnail">
                  <img
                    src={blogPost.image}
                    alt={blogPost.title}
                  />
                </div>
                <div className="body-content-blog-details">
                  <div className="top-tag-time">
                    <div className="single">
                      <i className="fa-solid fa-clock" />
                      <span>{new Date(blogPost.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="single">
                      <i className="fa-solid fa-folder" />
                      <span>{blogPost.category}</span>
                    </div>
                  </div>
                  <h1 className="title">{blogPost.title}</h1>
                  <p className="disc">
                    {blogPost.shortDesc}
                  </p>

                  <div 
                    className="disc" 
                    dangerouslySetInnerHTML={{ __html: blogPost.longDesc }}
                  />
                  <p className="quote">
                    “Integer posuere odio ullamcorper semper eu bibendum,
                    sodales pharetra ac ornare proin auctor, quis phasellus
                    curae fusce magnis. Molestie tempus fusce nullam feugiat
                    nibh praesent porttitor, hac per natoque risus vivamus
                    penatibus mi posuere, parturient congue non tempor gravida
                    aliquet”
                  </p>
                  <p className="disc">
                    Molestie vestibulum sagittis torquent eget potenti diam
                    vehicula, habitant a eros fusce urna penatibus tempus
                    ultrices, mollis euismod montes porttitor curabitur
                    senectus. Sagittis dis libero felis montes scelerisque quis
                    dapibus tempus massa est elementum, ad congue tortor
                    facilisi phasellus mus dictum purus per pretium. Tincidunt
                    conubia mus in natoque quam proin faucibus congue, mattis
                    purus placerat porta arcu nam platea class.
                  </p>

                  <p className="disc">
                    Quisque curabitur vestibulum feugiat class natoque interdum
                    lacus, himenaeos tellus diam vulputate cursus ultricies
                    magna, cum tortor ullamcorper aliquet libero hendrerit.
                    Montes tortor primis fringilla torquent iaculis dictumst
                    vestibulum leo accumsan lacus himenaeos imperdiet, erat
                    risus nullam nulla libero in magna curabitur nisi
                    scelerisque vivamus tempor condimentum, ad eleifend magnis
                    justo sed sociis ornare ante phasellus ac euismod.
                  </p>

                  <div className="tag-social-share-wrapper-area-wrapper">
                    <div className="tags-area">
                      <span>Tags</span>
                      <button>Organic</button>
                      <button>Rings</button>
                      <button>Birthday</button>
                    </div>
                    <div className="social-icons">
                      <span>Social Icon</span>
                      <ul>
                        <li>
                          <a href="#">
                            <i className="fa-brands fa-facebook-f" />
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i className="fa-brands fa-twitter" />
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i className="fa-brands fa-instagram" />
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i className="fa-brands fa-dribbble" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="blog-details-author">
                    <div className="thumbnail">
                      <img src="/assets/images/blog/01.png" alt="" />
                    </div>
                    <div className="author-information">
                      <span>Author</span>
                      <h5 className="title">Venilla Walton</h5>
                      <p>Donec sollicitudin molestie malesuada…</p>
                      <div className="social">
                        <ul>
                          <li>
                            <a href="#">
                              <i className="fa-brands fa-dribbble" />
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i className="fa-brands fa-facebook-f" />
                            </a>
                          </li>
                          <li>
                            <a href="#">
                              <i className="fa-brands fa-instagram" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="comment-replay-area-start">
                    <h3 className="title">03 Comments</h3>
                    <div className="single-comment-area">
                      <div className="thumbanil">
                        <img src="/assets/images/blog/02.png" alt="comment" />
                      </div>
                      <div className="comment-information">
                        <div className="top-area">
                          <div className="left">
                            <span>Sep 25, 2025</span>
                            <h5 className="title">Amalia Genner</h5>
                          </div>
                          <div className="replay">
                            <span>Replay</span>
                          </div>
                        </div>
                        <p className="disc">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Vivamus magna justo, lacinia eget consectetur
                          sed convallis at tellus ivamus suscipit tortor eget
                          felis porttitor volutpat.
                        </p>
                      </div>
                    </div>
                    <div className="single-comment-area bottom pl--100 pl_sm--0 mt--50 pt--50">
                      <div className="thumbanil">
                        <img src="/assets/images/blog/03.png" alt="comment" />
                      </div>
                      <div className="comment-information">
                        <div className="top-area">
                          <div className="left">
                            <span>Sep 25, 2025</span>
                            <h5 className="title">Amalia Genner</h5>
                          </div>
                          <div className="replay">
                            <span>Replay</span>
                          </div>
                        </div>
                        <p className="disc">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Vivamus magna justo, lacinia eget consectetur
                          sed convallis at tellus ivamus suscipit tortor eget
                          felis porttitor volutpat.
                        </p>
                      </div>
                    </div>
                    <div className="contact-form-wrapper-1 mt--50">
                      <h3 className="title mb--20">Add a Review</h3>
                      <p>
                        Your email address will not be published. Required
                        fields are marked*
                      </p>
                      <form action="#" className="contact-form-1">
                        <div className="contact-form-wrapper--half-area">
                          <div className="single">
                            <input type="text" placeholder="name*" />
                          </div>
                          <div className="single">
                            <input type="text" placeholder="Email*" />
                          </div>
                        </div>
                        <textarea
                          name="message"
                          placeholder="Write Message Here"
                          defaultValue={""}
                        />
                        <button className="rts-btn btn-primary mt--20">
                          Submit Now
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 pl--60 order-lg-2 order-md-1 order-sm-1 order-1 pl_md--10 pl_sm--10 rts-sticky-column-item">
              <div className="blog-sidebar-single-wized">
                <form action="#">
                  <input type="text" placeholder="Search Here" required />
                  <button>
                    <i className="fa-regular fa-magnifying-glass" />
                  </button>
                </form>
              </div>

              <div className="blog-sidebar-single-wized with-title">
                <h4 className="title">Categories</h4>
                <div className="category-main-wrapper">
                  <div className="single-category-area">
                    <p>Baking Material</p>
                  </div>
                  <div className="single-category-area">
                    <p>Bread and Juice</p>
                  </div>
                  <div className="single-category-area">
                    <p>Clothing & Beauty</p>
                  </div>
                  <div className="single-category-area">
                    <p>Fresh Vegetable</p>
                  </div>
                  <div className="single-category-area">
                    <p>Fresh Seafood</p>
                  </div>
                  <div className="single-category-area">
                    <p>Milks and Daires</p>
                  </div>
                  <div className="single-category-area">
                    <p>Wine & Drinks</p>
                  </div>
                </div>
              </div>

              <div className="blog-sidebar-single-wized with-title">
                <h4 className="title">Latest Post</h4>
                <div className="latest-post-small-area-wrapper">
                  {allBlogs?.slice(0, 3).map((blog) => (
                    <div className="single-latest-post-area" key={blog._id}>
                      <a href={`/blog/${blog._id}`} className="thumbnail">
                        <img
                          src={blog.image}
                          alt="thumbnail"
                        />
                      </a>
                      <div className="inner-content-area">
                        <div className="icon-top-area">
                          <i className="fa-light fa-clock" />
                          <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <a href={`/blog/${blog._id}`}>
                          <h5 className="title-sm-blog">
                            {blog.title}
                          </h5>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="blog-sidebar-single-wized with-title">
                <h4 className="title">Tags</h4>
                <div className="tags-area-blog-short-main">
                  {[
                    "Shampoo",
                    "Butter",
                    "Birthday",
                    "Gifts",
                    "Facial",
                    "Green",
                    "Lotion",
                    "Scrub",
                  ].map((tag, idx) => (
                    <button key={idx} className="single-category">
                      {tag}
                    </button>
                  ))}
                </div>
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
