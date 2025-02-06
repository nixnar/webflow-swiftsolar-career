import React from "react";
import "./style.css";
import SingleEntry from "./SingleEntry";
const App = () => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://boards-api.greenhouse.io/v1/boards/swiftsolar/jobs?content=true"
      );
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  // First, let's group jobs by department and create a structured array
  const departments = [];

  // Add loading and error handling
  if (!data.jobs) {
    return <div>Loading...</div>;
  }

  // Track unique department parent/child relationships
  const deptMap = new Map();

  // Process each job
  data.jobs.forEach((job) => {
    const dept = job.departments[0];

    // Get or create parent department
    let parentDept = deptMap.get(dept.parent_id);
    if (!parentDept && dept.parent_id) {
      parentDept = {
        name:
          dept.parent_id === 4003267008
            ? "Engineering"
            : dept.parent_id === 4003276008
            ? "R&D"
            : "General",
        jobs: [],
      };
      departments.push(parentDept);
      deptMap.set(dept.parent_id, parentDept);
    }

    // Get or create child department
    let childDept = deptMap.get(dept.id);
    if (!childDept) {
      childDept = {
        name: dept.name,
        jobs: [],
      };
      // Add to parent if exists, otherwise add to root
      if (parentDept) {
        if (!parentDept.children) parentDept.children = [];
        parentDept.children.push(childDept);
      } else {
        departments.push(childDept);
      }
      deptMap.set(dept.id, childDept);
    }

    // Add job to appropriate department
    const jobData = {
      title: job.title,
      location: job.offices[0].name,
      url: job.absolute_url,
    };

    if (parentDept) {
      childDept.jobs.push(jobData);
    } else {
      childDept.jobs.push(jobData);
    }
  });

  return (
    <div className="tailwind newborder">
      <div className="max-w-[1440px] w-full grow">
        {departments.map((department) => (
          <div
            key={department.name}
            className="pb-8 pt-4 w-full max-[766px]:pb-[1rem]"
          >
            <div className="bg-graybackground p-3 pt-[2px] w-full">
              <h3>{department.name}</h3>
            </div>

            {department.children
              ? // Parent department with children
                department.children.map((childDept) => (
                  <div key={childDept.name} className="w-full">
                    <div className="pt-6">
                      <h3 className="text-[#474747]">{childDept.name}</h3>
                    </div>
                    {childDept.jobs.map((job) => (
                      <SingleEntry job={job} />
                    ))}
                  </div>
                ))
              : // Department without children
                department.jobs.map((job) => <SingleEntry job={job} />)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
