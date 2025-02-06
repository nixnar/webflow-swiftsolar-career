import React from "react";

export default function SingleEntry({ job }) {
  return (
    <div className="pt-3 pb-6 ml-6 border-b-[1px] border-grayBorder max-[766px]:pt-1 max-[766px]:pb-3">
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className=" flex max-[766px]:flex-col justify-between hover:text-[#fa4f20] transition-all duration-300 w-full"
      >
        <h3 className="">{job.title}</h3>

        <h3 className="text-nowrap text-[#a3a3a3] max-[766px]:mt-[-0.5rem]">
          {job.location}
        </h3>
      </a>
    </div>
  );
}
