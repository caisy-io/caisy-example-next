import { gql, GraphQLClient } from "graphql-request";
import { GetStaticProps } from "next";
import { RichTextRenderer } from "@caisy/rich-text-react-renderer";

const client = new GraphQLClient(
  `https://cloud.caisy.io/api/v3/e/${process.env.CAISY_PROJECT_ID}/graphql`,
  {
    headers: {
      "x-caisy-apikey": process.env.CAISY_API_KEY!,
    },
  }
);

export default function BlogPage({
  title,
  text,
}: {
  title: string;
  text: { json: any };
}) {
  return (
    <>
      <h1>{title}</h1>
      {text?.json && <RichTextRenderer node={text?.json} />}
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const gqlResponse = await client.request(
    gql`
      query allBlogArticle($slug: String) {
        allBlogArticle(where: { slug: { eq: $slug } }) {
          edges {
            node {
              text {
                json
              }
              title
              slug
              id
            }
          }
        }
      }
    `,
    { slug: params?.slug }
  );

  return {
    props: gqlResponse?.allBlogArticle?.edges?.[0]?.node || {},
  };
};

export async function getStaticPaths() {
  const gqlResponse = await client.request(
    gql`
      query {
        allBlogArticle {
          edges {
            node {
              slug
            }
          }
        }
      }
    `
  );

  const paths: { params: { slug: string } }[] = [];

  gqlResponse?.allBlogArticle?.edges?.forEach(
    (edge: { node: { slug?: string } }) => {
      if (edge?.node?.slug) {
        paths.push({ params: { slug: edge.node.slug } });
      }
    }
  );

  return {
    paths,
    fallback: true,
  };
}
