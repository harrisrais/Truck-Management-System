import React, { useEffect, useState } from "react";
import JobForm from "@/components/jobs/jobFormComponents/JobForm";
import type IJobFormState from "@/entities/types/jobTypes";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useJobs } from "@/contexts/JobsContext";
import Layout from "@/components/appbar/Layout";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const EditJobPage: React.FC = () => {
  const router = useRouter();
  const { jobId } = router.query;

  const { getJobById } = useJobs();
  const [jobData, setJobData] = useState<IJobFormState | null>(null);

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        try {
          const job = await getJobById(jobId as string);
          if (job) {
            setJobData(job);
          } else {
            console.warn("Job not found with ID:", jobId);
            setJobData(null);
          }
        } catch (error) {
          console.error("Failed to fetch job:", error);
          setJobData(null);
        }
      };
      fetchJob();
    }
  }, [jobId, getJobById]);

  return (
    <Layout>
      {jobData ? (
        <JobForm
          open={true}
          onClose={() => window.history.back()}
          initialDataForEdit={jobData}
          isEdit={true}
          asPage={true}
        />
      ) : (
        <Typography variant="body1" sx={{ p: 2 }}>
          Loading job data...
        </Typography>
      )}
    </Layout>
  );
};

export default EditJobPage;

export const getServerSideProps = withPageAuthRequired();
