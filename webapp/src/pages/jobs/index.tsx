import Head from "next/head";
import dynamic from "next/dynamic";
import Layout from "@/components/appbar/Layout";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

// Dynamically import JobTable
const JobTable = dynamic(() => import("@/components/jobs/JobTable"), {
  ssr: false,
});

function Home() {
  return (
    <>
      <Head>
        <title>Jobs Management</title>
        <meta
          name="description"
          content="Job Management UI built by Ammar Atique, Software Engineer Intern at Pixako. This app allows adding, deleting, editing, and viewing jobs (CRUD operations)."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <JobTable />
      </Layout>
    </>
  );
}

export default Home;

export const getServerSideProps = withPageAuthRequired();
