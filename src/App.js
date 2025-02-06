import React from "react";
import "./style.css";
import SingleEntry from "./SingleEntry";

const App = () => {
  const [data, setData] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        // parallel fetch jobs/departments
        const [jobsResponse, deptsResponse] = await Promise.all([
          fetch(
            "https://boards-api.greenhouse.io/v1/boards/swiftsolar/jobs?content=true"
          ),
          fetch(
            "https://boards-api.greenhouse.io/v1/boards/swiftsolar/departments"
          ),
        ]);

        const jobsData = await jobsResponse.json();
        const deptsData = await deptsResponse.json();

        setData(jobsData);
        setDepartments(deptsData.departments);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  //loading. TODO: ask if need ghost UI
  if (isLoading || !data.jobs) {
    return <div>Loading.</div>;
  }

  //structure
  const structuredDepartments = [];
  const deptMap = new Map();

  //create map of all dep by ids
  departments.forEach((dept) => {
    deptMap.set(dept.id, {
      name: dept.name,
      jobs: [],
      id: dept.id,
      parent_id: dept.parent_id,
    });
  });

  //map jobs
  data.jobs.forEach((job) => {
    const dept = job.departments[0];
    const jobData = {
      title: job.title,
      location: job.offices[0].name,
      url: job.absolute_url,
    };

    const currentDept = deptMap.get(dept.id);
    const parentDept = dept.parent_id ? deptMap.get(dept.parent_id) : null;

    if (currentDept) {
      if (!currentDept.jobs) currentDept.jobs = [];
      currentDept.jobs.push(jobData);
    }
  });
  //debug
  //console.log("Department Map as object:", Object.fromEntries(deptMap));

  // first setup children arrays
  deptMap.forEach((dept) => {
    if (dept.parent_id) {
      const parentDept = deptMap.get(dept.parent_id);
      if (parentDept) {
        if (!parentDept.children) parentDept.children = [];
        // add child if only has jobs
        if (dept.jobs?.length > 0) {
          parentDept.children.push(dept);
        }
      }
    }
  });

  // second add root depts
  deptMap.forEach((dept) => {
    if (!dept.parent_id) {
      //add if has jobs or children
      if (
        dept.jobs?.length > 0 ||
        (dept.children && dept.children.length > 0)
      ) {
        structuredDepartments.push(dept);
      }
    }
  });

  return (
    <div className="tailwind newborder">
      <div className="max-w-[1440px] w-full grow">
        {structuredDepartments.map((department) => (
          <div
            key={department.name}
            className="pb-8 pt-4 w-full max-[766px]:pb-[1rem]"
          >
            <div className="bg-graybackground p-3 pt-[2px] w-full">
              <h3>{department.name}</h3>
            </div>

            {department.children
              ? // children jobs
                department.children.map((childDept) => (
                  <div key={childDept.name} className="w-full">
                    <div className="pt-6">
                      <h3 className="text-[#474747]">{childDept.name}</h3>
                    </div>
                    {childDept.jobs.map((job) => (
                      <SingleEntry key={job.url} job={job} />
                    ))}
                  </div>
                ))
              : // root jobs
                department.jobs.map((job) => (
                  <SingleEntry key={job.url} job={job} />
                ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
