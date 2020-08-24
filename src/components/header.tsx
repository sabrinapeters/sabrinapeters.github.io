import Head from "next/head";

const ogImageUrl = "https://notion-blog.now.sh/og-image.png";

const CustomHead = ({ titlePre = "" }) => {
  return (
    <header>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ""} My Notion Blog</title>
        <meta
          name="description"
          content="An example Next.js site using Notion for the blog"
        />
        <meta name="og:title" content="My Notion Blog" />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@_ijjk" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
    </header>
  );
};

export default CustomHead;
